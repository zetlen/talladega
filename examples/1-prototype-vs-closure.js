const talladega = require('../');

const fn = `
	cal = new Driver("Cal", "Naughton", "Jr.", "Mike Honcho", "Shake and bake!");
	ricky = new Driver("Ricky", "Bobby", null, null, "If you ain't first, you're last.");
	assert.equal(cal.name(), "Cal Naughton, Jr.");
	assert.equal(cal.alias(), "Mike Honcho");
	assert.equal(ricky.name(), "Ricky Bobby");
	assert.equal(ricky.motto(), "If you ain't first, you're last.");
	cal = null;
	ricky = null;
`;

const specs = module.exports = [
	{
		name: 'prototype',
		setup: `
		var assert = require("assert");
		var cal, ricky;
		function Driver(first, last, suffix, aka, says) {
			this.first = first;
			this.last = last;
			this.suffix = suffix;
			this.aka = aka;
			this.says = says;
		}
		Driver.prototype.name = function() {
			var n = this.first + " " + this.last;
			if (this.suffix) {
				n += ", " + this.suffix;
			}
			return n;
		};
		Driver.prototype.alias = function() {
			return this.aka;
		};
		Driver.prototype.motto = function() {
			return this.says;
		};
		`,
		fn
	},
	{
		name: 'closure',
		setup: `
		var assert = require("assert");
		var cal, ricky;
		function Driver(first, last, suffix, aka, says) {
			return {
				name: function() {
					var n = first + " " + last;
					if (suffix) {
						n += ", " + suffix;
					}
					return n;
				},
				alias: function() {
					return aka;
				},
				motto: function() {
					return says;
				}
			};
		}
		`,
		fn
	}
];

talladega('Prototype pattern versus closure export pattern', specs);
