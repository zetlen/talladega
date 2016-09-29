const Benchmark = require('benchmark');
global.require = require; // so that benchmarks can use require internally
function statsFrom(bench) {
	return {
		name: bench.name,
		hz: bench.hz,
		count: bench.count,
		cycles: bench.cycles,
		times: bench.times,
		stats: bench.stats,
		error: bench.error
	};
}
process.on('message', (m) => {
	if (m.type === 'benchmark') {
		if (m.config.beforeAll) {
			eval(m.config.beforeAll);
		}
		const benchmark = Benchmark(m.config);
		benchmark.on('error', (e) => {
			process.send({
				type: 'error',
				data: `[${m.config.name}]: ${e.message.toString()}: \n ${e.message.stack.toString()}`
			}, () => process.exit(0));
		});
		benchmark.on('complete', () => {
			process.send({
				type: 'complete',
				data: statsFrom(benchmark)
			}, () => process.exit(0));
		});
		benchmark.run();
	}
});
