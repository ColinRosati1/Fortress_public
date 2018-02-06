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
var path = ("scopedatafile.txt");

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
 
    setTimeout(function (){
    	buttonpress()
    },100);

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
		Fti_Scope();
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
	var i = 0, blinkTime = 10, v = 1;
	var button = wpi.digitalRead(9);
	wpi.digitalWrite(11, 1);
    wpi.digitalWrite(10, 1);
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
	var netinfo_json= [];

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
	var dsp = '192.168.33.45';

	var ArmLocator = arloc.ArmLocator;
	ArmLocator.scan(5000,function(list){

		console.log('function returns no string = ' + JSON.stringify(list))
		for (var l in list){
			console.log(' ip = ',list[l]['ip']);
		}

		var dsp = FtiRpc.udp('192.168.33.45', 0,null); 
		dsp.scope_comb_test(3000, function(array){

		});
		// var arm= new Fti.ArmRpc.ArmRpc('192.168.33.105');	
		// arm.echo_cb(function(array){
		// 	console.log('you log this function', array);
		// 	writer('scope data '+ array);
		// 	// arm.dsp_open(function(){
				
		// 	// 	// 	// writer('Scope data { ',array,array[10]);
		// 	// 	// 	console.log('Scope data { ',array);
				
		// 	// 	setTimeout(function(){
		// 	// 		dsp.close();
		// 	// 	},5000)
		// 	// })			
		// });

	});

// var Demo = new HaloDemo();
// Demo.scan_for_dsp_board(function (e) {
// 	var ip = e[0].ip.split('.').map(function(e){return parseInt(e)});
// 	var nifip = e[0].nif_ip.split('.').map(function(e){return parseInt(e)});

// 	if(!((ip[0] == nifip[0]) && (ip[1] == nifip[1]) && (ip[2] == nifip[2]))){
// 		//dsp not visible
// 		console.log('dsp not visible')
// 		Demo.change_dsp_ip(function(){
			
// 			var n_ip = nifip;
// 			var n = n_ip[3] + 1;
// 			if(n==0||n==255){
// 			n = 50
// 			}
// 			dspip = [n_ip[0],n_ip[1],n_ip[2],n].join('.');
// 		});
// 	}else{
// 		dspip = ip.join('.');
// 		console.log('dsp visible = ', dspip)
// 	}
// 	// body...
// });



	// var dsp = FtiRpc.udp('dsp', 0,null); 
	// var arm= new Fti.ArmRpc.ArmRpc('192.168.33.105');	
	// arm.echo_cb(function(array){
	// 	console.log('you log this function', array);
	// 	writer('scope data '+ array);

	// 	// arm.dsp_open(function(){
	// 	// 	dsp.scope_comb_test(3000, function(array){
	// 	// 		// writer('Scope data { ',array,array[10]);
	// 	// 		console.log('Scope data { ',array);
	// 	// 	});
	// 	// 	setTimeout(function(){
	// 	// 		dsp.close();
	// 	// 	},5000)
	// 	// })			
	// });
		
	 
	// arm.dsp_open_cb(function(){
	// arm.dsp_open(function(){
	// 	dsp.scope_comb_test(3000, function(array){
	// 		// writer('Scope data { ',array,array[10]);
	// 		console.log('Scope data { ',array);
	// 	});
	// 	setTimeout(function(){
	// 		dsp.close();
	// 	},5000)
	// })			
}

main();