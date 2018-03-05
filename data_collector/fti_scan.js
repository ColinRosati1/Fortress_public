// ####################################################################
// uses BCM pinout
// fti_scan.js uses FTI Flash calls to:
//		* scan available detectors
// 		* log data into datafile.txt

// ####################################################################
var fs = require('fs');
var wpi = require('wiringpi-node'); // create an instance of the wiringpi-node GPIO pin modes 
var fti = require('./fti/index.js');  // move all requires up top
var arloc = require('./fti/lib/fti-rpc/arm_find.js');
var BufferPack = require('bufferpack');
var NetInterface = require('./fti/lib/fti-rpc/net-interface.js');
var ds = require('./fti/lib/fti-rpc/rpc.js');
var Fti = require('./fti');
var sys = require('util')
var exec = require('child_process').exec;
var jsonfile = require('jsonfile')
var _ = require('lodash');
var child;
var path = ("datafile.txt");
 
// ####################################################################
// GPIO opens pins
// ####################################################################
function GPIO()
{
	wpi.setup('gpio'); //wpi-node uses pin initialization GPIO
	wpi.pinMode(10, wpi.OUTPUT); //LED
	wpi.pinMode(11, wpi.OUTPUT); //LED
	var a = 1;
	var i = 0;

	setInterval(function(){blink(10)},700);

	blink(10);


	wpi.digitalWrite(11,0);		//LED off
	wpi.digitalWrite(10, 0);	//LED off
    setTimeout(function (){
    	buttonpress()
    },100);
}

function blink(LED){
		var a =1;
		var b = a%2;
		a++;
		setTimeout(function(){
			// blink(LED)
		},1500);
		
		wpi.digitalWrite(LED, b);
	}


function buttonpress(){
	wpi.pinMode(9, wpi.INPUT); //button
	wpi.pullUpDnControl(9, wpi.PUD_UP)
	var button = wpi.digitalRead(9);

	wpi.pinMode(8, wpi.INPUT); //button
	wpi.pullUpDnControl(8, wpi.PUD_UP)
	var button_close = wpi.digitalRead(8);
	var a = 0;
	var i = 1;

	if(button == 0){ 
		for (i = 0; i < 5; i ++){
			 setTimeout(function(){
				var b = a%2;
				a++;
			 	wpi.digitalWrite(11, b);	//LED off
			 },100);
			i++;
		}
		Fti_Locate();
		
		
	}

		if(button_close == 0){ 
			for (i = 0; i < 5; i ++){
				 setTimeout(function(){
					var b = a%2;
					var c = (b + 1)%2;
					a++;
				 	wpi.digitalWrite(11, c);	//LED off
				 	wpi.digitalWrite(10, b);	//LED off
				 },100);
				i++;
			}
			setTimeout(function(){process.exit(-1)},2000);
		}	
	wpi.digitalWrite(11, 0);	//LED off
	wpi.digitalWrite(10, 0);	//LED off

	GPIO();
}




// ####################################################################
// GPIO blinking 
// ####################################################################
function main() {
	    GPIO();
	    
}

// ####################################################################
// writer() writes data to file
//async method nesting the file writing function inside of this function
//must nest callback in order for stack to move out of scope
// ####################################################################
function writer(Obj_Type,data, DataSize)
{
	var netinfo= [];
	child = exec("date", function (error, stdout) {
	  fs.appendFile(path,'\n'+stdout+Obj_Type+'\n'+netinfo+'}'+'\n',function(err){});
	   if (error !== null) {
	    console.log('exec error: ' + error);
	    return;
	  }
	});
}

// ####################################################################
// Locats and logs Arm scope data
// ####################################################################
function Fti_Locate(){
	'use strict'
	var Arm_Array = [];
	arloc.ArmLocator.scan(1500,function(list){
		var mylist= [JSON.stringify(list)];
		mylist.forEach(function(item) {
		  Arm_Array.push(item)
		});
	});
	setTimeout(function(e){
		writer(JSON.stringify(Arm_Array));
		console.log(Arm_Array);
		return
	},2000)

}

// ####################################################################
// GPIO closes pins
// ####################################################################
function exit()
{
	// This is from another library but you need to find how to unexport form this GPIO closure
	wpi.teardown(10, function(){
	});
	wpi.teardown(11, function(){
	});
	wpi.teardown(40, function(){
	});
}

main();
