'use strict'

// import React from 'react';
// import ReactDOM from 'react-dom';
// import App from './components/App.jsx';

// ReactDOM.render(<App />, document.getElementById('root'));

// var React = require('react');
// var ReactDom = require('react-dom');
var fti = require('./fti-flash-node/index.js');
var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app)
var io = require('socket.io')(http);
var sleep = require('sleep');
var arloc = fti.ArmFind
var ArmRpc = fti.ArmRpc;
var ArmConfig = fti.ArmConfig;
var FtiRpc = fti.Rpc.FtiRpc;
var dgram = require('dgram');
var Fti = require('./fti-flash-node');

var NetInterface = require('./fti-flash-node/lib/fti-rpc/net-interface.js');
var ds = require('.//fti-flash-node/lib/fti-rpc/rpc.js');
var sys = require('util') // with OS date() ca;;
var exec = require('child_process').exec; //writing IO file 
// var jsonfile = require('jsonfile')
// var _ = require('lodash');

const test_ip = "192.168.10.50"
var nif_ip = "192.168.10.50"

const HOST_NIF_MAC = "98:5a:eb:c9:1d:d5";
const HALO_TEST_DELAY = 1;
const CAPTURE_LENGTH = 3;
const KERN_API_RPC = 19;
const KAPI_RPC_TEST = 32;

const DSP_SCOPE_PORT = 10004

const KAPI_IBTEST_PASSES_FE_READ = 210
const KAPI_IBTEST_PASSES_NFE_READ = 214
const KAPI_IBTEST_PASSES_SS_READ = 218  

const KAPI_IBTEST_PASSES_FE_WRITE = 212
const KAPI_IBTEST_PASSES_NFE_WRITE = 216
const KAPI_IBTEST_PASSES_SS_WRITE = 220 

class FtiHelper {
  constructor(ip){
  	

  }

  get_interface_ip(mac){
    var host_mac = mac.split(/[-]|[:]/).map(function(e){
      return parseInt("0x"+e);
    }) 
  }
  change_dsp_ip(callBack){
    var self = this;
    this.scan_for_dsp_board(function(e){
      console.log(e)
      callBack(e);
      self.send_ip_change(e)
    })
  }
  scan_for_dsp_board(callBack){

    arloc.ArmLocator.scan(1500, function(e){
      console.log(e)
      callBack(e)
    })
  }
  send_ip_change(e){
    var ds;
    console.log(e)
    e.forEach(function(board){
      console.log(board)
      if(board.board_type == 1){
        ds = board
      }
    })
    var nifip = ds.nif_ip
    var ip = nifip.split('.').map(function(e){return parseInt(e)});
    var n = ip[3] + 1;
    if(n==0||n==255){
      n = 50
    }
    var new_ip = [ip[0],ip[1],ip[2],n].join('.');
    var querystring = "mac:" + ds.mac+ ", mode:static, ip:" + new_ip + ", nm:255.255.255.0"
    console.log(querystring)
    ArmConfig.parse(querystring);

  }
}

class HaloDemo{
	constructor(ip){
		if(ip){
			this.host_ip = ip.split('.').map(function(e){
				return parseInt(e);
			})
		}else{
			if(!this.host_ip){
				this.get_interface_ip(HOST_NIF_MAC);	
			}
			
		}
	}

	get_interface_ip(mac){
		var host_mac = mac.split(/[-]|[:]/).map(function(e){
			return parseInt("0x"+e);
		}) 
	}
	change_dsp_ip(callBack){
		var self = this;
		this.scan_for_dsp_board(function(e){
			callBack(e)
			self.send_ip_change(e)
		})
	}
	scan_for_dsp_board(callBack){

		arloc.ArmLocator.scan(1500, function(e){
      		console.log(e)
    })
	}

 	send_ip_change(e){
		var ds;
		e.forEach(function(board){
			if(/^DETECTOR/.test(board.name)){
				ds = board
				ds = new Objrvt
				nif_ip = "192.168.10.50"
				ds.nif_ip;

				var nifip = ds.nif_ip
				var ip = nifip.split('.').map(function(e){return parseInt(e)});
				var n = ip[3] + 1;
				if(n==0||n==255){
					n = 50
				}
				var new_ip = [ip[0],ip[1],ip[2],n].join('.');
				var querystring = "mac:" + e[0].mac+ ", mode:static, ip:" + new_ip + ", nm:255.255.255.0"
				ArmConfig.parse(querystring);
			}
		})

		// var nifip = ds.nif_ip
		// var ip = nifip.split('.').map(function(e){return parseInt(e)});
		// var n = ip[3] + 1;
		// if(n==0||n==255){
		// 	n = 50
		// }
		// var new_ip = [ip[0],ip[1],ip[2],n].join('.');
		// var querystring = "mac:" + e[0].mac+ ", mode:static, ip:" + new_ip + ", nm:255.255.255.0"
		// ArmConfig.parse(querystring);

	}

	test_fti_rpc(){
		var dsp = FtiRpc.udp('192.168.10.50');
		dsp.scope_comb_test(3*231);
	}


}

 

app.set('port', (process.env.PORT || 4000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


http.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});

var Demo = new HaloDemo();
var dspip;
Demo.scan_for_dsp_board(function (e) {
	var ip = e[0].ip.split('.').map(function(e){return parseInt(e)});
	var nifip = e[0].nif_ip.split('.').map(function(e){return parseInt(e)});

	if(!((ip[0] == nifip[0]) && (ip[1] == nifip[1]) && (ip[2] == nifip[2]))){
		//dsp not visible
		console.log('dsp not visible')
		Demo.change_dsp_ip(function(){
			
			var n_ip = nifip;
			var n = n_ip[3] + 1;
			if(n==0||n==255){
			n = 50
			}
			dspip = [n_ip[0],n_ip[1],n_ip[2],n].join('.');
		});
	}else{
		console.log('dsp visible')
		dspip = ip.join('.');
	}
	// body...
});

setTimeout(function(){
console.log(dspip);
var arm = new ArmRpc.ArmRpc(dspip);
//sleep.sleep(1)

console.log('first timeout')
setTimeout(function(){
	arm.echo();
	setTimeout(function(){
		arm.dsp_open();
	},200);
	
	//sleep.usleep(100000);
	/*arm.init_session_key(function(e,d){
		arm.enc = e;
		arm.dec = d;
		arm.dsp_open();
	})*/
	
},100)
setTimeout(function(){
	arm.init_session_key(function(e,d){
		console.log('echo block')
		arm.enc = e;
		arm.dec = d;
		arm.echo();	
		setTimeout(function(){
			arm.init_session_key(function(e,d){
				arm.enc = e;
				arm.dec = d;
				arm.dsp_open();
			});
		},100);
		
	});
	
},100);

setTimeout(function(){
var dsp = FtiRpc.udp(dspip);
dsp.dsp_manual_test(function(d){
	console.log(d);
});
console.log(dsp);


 var dummy =  [{"y":[400,402,402,402,400,400,401,400,402,401,400,403,401,399,402,400,402,401,400,401,400,401,401,402,401,401,402,402,399,
   402,400,401,403,401,401,401,403,400,402,399,401,401,401,399,400,402,401,401,402,401,400,398,400,401,402,403,403,403,401,402,
   402,400,401,402,400,403,402,401,400,403,400,401,399,400,401,401,400,401,400,405,402,403,404,400,402,404,404,401,402,402,402,
   401,403,402,398,402,401,402,400,400,399,400,400,402,402,400,400,400,405,401,402,402,402,405,401,400,401,401,402,403,399,402,
   403,403,400,401,403,402,402,403,401,400,401,402,401,400,402,399,402,400,399,400,402,403,401,403,400,401,401,401,402,400,402,
   403,403,403,402,401,401,402,404,402,401,402,403,399,401,404,403,402,401,399,401,403,401,402,399,402,401,402,400,400,399,402,
   400,403,403,402,400,403,400,400,400,402,400,401,404,402,403,400,400,402,403,402,402,401,401,403,401,401,401,402,401,401,401,
   400,402,399,402,401,404,403,404,404,401,403,403,400,402,400,400,402,403,403,401,401,399,404,406,404,404,404,404,405,403,402,
   406,405,404,404,402,401,403,402,405,405,405,402,401,404,403,403,402,405,405,401,404,405,404,405,403,404,402,400,395,397,395,
   396,400,406,404,405,402,404,405,407,408,409,410,414,412,417,414,421,419,424,427,432,436,447,455,468,486,504,523,544,565,579,
   592,601,606,612,629,655,691,724,753,768,775,792,825,869,907,937,948,958,987,1036,1075,1098,1103,1122,1161,1202,1232,1244,1247,
   1271,1303,1342,1359,1366,1362,1361,1369,1376,1385,1390,1386,1373,1351,1330,1303,1275,1246,1224,1199,1172,1140,1093,1033,965,894,
   833,795,767,727,664,577,482,416,375,337,270,175,82,25,-12,-56,-136,-233,-306,-346,-371,-417,-489,-573,-633,-663,-677,-691,-726,-774,
   -825,-868,-896,-910,-912,-909,-913,-909,-912,-915,-918,-916,-906,-889,-860,-825,-795,-763,-741,-718,-697,-655,-547,-507,-479,-454,-414,
   -355,-300,-263,-238,-211,-161,-105,-59,-31,-13,16,63,109,154,177,195,213,240,274,311,343,367,379,386,394,407,416,440,455,479,496,515,525,
   535,543,548,549,557,553,553,557,555,555,555,557,553,551,553,549,551,549,549,545,541,544,547,547,543,544,540,535,531,528,527,528,525,523,
   521,520,518,516,514,513,514,512,509,508,508,506,504,502,504,500,501,502,497,498,495,495,495,493,492,490,487,488,488,484,481,481,483,480,
   480,479,477,477,476,473,475,474,474,474,471,470,470,471,467,466,466,465,469,461,461,460,463,461,461,460,461,458,457,455,456,455,454,454,
   455,452,452,450,451,448,449,448,449,449,449,449,449,447,448,446,446,443,443,442,440,441,442,438,440,440,440,440,440,439,439,439,436,437,
   436,434,435,435,435,435,434,435,432,431,434,432,431,429,433,429,430,430,429,430,430,427,428,426,426,428,426,428,425,427,426,426,425,426,
   422,422,424,424,423,424,423,422,421,422,420,420,423,422,419,420,420,419,418,419,419,418,419,419,420,419,419,419,421,417,418,418,416,414,
   417,414,416,419,415,417,416,415,416,415,416,416,416,415,413,417,416,412,415,413,413,413,415,414,413,413,411,412,413,412,415,412,412],
   "type":"scatter","mode":"lines","connectgaps":true,"name":"R Channel"},
   {"y":[413,415,411,414,413,413,413,413,411,413,412,413,413,414,411,412,415,414,412,413,412,410,413,411,413,412,414,414,412,413,413,412,
   411,412,410,413,411,413,412,414,413,413,410,415,413,415,412,414,410,412,413,410,415,413,412,414,415,410,413,412,414,412,414,412,412,413,
   412,414,412,412,413,414,411,414,411,413,412,415,411,414,411,415,412,412,413,413,412,414,411,412,413,413,413,413,412,411,414,415,413,411,
   413,414,410,412,413,411,413,411,414,409,415,411,412,414,415,413,413,414,412,415,414,414,414,413,412,414,413,412,413,411,411,414,410,412,
   410,413,411,413,413,414,413,411,412,413,411,411,410,413,412,416,412,414,413,412,412,413,412,415,413,414,413,413,412,413,413,414,412,413,
   412,412,412,414,412,412,413,414,413,412,412,414,411,412,414,413,416,414,414,411,412,411,413,410,414,412,414,413,413,414,412,413,414,413,
   414,414,414,411,412,414,413,414,412,412,412,411,412,412,413,412,411,412,414,412,410,413,413,411,414,413,413,413,413,411,414,413,413,414,
   409,404,406,405,407,407,407,406,406,406,407,407,407,408,406,406,406,405,407,408,408,407,406,405,407,407,406,406,406,406,408,409,409,407,
   406,410,411,433,447,448,442,441,425,415,421,432,438,430,424,434,433,428,435,433,438,435,436,431,425,419,415,407,401,394,385,375,367,362,
   364,359,369,374,376,380,375,357,340,322,307,308,317,322,313,295,249,225,224,238,239,237,217,197,193,193,197,169,142,140,151,155,138,113,
   97,98,114,130,130,116,108,98,98,113,133,141,149,160,165,164,160,161,156,164,184,197,220,240,254,267,289,309,335,346,361,373,392,423,450,
   473,480,492,515,548,572,585,591,606,634,664,682,691,696,708,726,743,757,763,773,783,799,808,827,831,823,817,802,794,788,790,792,793,792,
   804,798,787,768,748,740,743,754,738,706,680,675,676,678,645,613,604,606,595,578,549,540,539,546,549,531,482,451,440,446,450,448,444,432,
   404,388,378,383,383,389,394,394,392,386,384,377,364,356,354,350,348,344,339,331,332,334,336,333,339,341,341,350,350,344,345,356,361,359,
   344,338,337,340,352,371,376,378,377,379,379,381,378,379,381,379,381,381,384,384,383,384,384,383,384,382,386,383,386,387,385,385,387,386,
   386,386,388,389,389,390,388,394,396,396,396,396,396,396,395,396,398,397,397,399,398,399,397,396,400,399,399,399,399,400,398,400,399,398,
   398,399,401,400,397,400,399,400,401,402,400,402,402,400,401,401,401,403,403,403,404,404,404,403,402,402,402,401,404,403,403,403,405,403,
   402,404,404,405,406,405,405,404,406,404,406,405,408,406,405,404,405,407,405,406,406,405,405,408,406,405,408,404,407,406,407,407,407,406,
   406,405,408,407,407,407,407,407,406,408,408,409,408,407,409,406,406,407,407,407,407,407,409,406,410,409,409,408,408,407,407,407,408,408,
   409,410,409,410,407,409,412,407,408,409,407,409,408,408,408,410,408,408,408,410,407,408,409,411,410,410,410,411,410,407,410,410,408,411,
   411,407,410,411,411,407,411,410,410,409,411],
   "type":"scatter","mode":"lines","connectgaps":true,"name":"X Channel"}];

var mode = -1;




io.on('connection', function(socket){
	//socket.emit('manual', [[],mode]);
	var so = dgram.createSocket({'type':'udp4'})
	var ra=[]
	var xa = []
	var idx;
	so.bind(DSP_SCOPE_PORT,'0.0.0.0', function(){
		console.log('socket bound')
		so.on('listening', function(){
			console.log('listening');
		});
		so.on('message', function(e, rinfo){
				
			if(e){
				idx = e.readInt16LE(0);
				var r = e.readInt16LE(2);
				var x = e.readInt16LE(4);
				ra.push(r);
				xa.push(x);
				if (idx == 1){
					var t1 = ra
					var t2 = xa
					var channel
					if(mode == 0){
						channel = 'manual'
					}else{
						channel = 'halo'
					}	
					console.log(channel)
					socket.emit(channel, [[{"y":t1,"type":"scatter","mode":"lines","connectgaps":true,"name":"R Channel"},
											{"y":t2,"type":"scatter","mode":"lines","connectgaps":true,"name":"X Channel"}], mode] )
					
					ra = []
					xa = []


				}
			}
	});
	socket.on('m', function(){
		console.log('m')
		mode = 0;
		//var dsp = FtiRpc.udp(dspip)
		dsp.rpc0(6,[3*231,3]);
		
		});
		
		
		//socket.emit('manual', [dummy,mode]);

	});
	socket.on('fe', function(){
		console.log('fe')
		mode = 1;

		dsp.rpc0(KERN_API_RPC, [KAPI_IBTEST_PASSES_NFE_WRITE, 0])
        dsp.rpc0(KERN_API_RPC, [KAPI_IBTEST_PASSES_SS_WRITE, 0])
      	dsp.rpc0(KERN_API_RPC, [KAPI_IBTEST_PASSES_FE_WRITE, 1])
    
    setTimeout(function(){
    	dsp.rpc0(6, [CAPTURE_LENGTH * 231, 1])
      setTimeout(function(){
      	dsp.rpc0(KERN_API_RPC, [KAPI_RPC_TEST])
		}, HALO_TEST_DELAY*1000)
  }, 500)  		
  	});
	socket.on('nfe', function(){
		console.log('nfe')
		mode = 2;
		dsp.rpc0(KERN_API_RPC, [KAPI_IBTEST_PASSES_NFE_WRITE, 1])
        dsp.rpc0(KERN_API_RPC, [KAPI_IBTEST_PASSES_SS_WRITE, 0])
      	dsp.rpc0(KERN_API_RPC, [KAPI_IBTEST_PASSES_FE_WRITE, 0])
    
    setTimeout(function(){
    	dsp.rpc0(6, [CAPTURE_LENGTH * 231, 1])
      setTimeout(function(){
      	dsp.rpc0(KERN_API_RPC, [KAPI_RPC_TEST])
		}, HALO_TEST_DELAY*1000)
  }, 500)	});
	socket.on('ss', function(){
		console.log('ss')
		mode = 3;
		dsp.rpc0(KERN_API_RPC, [KAPI_IBTEST_PASSES_NFE_WRITE, 0])
        dsp.rpc0(KERN_API_RPC, [KAPI_IBTEST_PASSES_SS_WRITE, 1])
      	dsp.rpc0(KERN_API_RPC, [KAPI_IBTEST_PASSES_FE_WRITE, 0])
    
    setTimeout(function(){
    	dsp.rpc0(6, [CAPTURE_LENGTH * 231, 1])
      setTimeout(function(){
      	dsp.rpc0(KERN_API_RPC, [KAPI_RPC_TEST])
		}, HALO_TEST_DELAY*1000)
  }, 500)
	});
	socket.on('disconnect',function(){
		so.close();
	})
});
}, 3000)
},3000);

Demo.scan_for_dsp_board();
// Demo.change_dsp_ip(function(host_ip){});
setTimeout(function(){Demo.scan}); 

var fti = require('./fti-flash-node/index.js');
console.log(pk);
Fti_Locate();
// var test = new TestRunner();

var KEY = [138, 23, 225,  96, 151, 39,  79,  57, 65, 108, 240, 251, 252, 54, 34,  87];
		var bsize = KEY.length;
		var pk = [3, bsize]
		for(var i = 0; i<bsize; i++){
			pk.push(0);
		}

// console.log(pk);
// Fti_Locate();

// ==============================================================================
// Colins locate and scope additions
// ==============================================================================

// ####################################################################
// writer() writes data to file
//async method nesting the file writing function inside of this function
//must nest callback in order for stack to move out of scope
// ####################################################################
function writer(Obj_Type,data, DataSize)
{
	// var netinfo= [];
	// var netinfo_json= [];
	// var child;
	// for(var prop in data[1]){
	// 	    // console.log('key = ', prop);
	// 	    // console.log('value = ', data[0][prop]);
	// 	    netinfo.push(prop,data[0][prop]);
	// 	    netinfo_json.push(prop,data[0][prop], "\n");
	// 	}

	// console.log('writer has been hit')
	// child = exec("date", function (error, stdout) {
	//   fs.appendFile(path,'\n'+stdout+Obj_Type+'\n'+netinfo+'}'+'\n',function(err){});
	//    if (error !== null) {
	//     console.log('exec error: ' + error);
	//     return;
	//   }

	//   jsonfile.writeFile(file,stdout + Obj_Type + netinfo_json, {flag: 'a'}, function (err) {
	// 	  console.error(err)
	// 	})
	// });
}




function Fti_Locate(){
	'use strict'
	var arloc = fti.ArmFind
	var ArmRpc = fti.ArmRpc;
	var ArmConfig = fti.ArmConfig;
	var FtiRpc = fti.Rpc.FtiRpc;
	var dgram = require('dgram');

	var dsp = FtiRpc.udp('192.168.47.23', 0,null);   //TODO Doesnt close, blocks
	var arm= new Fti.ArmRpc.ArmRpc('192.168.47.23');	//TODO Doesnt close, blocks
	arm.echo_cb(function(){
	
		arm.dsp_open_cb(function(){
			dsp.scope_comb_test(1, function(array){
				writer('Scope data { ',array,array[10]);
			});
			setTimeout(function(){
			dsp.close();
			},4500)

		})			
	})

	var ArmLocator = arloc.ArmLocator;
	console.log('scaning for arm devices')
	ArmLocator.scan(1000,function (devlist) {
		
		console.log("this is your devices available",devlist);
		writer('devlist {',devlist,devlist[10]);
	});

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
	for(i = 0; i < 1; i++){
		console.log(listeners[i]);
	}
	console.log('devlist',devlist);
	return devlist;
}


module.exports = new FtiHelper();
