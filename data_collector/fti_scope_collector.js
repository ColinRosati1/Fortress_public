// ####################################################################
// uses BCM pinout
// data_collector.js uses FTI Flash calls to:
//		* scan available detectors
// 		* netpoll
// 		* log data from scope, log scan


// TODO use Dan's app to look out how scope data is handled, model that

// TODO connect head to photo eye and test data, ask Bin for help
// how to connect a photo eye scope???
	// -what is a scope?
	// 	scope is the range of data from a stream of current coming from a photo eye.

	// -photo eye: 
	// A photoelectric sensor, or photo eye, is an equipment used to discover the distance, absence, or presence
 // 	of an object by using a light transmitter, often infrared, and a photoelectric receiver.
 // 	-output a stream of measurable voltage

 // connect to 3 ARM devices locally through ethernet cables via fti_scope 
 		// 1. Stealth head, or whatever head
 		// 2. DSP
 		// 3. photo eye

// connectivity test from fti arm gem command:

// IP recieved:
// 	192.168.33.105 ??
// 	192.168.33.50  my mac's second ip address

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

// sets the values for pin HIGH and LOW.  
const HIGH = 1;
const LOW = 0;
var secTimeout = 2000;
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
		var a =1;
		var b = a%2;
		a++;
		setTimeout(function(){
			blink(LED)
		},200);

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
		Fti_Scope();	
	}
	GPIO();
}


// ####################################################################
// GPIO blinking 
// ####################################################################
function main() {
	var i = 0, blinkTime = 10, v = 1;
	var button = wpi.digitalRead(9);
	wpi.digitalWrite(11, 1);
    wpi.digitalWrite(10, 1);
    GPIO();
    // Fti_Locate();
  
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

	console.log('writer has been hit')
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
// GPIO closes pins
// ####################################################################
function exit()
{
	// This is from another library but you need to find how to unexport form this GPIO closure
	// wpi.teardown(10, function(){
	// });
	// wpi.teardown(11, function(){
	// });
	// wpi.teardown(40, function(){
	// });
}

// ####################################################################
// Locats and logs Arm scope data
// ####################################################################
function Fti_Locate(){
	'use strict'
	var arloc = fti.ArmFind
	var ArmRpc = fti.ArmRpc;
	var ArmConfig = fti.ArmConfig;
	var FtiRpc = fti.Rpc.FtiRpc;
	var dgram = require('dgram');

	var dsp = FtiRpc.udp('192.168.47.20', 0,null);   //TODO Doesnt close, blocks
	var arm= new Fti.ArmRpc.ArmRpc('192.168.47.20');	//TODO Doesnt close, blocks
	arm.echo_cb(function(){
	
		arm.dsp_open_cb(function(){
			dsp.scope_comb_test(10, function(array){
				// writer('Scope data { ',array,array[10]);
			});
			setTimeout(function(){
			dsp.close();
			},4500)

		})			
	})

	var ArmLocator = arloc.ArmLocator;
	console.log('scaning for arm devices')
	ArmLocator.scan(1000,function (devlist) {
		
		// console.log(devlist);
		// writer('devlist {',devlist,devlist[10]);
	});
}

// ####################################################################
//  Arm scope data

// ####################################################################
function Fti_Scope(){
	'use strict'
	var arloc = fti.ArmFind
	var ArmRpc = fti.ArmRpc;
	var ArmConfig = fti.ArmConfig;
	var FtiRpc = fti.Rpc.FtiRpc;
	var dgram = require('dgram');

	var dsp = FtiRpc.udp('192.168.47.20', 0,null);   //TODO Doesnt close, blocks
	var arm= new Fti.ArmRpc.ArmRpc('192.168.47.20');	//TODO Doesnt close, blocks
	arm.echo_cb(function(){
	
		arm.dsp_open_cb(function(){
			dsp.scope_comb_test(10, function(array){
				// writer('Scope data { ',array,array[10]);
			});
			setTimeout(function(){
			dsp.close();
			},4500)

		})			
	})

	var ArmLocator = arloc.ArmLocator;
	console.log('scaning for arm devices')
	ArmLocator.scan(1000,function (devlist) {
		
		// console.log(devlist);
		// writer('devlist {',devlist,devlist[10]);
	});
}

main();