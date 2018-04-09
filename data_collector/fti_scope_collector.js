// ####################################################################
// data_collector.js uses FTI Flash calls to:
//		* scan available detectors
// 		* log data from scope, log scan
//		* Christina added streaming rpc  rpc0(22,[26]);
// ####################################################################
var fs = require('fs');
var wpi = require('wiringpi-node'); // create an instance of the wiringpi-node GPIO pin modes uses BCM pinout
var util = require('util');
var stream = require('stream');
var Writable = stream.Writable || require('readable-stream').Writable;

var fti = require('./fti/index.js');  // move all requires up top
var arloc = require('./fti/lib/fti-rpc/arm_find.js');
var BufferPack = require('bufferpack');
var NetInterface = require('./fti/lib/fti-rpc/net-interface.js');
var ds = require('./fti/lib/fti-rpc/rpc.js');
var Fti = require('./fti');
var sys = require('util')
var exec = require('child_process').exec;
var dgram = require('dgram');
var jsonfile = require('jsonfile')
var file = 'data.json';
var child;
var path = ("scopedata.txt");

// RPI GPIO Pins
const HIGH = 1;
const LOW = 0;

const secTimeout = 2000;

const HALO_TEST_DELAY = 1;
const DSP_SCOPE_PORT = 10004;
const KERN_API_RPC = 19;
const KAPI_RPC_TEST = 32;
const KAPI_IBTEST_PASSES_FE_READ = 210
const KAPI_IBTEST_PASSES_NFE_READ = 214
const KAPI_IBTEST_PASSES_SS_READ = 218

const KAPI_IBTEST_PASSES_FE_WRITE = 90//212
const KAPI_IBTEST_PASSES_NFE_WRITE = 94
const KAPI_IBTEST_PASSES_SS_WRITE = 98
const NP_RPC = 13

const KAPI_RPC_ETHERNETIP = 100;
const KAPI_RPC_REJ_DEL_CLOCK_READ = 70;
const DRPC_NUMBER = 19;


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

// ####################################################################
// GPIO LED blink
// ####################################################################
function blink(LED){
		var a =1;
		var b = a%2;
		a++;
		setTimeout(function(){
			blink(LED)
		},200);

		wpi.digitalWrite(LED, b);
	}

// ####################################################################
// GPIO button trigger
// ####################################################################
function buttonpress(button){
	wpi.pinMode(9, wpi.INPUT); //button
	wpi.pullUpDnControl(9, wpi.PUD_UP)
	var button = wpi.digitalRead(9);

	wpi.pinMode(8, wpi.INPUT); //button
	wpi.pullUpDnControl(8, wpi.PUD_UP)
	var button_close = wpi.digitalRead(8);

	var a = 0;
	var i = 1;

	setTimeout(function() {
	 if(button == 0){
	 	// Fti_Scope();
		for (i = 0; i < 5; i ++){
			 setTimeout(function(){
				var b = a%2;
				a++;
			 	wpi.digitalWrite(11, b);
			 },100);
			i++;
		}

		setTimeout(function(){ Fti_Scope()},1600);
		button = 1;
	  }
	  button =1;
	},200);

	if(button_close == 0){
			for (i = 0; i < 5; i ++){
				 setTimeout(function(){
					var b = a%2;
					var c = (b + 1)%2;
					a++;
				 	wpi.digitalWrite(11, c);
				 	wpi.digitalWrite(10, b);
				 },100);
				i++;
			}
			setTimeout(function(){process.exit(-1)},2000);
		}

	wpi.digitalWrite(11, 0);
	wpi.digitalWrite(10, 0);

	GPIO();
}

// ####################################################################
// main
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
// ####################################################################
function writer(data)
{
	if(data==0){
		console.log('no data to write')
		return
	}

	var netinfo= [];
	var netinfo_json= [];
	var data_buffer = new Buffer(data)

	console.log('writer data = ', data);
	child = exec("date", function (error, stdout) {
	});


		var wstream = fs.createWriteStream(path,{flags:'a'})
		wstream.write(data+'\n' );

}

// ####################################################################
// GPIO closes pins
// ####################################################################
function exit()
{

}

// ####################################################################
// scope collector class initializes and triggers RPCs
// ####################################################################
class scope_collector {
	constructor(ip,port){
		var dspip = "192.168.33.50"
		var FtiRpc = fti.Rpc.FtiRpc;
	    var arm = new Fti.ArmRpc.ArmRpc(dspip);
	    var ph;
	    var packetHandler = ph;
	    var port = 10001
	   	var dsp = FtiRpc.udp(dspip);
	    var self = this;
	    this.ip = dspip;
	    this.dsp = dsp

	    console.log("Scope echo...");
	    debugger
	    arm.echo_cb(function(array){
	      console.log("echoed")
	      console.log(array);
	      arm.dsp_open_cb(function(pl){
	        console.log('dspn open payload = ',pl)
        	self.bindSo(dspip, function(test){
        		self.bindNP(dspip, function (test){
        			self.photoEye(function(){self.rpc_stream()})
            	});
	        });
	      });
	    });
	}

	bindSo(ip,callback){

	    var self = this;
	    var dsp = this.dsp;
	    var so = dgram.createSocket({type: 'udp4', reuseAddr: true})

	    so.on('error', function(err) {
		  console.log(`server error:\n${err.stack}`);
		  so.close();
		});

		so.bind(DSP_SCOPE_PORT,'0.0.0.0', function(){
	      console.log('bound')
	    })

		so.on('message', function(e,rinfo){
	          console.log('bind socket message')
	          var packetHandler = function(e){
			      // self.parse_net_poll_event(e); // parse socket
			      writer(e)		// write raw buffer
			    }
	          packetHandler(e)
		});
		callback()
	}

  	bindNP(ip, callback){
	    console.log('binding net poll')
	    var self = this;
	    var port = this.port
	    var dsp = this.dsp;
	    var np = dgram.createSocket({type: 'udp4', reuseAddr: true})
	    var ra =[]
		var xa =[]
		var idx

	    np.on('error', function(err) {
		  console.log(`server error:\n${err.stack}`);
		  np.close();
		});

	    np.on("listening", function () {
	    	console.log('np listening')
	   	   dsp.rpc1(19,[100,port], "",1.0, function(e, r){
	      		console.log('THIS IS MY DSP MESSAGE',e,r)
	    	});
	    });

	    np.bind({address: '0.0.0.0',port: 0,exclusive: true});
		np.on('message', function(e,rinfo){
			console.log('net poll message')
	        if(e)
	        {
	            idx = e.readInt16LE(0);
				var r = e.readInt16LE(2);
				var x = e.readInt16LE(4);
				ra.push(r);
				xa.push(x);
				if (idx == 1){
					callBack([ra,xa]);
					np.close();
					np.unref();
				}
	        }
	        else{
					np.close();
					np.unref();
				}
		});

		setTimeout(function(){callback()},2000);

		np.on('close', function(){
			console.log('closing')
			np.unref();
		});
	}

	init_net_poll_events(port){
	    var self = this;
	    var dsp = this.dsp;
	    var np = dgram.createSocket({type: 'udp4', reuseAddr: true})

	    dsp.rpc1(19,[100,port], "",1.0, function(e, r){
      		console.log(e,r)
    	});
	}

	parse_net_poll_event(buf){
	    if(buf)
	        {
	        	var idx,r,x;
				var rx_data = {
				   idx: [idx = buf.readInt16LE(0)],
				   r: 	[r = buf.readInt16LE(2)],
				   x: 	[x = buf.readInt16LE(4)]
				};
				var scope_data = JSON.stringify(rx_data);

				writer(scope_data)
			}
		else {
			console.log("invalid buf"); return
		}
	  }

	setHaloParams(f,n,s, callBack){
	    console.log(f)
	    var dsp = this.dsp;

	    dsp.rpc1(KERN_API_RPC, [KAPI_IBTEST_PASSES_SS_WRITE, s], "",1.0, function(){
	        console.log('SS set');
	        dsp.rpc1(KERN_API_RPC, [KAPI_IBTEST_PASSES_FE_WRITE, f], "",1.0, function(){
	          console.log("FE set")
	          dsp.rpc1(KERN_API_RPC, [KAPI_IBTEST_PASSES_NFE_WRITE, n], "",1.0, function(){
	            console.log("NFE set")
	            if(callBack){
	              callBack();
	            }
	          })
	        })
	      });
	  }

    haloTest(t){
	    console.log("halo test #",t," begin")
	    var dsp = this.dsp;
	    if(t == 0){
	       dsp.rpc0(6,[3*231,5,1]);
	    }else if(t == 1){
	        this.setHaloParams(1,0,0, function(){
	          dsp.rpc0(6,[3*231,3,1]);
	          setTimeout(function(){
	            dsp.rpc0(KERN_API_RPC, [KAPI_RPC_TEST, 1]);
	            console.log('testing')
	          }, HALO_TEST_DELAY*1000)
	          return;
	      })
	    }else if(t == 2){
	       this.setHaloParams(0,1,0, function(){
	         dsp.rpc0(6,[3*231,3,1]);
	          setTimeout(function(){
	            dsp.rpc0(KERN_API_RPC, [KAPI_RPC_TEST, 1])
	          }, HALO_TEST_DELAY*1000)
	      })
	    }else if(t == 3){
	       this.setHaloParams(0,0,1, function(){
	         dsp.rpc0(6,[3*231,3,1]);
	          setTimeout(function(){
	            dsp.rpc0(KERN_API_RPC, [KAPI_RPC_TEST, 1])
	          }, HALO_TEST_DELAY*1000)
	      })
	    }
	    setTimeout(function(){return },3000);
  }

  photoEye(callback){
  	console.log('photoeye...')
    var dsp = this.dsp;
    dsp.rpc0(5,[0,1,1])
    setInterval(function () {
        dsp.rpc0(5,[0,1,1]);
        setTimeout(function () {
            dsp.rpc0(NP_RPC,[]);
            callback();
        }, 100)
    },3000)
  }

  rpc_stream(){
  	console.log('stream rpc triggered...')
    var dsp = this.dsp;
    setInterval(function () {
        dsp.rpc0(22,[26]); // streaming rpc
        console.log('streaming ')
        setTimeout(function () {
            dsp.rpc0(NP_RPC,[]);
        }, 100)
    },1000)
  }

  dsp_manual_test(callBack){
  		console.log('dsp manual test')
		var ra =[]
		var xa =[]
		var idx
		var s = dgram.createSocket({'type': 'udp4', 'reuseAddr': true})
		var dsp = this.dsp;
		var self = this

		s.bind(DSP_SCOPE_PORT,'0.0.0.0', function(){
			dsp.rpc0(6,[3*231,3]);
		});

		s.on('message', function(e,rinfo){
			if(e){

				var idx = e.readInt16LE(0);
				var r = e.readInt16LE(2);
				var x = e.readInt16LE(4);
				var rx_data=[r,x,idx];
				ra.push(r);
				xa.push(x);
				writer(rx_data)
				if (idx == 1){
					callBack([ra,xa]);
					s.close();
					s.unref();
				}
			}else{
				s.close();
			}
		});

		s.on('close', function(){
			console.log('closing')
			s.unref();
			callBack()
		});
	}
}


// ####################################################################
//  Arm scope data
// ####################################################################
function Fti_Scope(){
	var scope = new scope_collector();
}


main();