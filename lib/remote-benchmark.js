const path = require('path');
const childProcess = require('child_process');
const Benchmark = require('benchmark');
const runner = path.join(__dirname, 'run-benchmark.js');
const optionTypes = {
	async: ['boolean','undefined'],
	defer: ['boolean','undefined'],
	delay: ['number','undefined'],
	id: ['string','undefined'],
	initCount: ['number','undefined'],
	maxTime: ['number','undefined'],
	minSamples: ['number','undefined'],
	minTime: ['number','undefined'],
	name: ['string'],
	fn: ['function','string'],
	setup: ['function','string','undefined'],
	teardown: ['function','string','undefined'],
	onAbort: ['function','string','undefined'],
	onComplete: ['function','string','undefined'],
	onCycle: ['function','string','undefined'],
	onError: ['function','string','undefined'],
	onReset: ['function','string','undefined'],
	onStart: ['function','string','undefined']
};
const optionNames = Object.keys(optionTypes);
const optionMessages = {
	name: 'Spec must have a \'name\' property to label the benchmark.',
	fn: 'Spec must have a \'fn\' property containing the actual code to benchmark. It can be a function or a string; in either case, it will be serialized and sent to the child process, so it cannot use any variables in its apparent scope.'
};
function validateOptionTypes(spec) {
	return optionNames.reduce((out, prop) => {
		if (optionTypes[prop].every((type) => typeof spec[prop] !== type)) {
			out.push(
				optionMessages[prop] || `'${prop}' option must be of type ${optionTypes[prop][0]}.`
			);
		}
		return out;
	}, []);
}
function singleQuote(str) {
	return `'${str}'`;
}
function validateAllPropsKnown(spec) {
	const unknown = Object.keys(spec).filter((prop) => !optionTypes[prop]).map(singleQuote);
	if (unknown.length === 0) {
		return [];
	}
	const inflection = unknown.length > 1 ? 'properties' : 'property';
	return [
		`Unknown ${inflection} ${unknown.join(', ')} found in spec. ` +
		`Valid properties are: ${optionNames.map(singleQuote).join(', ')}`
	];
}
function stringifyFunctions(spec) {
	return Object.keys(spec).reduce((out, prop) => {
		out[prop] = typeof spec[prop] === 'function' ? spec[prop].toString() : spec[prop];
		return out;
	}, {});
}
function validateSpec(spec) {
	if (!spec || typeof spec !== 'object') {
		throw Error(`A spec must be an object.`);
	}
	const optionErrors = validateOptionTypes(spec);
	const unknownPropErrors = validateAllPropsKnown(spec);
	const allErrors = optionErrors.concat(unknownPropErrors);
	if (allErrors.length > 0) {
		throw Error(`Invalid spec object: \n${allErrors}`);
	}
	return stringifyFunctions(spec);
}

module.exports = function RemoteBenchmark(spec) {
	const config = validateSpec(spec);
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
};
