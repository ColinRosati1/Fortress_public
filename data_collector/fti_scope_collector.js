// ####################################################################
// uses BCM pinout
// data_collector.js uses FTI Flash calls to:
//		* scan available detectors
// 		* log data from scope, log scan

// TODO connect head to photo eye and test data, ask Bin for help
// how to connect a photo eye scope???
	// -what is a scope?
	// 	scope is the range of data from a stream of current coming from a photo eye.
	// -photo eye:
	// A photoelectric sensor, or photo eye, is an equipment used to discover the distance, absence, or presence
 	// of an object by using a light transmitter, often infrared, and a photoelectric receiver.
 	// -output a stream of measurable voltage

 // connect to 3 ARM devices locally through ethernet cables via fti_scope
 		// 1. Stealth head, or whatever head
 		// 2. DSP
 		// 3. photo eye

 	// TODO clean up scope scan functions
 			// is is just scope_comb_test()?
 			// what is arm.echo_cb()?
 			// what is halo scan_for_dsp_board()?

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
var dgram = require('dgram');
var jsonfile = require('jsonfile')
var _ = require('lodash');
var file = 'data.json';
var child;

// sets the values for pin HIGH and LOW.
const HIGH = 1;
const LOW = 0;
var secTimeout = 2000;
var path = ("scopedatafile.txt");

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
		// interceptor();
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
// GPIO closes pins
// ####################################################################
function exit()
{

}

class scope_collector {
	constructor(ip,port){
		var dspip = "192.168.33.50"
		var FtiRpc = fti.Rpc.FtiRpc;
	    var arm = new Fti.ArmRpc.ArmRpc(dspip);
	    var ph = function(e){
	      console.log(e)
	    }
	    
	    var packetHandler = ph;
	    var port = 10001
	   	var dsp = FtiRpc.udp(dspip);
	    var self = this;
	    this.ip = dspip;
	    this.dsp = dsp

	    console.log("now echo");
	    var pk;
	    
	    arm.echo_cb(function(array){
	      console.log("echoed")
	      // console.log(array);
	      arm.dsp_open_cb(function(pl){
	        console.log('dspn open payload = ',pl)
        	self.bindSo(dspip, function(test){
	        	setTimeout(function(){
	        		self.bindNP(dspip, function (test){
						setTimeout(function(){
							self.dsp_manual_test(function(array){
		            			self.haloTest(1);
		            		});
	            		},2000);
	            	});
            	},5000);
	        });
	      });
	    });


	}


	bindSo(ip, callback){
	    // var dsp = Fti.FtiRpc.udp(this.ip);
	    var self = this;
	    var so = dgram.createSocket({type: 'udp4', reuseAddr: true})

	    so.on('error', function(err) {
		  console.log(`server error:\n${err.stack}`);
		  so.close();
		});

		so.on("listening", function () {
	       // self.NetPollEvents('192.168.33.50').init_net_poll_events(np.address().port);
	   	   self.init_net_poll_events(so.address().port);
	    });

		so.bind(DSP_SCOPE_PORT,'0.0.0.0', function(){
	      console.log('bound')
	    })

		so.on('message', function(e,rinfo){
	          console.log('bound socket message = ',e)
	          // var ph;
	          var packetHandler = function(e){
			      // console.log(e)
			      self.parse_net_poll_event(e);
			    }
	          // console.log('package handler',self.packetHandler(e))
	          packetHandler(e)
	          callback()
		});
		// callback()
	}

  	bindNP(ip, callback){
	    console.log('binding net poll')
	    var self = this;
	    var np = dgram.createSocket({type: 'udp4', reuseAddr: true})
	    var ra =[]
		var xa =[]
		var idx 
	    // var dsp = Fti.FtiRpc.udp(this.ip);
	    np.on('error', function(err) {
		  console.log(`server error:\n${err.stack}`);
		  np.close();
		});

	    np.on("listening", function () {
	       // self.NetPollEvents('192.168.33.50').init_net_poll_events(np.address().port);
	   	   self.init_net_poll_events(np.address().port);
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
				console.log([r,x,idx]);
				// self.parse_net_poll_event(e);
				if (idx == 1){
					// console.log(ra);
					// console.log(xa);
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


		np.on('close', function(){
			console.log('closing')
			np.unref();
			// np.close();
		});

		setTimeout(function(){
			if(idx != 1){
				np.close();
			}else{
				np.unref();
				np.close();
			}
			callback()
		}, 1000);

	}

	init_net_poll_events(port){
	    var self = this;
	    var dsp = this.dsp;
	    dsp.rpc1(19,[100,port], "",1.0, function(e, r){
	      console.log(e,r)
	    });
	}

	parse_net_poll_event(buf){
	    var key = buf.readUInt16LE(0);
	    var res = "";
	    var self = this;
	    console.log("packet received: " + buf.toString('hex'));
	//  console.log("Key: " + "0x" + key.toString(16));
	    var value = buf.readUInt16LE(2);

	    if(49152 == (key & 0xf000)){// && ((e=="NET_POLL_PROD_SYS_VAR") || (e=="NET_POLL_PROD_REC_VAR")))
	        console.log('PROD_REC_VAR')
	        console.log(buf.slice(9).toString())
	        if( self.askProd){
	          // this.setState({prec:buf.slice(9),askProd:false})
	          this.prec=buf.slice(9)
	          this.askProd=false;
	        }
	    }
	    else if(32768 == (key & 0xf000)){
	        console.log('PROD_SYS_VAR')
	        console.log(buf.slice(9))
	    	if( self.askSys){
	       	 this.setState({srec:buf.slice(9),askSys:false})
	    	}
	    }

	  }

	setHaloParams(f,n,s, callBack){
	    console.log(f)
	    var dsp = this.dsp;

	    dsp.rpc1(KERN_API_RPC, [KAPI_IBTEST_PASSES_SS_WRITE, s], "",1.0, function(){
	        console.log('SS set');
	        //setTimeout()
	        //98%32 = 2

	        dsp.rpc1(KERN_API_RPC, [KAPI_IBTEST_PASSES_FE_WRITE, f], "",1.0, function(){
	          console.log("FE set")
	          //160315 bug - dsp thinks this is [90,90] instead of [90,f] so I get 90%32 = 26
	          dsp.rpc1(KERN_API_RPC, [KAPI_IBTEST_PASSES_NFE_WRITE, n], "",1.0, function(){
	            //94%32 = 30
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

  photoEye(){
    var dsp = this.dsp;
    dsp.rpc0(5,[0,1,1])
    setInterval(function () {
        dsp.rpc0(5,[0,1,1]);
        setTimeout(function () {
            dsp.rpc0(NP_RPC,[]);
        }, 100)
    },10000)
  }

  dsp_manual_test(callBack){
  		console.log('dsp manual test')
		var ra =[]
		var xa =[]
		var idx 
		// var s = dgram.createSocket('udp4');
		var s = dgram.createSocket({'type': 'udp4', 'reuseAddr': true})
		var dsp = this.dsp;
		var self = this
		dsp.rpc0(6,[3*231,3]);
			

		s.on("listening", function () {
	       // self.NetPollEvents('192.168.33.50').init_net_poll_events(np.address().port);
	   	   self.init_net_poll_events(s.address().port);
	   	   dsp.rpc0(6,[3*231,3]);
			
	    });

		setTimeout(function(){
			s.bind(DSP_SCOPE_PORT,'0.0.0.0', function(){
				dsp.rpc0(6,[3*231,3]);
			});
		},8000);
		s.on('message', function(e,rinfo){
			console.log('receiving dsp manual test')
			if(e){
				//console.log(e.byteLength)
				idx = e.readInt16LE(0);
				var r = e.readInt16LE(2);
				var x = e.readInt16LE(4);
				ra.push(r);
				xa.push(x);
				console.log([r,x,idx]);
				if (idx == 1){
					// console.log(ra);
					// console.log(xa);
					callBack([ra,xa]);
					s.close();
					s.unref();
				}
			}else{
				s.close();
			}
			setTimeout(function(){
				callBack()
			},5000);
		});

		// s.on('close', function(){
		// 	console.log('closing')
		// 	s.unref();
		// });

		// setTimeout(function(){
		// 	if(idx != 1){
		// 		s.close();
		// 	}else{
		// 		s.unref();
		// 	}
		// }, 1000);
	}
}



// ####################################################################
// Locats and logs Arm scope data
// ####################################################################
function Fti_Locate(){
	'use strict'

	// var ArmLocator = arloc.ArmLocator;
	arloc.ArmLocator.scan(1500,function(list){
		//console.log('function returns = ' + JSON.stringify(list))
		writer(JSON.stringify(list));
		return (list);
	});

}



// ####################################################################
//  Arm scope data

// ####################################################################
function Fti_Scope(){
	// var dspip = "192.168.33.50"
	// var FtiRpc = fti.Rpc.FtiRpc;
 //    var arm = new Fti.ArmRpc.ArmRpc(dspip);
 //    var self = this;

	// Fti_Locate();

    // var port = 10001
    // var dsp = FtiRpc.udp(port);

    // console.log("now echo")
    // var pk =  "MY PACKET"
    // arm.echo_cb(function(array){
    //   console.log("echoed")
    //   console.log(array);
    //   arm.dsp_open_cb(function(pl){
    //     // console.log('dspn open payload = ',pl)
    //     arm.bindSo(dspip)
    //     setTimeout(function(){
    //        arm.bindNP(dspip)
    //          setTimeout(function(pk){
	   //   	 	haloTest(dspip);
	   //       },1000);
    //      },5000);
    //   })
    // });

	// haloTest();

	var scope = new scope_collector();


}


main();