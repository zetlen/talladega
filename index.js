const path = require('path');
const childProcess = require('child_process');
const platform = require('platform');
const blessed = require('blessed');
const blessedContrib = require('blessed-contrib');
const Benchmark = require('benchmark');
const tween = require('xstream/extra/tween').default;

const runner = path.join(__dirname, 'run-benchmark.js');

module.exports = function compareBenchmarks(name, specs, timeout) {

	function getLoaderData(percent, benchmarks) {
		return percent >= 99 ?
			[{
			percent: 99,
			label: 'This is taking a while...',
			color: 'red'
		}]
		:
			[{
			percent,
			label: 'Running ' + benchmarks.length + ' benchmarks...',
			color: 'cyan'
		}];
	}
	timeout = timeout || 6000;

	const screen = blessed.screen();
	screen.title = name;

	const grid = new blessedContrib.grid({
		rows: 16,
		cols: 16,
		screen
	});

	const logger = grid.set(12, 0, 4, 16, blessed.log);

	const loader = grid.set(0, 0, 12, 16, blessedContrib.donut, {
		label: name,
		radius: 30,
		arcWidth: 10,
		remainColor: 'black',
		yPadding: 2,
		data: getLoaderData(0, specs)
	});
	const start = Date.now();
	const loaderUpdate = setInterval(() => {
		loader.setData(
			getLoaderData((Date.now() - start) / timeout * 100, specs)
		);
		screen.render();
	}, 200);

	screen.render();

	logger.log(platform.description);

	function benchmark(config) {
		return new Promise((resolve, reject) => {
			const worker = childProcess.fork(runner);
			worker.on('message', (message) => {
				if (message.type === 'complete') {
					const fakemark = Object.create(Benchmark.prototype);
					resolve(Object.assign(fakemark, message.data));
				} else if (message.type === 'error') {
					reject(Error(message.data));
				} else {
					logger.log(`[${config.name}]: ${message}`);
				}
			});
			worker.on('error', reject);
			worker.send({ type: 'benchmark', config });
		});
	}

	return Promise.all(specs.map(benchmark)).then((results) => {
		const fastest = Benchmark.filter(results, 'fastest')[0];
		const data = results.reduce((out, mark) => {
			out.titles.push(mark.name);
			out.data.push(Math.round(mark.hz));
			return out;
		}, { titles: [], data: [] });
		clearInterval(loaderUpdate);
		screen.remove(loader);
		const barChart = grid.set(0, 0, 12, 16, blessedContrib.bar, {
			label: name,
			showText: true,
			barWidth: 30,
			barSpacing: 3,
			barBgColor: 'cyan',
			barFgColor: 'cyan',
			xOffset: 2,
			maxHeight: fastest.hz
		});
		tween({
			from: 0,
			to: fastest.hz,
			ease: tween.power2.easeInOut,
			duration: 300
		}).addListener({
			next: (x) => {
				barChart.setData({
					titles: data.titles,
					data: data.data.map((n) => Math.min(n, x))
				});
				screen.render();
			},
			error: (err) => logger.log(error),
			complete: () => {
				barChart.setData(data);
				results.forEach((result) => logger.log(result.toString()));
				if (fastest) {
					logger.log('\n');
					logger.log(fastest.name + ' was fastest!');
				}
				screen.render();
			}
		});
	}).catch((wat) => {
		screen.destroy();
		console.error(wat);
		process.exit(1);
	});
}
