var exp = process.argv[2];


var parser = require('./parser');

console.log(parser.parse(exp));