const compareBenchmarks = require('../');

compareBenchmarks(
	'String concatenation vs. array join',
	[
		{
			name: 'array join',
			fn: '["Shake ", "and ", "bake!"].join("")'
		},
		{
			name: 'string concat',
			fn: '"Shake " + "and "+ "bake!"'
		}
	]
);
