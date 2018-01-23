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
var file = 'data.json'
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

	blink(10);
	wpi.digitalWrite(11,0);		//LED off
	wpi.digitalWrite(10, 0);	//LED off
    setInterval(buttonpress,500);
}

function blink(LED){
		// var LED;
		var a =1;
		var b = a%2;
		a++;
		// console.log(LED);
		setTimeout(function(){
			blink(LED)
		},300);
		// setTimeout(function(){
		// 	wpi.digitalWrite(LED, 1);
		// },1000);
		// setTimeout(function(){
		// 	wpi.digitalWrite(LED, 0);
		// },500);

		wpi.digitalWrite(LED, b);
	}


function buttonpress(button){
	wpi.pinMode(9, wpi.INPUT); //button
	wpi.pullUpDnControl(9, wpi.PUD_UP)
	var button = wpi.digitalRead(9);
	var a = 0;
	var i = 1;
	// console.log('button',button);
	if(button == 0){ 
		 // console.log('button',button);
		for (i = 0; i < 5; i ++){
			 setTimeout(function(){
				var b = a%2;
				a++;
			 	wpi.digitalWrite(11, b);	//LED off
			 },100);
			i++;
		}
		button = 1;
		Fti_Locate();	
	}
	GPIO();
}

// ####################################################################
// GPIO blinking 
// ####################################################################
function main() {
	// wpi.setup('gpio'); //wpi-node uses pin initialization GPIO
	// wpi.pinMode(9, wpi.INPUT); //button
	// wpi.pullUpDnControl(9, wpi.PUD_UP)
	// var button = wpi.digitalRead(9);

	    GPIO();
	    // exit();
}

// ####################################################################
// writer() writes data to file
//async method nesting the file writing function inside of this function
//must nest callback in order for stack to move out of scope
// ####################################################################
function writer(Obj_Type,data, DataSize)
{
	var netinfo= [];
	var netinfo_json= [];
	for(var prop in data[1]){
		    // console.log('key = ', prop);
		    // console.log('value = ', data[0][prop]);
		    netinfo.push(prop,data[0][prop]);
		    netinfo_json.push(prop,data[0][prop], "\n");
		}
	// console.log('writer has been hit')
	child = exec("date", function (error, stdout) {
	  fs.appendFile(path,'\n'+stdout+Obj_Type+'\n'+netinfo+'}'+'\n',function(err){});
	   if (error !== null) {
	    console.log('exec error: ' + error);
	    return;
	  }
	  jsonfile.writeFile(file,stdout + Obj_Type + netinfo_json, {flag: 'a'}, function (err) {
		  console.error(err)
		})
	});
}

// ####################################################################
// Locats and logs Arm scope data
// ####################################################################
function Fti_Locate(){
	'use strict'
	var arloc = fti.ArmFind
	console.log('scaning for arm devices')
	var ArmLocator = arloc.ArmLocator;
	ArmLocator.scan(3000,function (devlist) {
		writer('devlist {',devlist,devlist[10]);
		setTimeout(function(){process.exit(-1)},1000);
	});
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
