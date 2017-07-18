var path = require('path');
require('ts-node').register({
	project: path.resolve(__dirname, 'tsconfig.json'),
});

var generator = require('./typeGenerator').generator;
module.exports = {
	default: function (schema, baseDefinitions, definitions) {
		return generator(schema, baseDefinitions, definitions);
	},
}
