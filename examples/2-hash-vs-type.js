const talladega = require('../');

const setup = `
	global.assert = require('assert');
	global.makeTypesObject = function() {
		return {
			str: 'foo',
			num: 9,
			arr: ['an array of strings']
		};
	}
	global.validateTypesObject = function(o) {
		assert(o.str && o.num && !o.arr);
	}
`;

const teardown = `
	validateTypesObject(types);
`;

talladega('Hash mode vs hidden type', [
	{
		name: 'Consistently typed properties',
		setup,
		teardown,
		fn: `
			var types = makeTypesObject();
			types.str = 'new string';
			types.num = 10;
			types.arr = null;
		`
	},
	{
		name: 'Changing property types',
		setup,
		teardown,
		fn: `
			var types = makeTypesObject();
			types.str = 10;
			types.num = ['a new array of strings'];
			delete types.arr;
		`
	}
], { color: 'green' });
