// ####################################################################
// uses BCM pinout
// data_collector.js uses FTI Flash calls to:
//		* scan available detectors
// 		* netpoll
// 		* log data from scope

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
var child;
var array = [];

// import ArmLocator from './fti/lib/fti-rpc/arm_find.js'
 
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
	var value = 1;
	console.log('opening GPIO pins');
	wpi.setup('gpio'); //wpi-node uses pin initialization GPIO
	wpi.pinMode(21, wpi.INPUT); //button
	wpi.pinMode(10, wpi.OUTPUT); //LED
	wpi.pinMode(11, wpi.OUTPUT); //LED

	wpi.digitalRead(21);		//read button
	wpi.digitalWrite(11,0);		//LED off
	wpi.digitalWrite(10, 0);	//LED off
}


// ####################################################################
// GPIO blinking 
// ####################################################################
function main() {
	var i = 0, blinkTime = 10, v = 1;
	setTimeout(function(){
	    wpi.digitalWrite(11, 1);
		wpi.digitalWrite(10, 1); 		//blinks LED
	},500);

	wpi.pinMode(21, wpi.INPUT); 		//button
    var button = wpi.digitalRead(21);	// reads button state
    console.log(button);				// write button state
    if(button == 0){ 					// if button pressed locat detectors with Fti_locate
    	wpi.digitalWrite(11, 1);
    	wpi.digitalWrite(10, 1);
    	Fti_Locate();	
    	return;
    }
    wpi.digitalWrite(11, 0);
    wpi.digitalWrite(10, 0);

    // WriteStream(path, options); // LOG SCOPE AND NETPOLL
}

// ####################################################################
// writer() writes data to file
//async method nesting the file writing function inside of this function
//must nest callback in order for stack to move out of scope
// ####################################################################
function writer(data)
{
	console.log('writer has been hit')
	child = exec("date", function (error, stdout) {
	  fs.appendFile(path,'\n'+stdout+"Scope Data =" +data+'\n',function(err){});
	   if (error !== null) {
	    console.log('exec error: ' + error);
	    return;
	  }
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

	/*var dsp = FtiRpc.udp('192.168.47.23');   // dsp address
	var arm= new Fti.ArmRpc.ArmRpc('192.168.47.23');
	arm.echo_cb(function(){
		console.log('echo');
		arm.dsp_open_cb(function(){
			console.log('dsp opened');
			dsp.scope_comb_test(10, function(array){
				writer(array);
			});
			setTimeout(function(){
			dsp.close();
			},4500)
		})			
	})*/

	var ArmLocator = arloc.ArmLocator;
	console.log('scaning for arm devices')
	ArmLocator.scan(1000,function (devlist) {
		// body...
		console.log('in call back');
		console.log(devlist)
	});

	/*ArmLocator.scan(function(){
		ArmLocator.scan(1000,array);
		console.log('scaning for arm devices',ArmLocator.scan(1000,array));

	})*/
	// fti.ArmFind.scan(10,array);
	// arloc.scan(10,array);
}

// ####################################################################
// Scan lookds for DSP boards
//from arm_find.js
// ####################################################################
function scan(secTimeout, callBack){
	var list = NetInterface.find(/^Ethernet|^en/);
	var devlist=[];
	var listeners = [];
	var senders = [];
	console.log('Scanning ...')
		list.forEach(function(nif,i){
			var listenerClient = new LocatorClient();;
			var senderClient = new LocatorClient();;
			senders[i] = dgram.createSocket('udp4');
			senders[i].bind(0, nif.ip , function() { senders[i].setBroadcast(true) 
			
			} );
			senders[i].on('error', function(err) {
			  console.log(err);
			});
			senders[i].on('message', function(msg,rinfo){
				console.log('msg');
				console.log(msg);
			});

			listeners[i] = dgram.createSocket('udp4');
			var dev;
			listeners[i].bind(0,'', function() {s
			  listener.setBroadcast(true);
			  listenerClient.listener(listeners[i]);
			  listenerClient.sender(senders[i]);
			  console.log(sender.address().address);
			  listenerClient.local_port_ip();
			  listenerClient.sender().send(packed,0,packed.length,27182, '255.255.255.255' )
			  listenerClient.net_if(nif);
			  console.log(listenerClient.discover_query());
    		  console.log(dev);
			  
			});
			listeners[i].on('listening', function(){
				listenerClient.send_query();
			});
			listeners[i].on('message', function(msg, rinfo) {
			  console.log(msg);
			  console.log(rinfo)
			  listenerClient.receive_data(msg);
			  dev = new ArmDev(msg, nif.ip);
			  devlist.push(dev);
			  //listener.close();
			});

			sender.send(packed,0,packed.length,27182, '255.255.255.255' );
			setTimeout(1000, console.log(listenerClient.local_port_ip()));
			sender.send
			
			setTimeout(function(){
				console.log(dev);
				listeners.forEach(function(s){
					s.unref();
				});
				senders.forEach(function(s){
					s.unref();
				})
				callBack(devlist)
				devlist.push(dev);
			}, secTimeout)
		});
	for(i = 0; i < 10; i++){
		console.log(listeners[i]);
	}
	console.log('devlist',devlist);
	return devlist;
}


GPIO();
main();

// exit();