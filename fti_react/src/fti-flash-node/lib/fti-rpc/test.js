var arloc = require('./arm_find.js');

arloc.ArmLocator.scan(3000, function(e){
	console.log(e);
});