const talladega = require('../');

talladega('String concatenation vs. array join', [
	{
		name: 'array join',
		fn: '["Shake ", "and ", "bake!"].join("")'
	},
	{
		name: 'string concat',
		fn: '"Shake " + "and "+ "bake!"'
	}
], { color: 'yellow' });
