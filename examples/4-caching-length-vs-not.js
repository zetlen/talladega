const talladega = require('../');

const setup = `
	var emporium = [
		'Those that belong to the emperor',
		'Embalmed ones',
		'Those that are trained',
		'Sucking pigs',
		'Mermaids (or Sirens)',
		'Fabulous ones',
		'Stray dogs',
		'Those that are included in this classification',
		'Those that tremble as if they were mad',
		'Innumerable ones',
		'Those drawn with a very fine camel hair brush',
		'Et cetera',
		'Those that have just broken the flower vase',
		'Those that, at a distance, resemble flies'
	];
`

talladega('Caching length in for loops versus not', [
	{
		name: 'cache length',
		setup,
		fn: `
		var sum = 0;
		for (var i = emporium.length - 1; i >= 0; i--) {
			sum += emporium[i].length;
		}
		return sum;
		`
	},
	{
		name: 'do not cache length',
		setup,
		fn: `
		var sum = 0;
		for (var i = 0; i < emporium.length; i++) {
			sum += emporium[i].length;
		}
		return sum;
		`
	}
]);
