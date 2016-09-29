const assert = require('assert');
const platform = require('platform');
const blessed = require('blessed');
const blessedContrib = require('blessed-contrib');
const Benchmark = require('benchmark');
const tween = require('xstream/extra/tween').default;
const RemoteBenchmark = require('./lib/remote-benchmark');

const defaults = {
	expectedTime: 6000,
	color: 'cyan'
};

module.exports = function talladega(name, specs, options) {
	assert(typeof name === 'string', 'First argument to talladega must be a name.');
	assert(
		Array.isArray(specs) && specs.length > 0,
		'Second argument to talladega must be an array of at least one spec to test.'
	);
	assert(specs.length > 0, `Specs array must not be empty.`);

	const opts = Object.assign({}, defaults, options || {});

	const benchmarks = specs.map(RemoteBenchmark);

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
			color: opts.color
		}];
	}

	const screen = blessed.screen();
	screen.title = name;

	const grid = new blessedContrib.grid({
		rows: 16,
		cols: 16,
		hideBorder: true,
		screen
	});

	const border = {
		type: 'line',
		fg: opts.color
	};

	const logger = grid.set(12, 0, 4, 16, blessed.log, { border: { type: 'bg' } });

	const loader = grid.set(0, 0, 12, 16, blessedContrib.donut, {
		label: name,
		radius: 30,
		arcWidth: 10,
		color: opts.color,
		remainColor: 'black',
		yPadding: 2,
		border: border,
		data: getLoaderData(0, specs)
	});
	const start = Date.now();
	const loaderUpdate = setInterval(() => {
		loader.setData(
			getLoaderData((Date.now() - start) / opts.expectedTime * 100, specs)
		);
		screen.render();
	}, 200);

	screen.render();

	logger.log(`${platform.description} and Benchmark.js ${Benchmark.version}`);

	return Promise.all(benchmarks).then((results) => {
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
			barBgColor: opts.color,
			barFgColor: opts.color,
			xOffset: 2,
			maxHeight: fastest.hz,
			border: border
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
				logger.log('\n');
				logger.log('Ctrl-C to exit.');
				screen.render();
			}
		});
	}).catch((wat) => {
		screen.destroy();
		console.error(wat);
		process.exit(1);
	});
}
