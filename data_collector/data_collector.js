// ####################################################################
// uses BCM pinout

// ####################################################################
 // create an instance of the rpio-gpio-buttons object with pins 11 and 13 
var wpi = require('wiringpi-node');
// let gpio = require('node-rpi-gpio-control');
var arloc = require('./fti/lib/fti-rpc/arm_find.js');
var BufferPack = require('bufferpack');
var NetInterface = require('./fti/lib/fti-rpc/net-interface.js');

 
// sets the values for pin HIGH and LOW. 
 
const PIN_ON = 1;
const PIN_OFF = 0;
var i = 0, howManyTimes = 10, v = 1;
var secTimeout = 2000;


// ####################################################################
// GPIO opens pins
// ####################################################################
function GPIO()
{
	var value = 1;
	console.log('opening GPIO pins');
	wpi.setup('gpio');
	wpi.pinMode(21, wpi.INPUT);
	wpi.pinMode(10, wpi.OUTPUT);
	wpi.pinMode(11, wpi.OUTPUT);


	wpi.digitalRead(21);
	wpi.digitalWrite(11,0);
	wpi.digitalWrite(10, 0);
	// gpio.setup(10, gpio.modes.write,function(){});
	// gpio.setup(40, gpio.modes.read,function(){});
	// gpio.setup(11, gpio.modes.write, function(){});
}


// ####################################################################
// GPIO blinking 
// ####################################################################
function blink() {
    i++;
    if( i < howManyTimes ){
        setTimeout( blink, 1000 );
    }
    v = 1 - v;
    wpi.digitalWrite(11, v);
    wpi.digitalWrite(10, 1 - v);
    var button = wpi.digitalRead(21);
    console.log(button);
    if(button == 0){
    	wpi.digitalWrite(11, 1);
    	wpi.digitalWrite(10, 1);
    	Fti_Locate();	
    	return;
    }
}


// ####################################################################
// GPIO closes pins
// ####################################################################
function exit()
{
	gpio.teardown(10, function(){
	});
	gpio.teardown(11, function(){
	});
	gpio.teardown(40, function(){
	});
}


// ####################################################################
// Locats and logs Arms
// ####################################################################
function Fti_Locate(){
	'use strict'
	var fti = require('./fti/index.js');
	var arloc = fti.ArmFind
	var ArmRpc = fti.ArmRpc;
	var ArmConfig = fti.ArmConfig;
	var FtiRpc = fti.Rpc.FtiRpc;
	var dgram = require('dgram');

	function LocatorClient(){
		var sender = {};
		var listener = {};
		var nif; 
		console.log(listener, " = listener");
	}
	LocatorClient.prototype ={
		listener: function(s){
			s = s || null;
			if(s){
				this.listener = s;
			}
			return this.listener;
		},
		sender: function(s){
			s = s || null;
			if(s){
				this.sender = s;
			}
			return this.sender;
		},
		net_if: function(nif) {
			if(nif){
				this.nif = nif;
			}
			return this.nif;
		},
		discover_query: function() {
			// body...
			var port = this.listener.address().port;
			var ip = this.listener.address().address;
			var pkt = [LOC_TYPE_DISCOVER,8,this.mac_addr(), port & 0xff, port >> 8]
			return new Buffer(Array.prototype.concat.apply([],pkt));

		},
		mac_addr: function() {
			return ((this.nif && this.nif.mac) || [0,0,0,0,0,0])
		},
		send_query: function() {
			// body...
			var dq = this.discover_query();
			//console.log(dq.length);
			var sender = this.sender
			sender.send(dq, 0, dq.length, 27182, '255.255.255.255', function () {
				// body...
				console.log('query sent')
			} );
		},
		receive_data: function(data) {
			// body...
			console.log(data.toString())
		},
		local_port_ip: function() {
			// body...
			console.log(this.listener.address().address)
			console.log(this.listener.address().port)
		},
	}
	var datalog = arloc.ArmLocator.scan;
	console.log(datalog);

	class TestRunner{
		scan_for_dsp_board(callBack){
			this.dsp_board = []
			arloc.ArmLocator.scan(2000, function(e)
			{
				callBack(e);
				console.log(e);
			})
		}
	}

	LocatorClient();

	var test = new TestRunner();

	var KEY = [138, 23, 225,  96, 151, 39,  79,  57, 65, 108, 240, 251, 252, 54, 34,  87];
			var bsize = KEY.length;
			var pk = [3, bsize]
			for(var i = 0; i<bsize; i++){
				pk.push(0);
			}
	console.log(pk);

	var dsp = FtiRpc.udp('192.168.5.56');
	dsp.scope_comb_test(10);
	setTimeout(function(){
		dsp.close();
	},4500)

}

function scan(secTimeout, callBack){
		var list = NetInterface.find(/^Ethernet|^en/);
		var devlist=[];
		var listeners = [];
		var senders = [];
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
		console.log(devlist);
		return devlist;
		
	}





GPIO();
blink();
// Fti_Locate();
// scan();
// exit();