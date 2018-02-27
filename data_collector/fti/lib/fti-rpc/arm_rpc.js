'use strict'
var dgram = require('dgram');
var Crc = require('crc');
var crypto = require('crypto');
var aesjs = require('aes-js');
var Fti = require('./rpc.js');
// var ds = require('./fti/lib/fti-rpc/rpc.js');
//var Sync = require('sync');

const ARM_RPC_PORT = 10002
const LCD_DISPLAY_PORT = 54005
const LOCATOR_PORT = 27182
const DSP_SCOPE_PORT = 10004

const ARM_RPC_ECHO 		   =  0
const ARM_RPC_VERSION 	   =  1
const ARM_RPC_LCD		   =  2
const ARM_RPC_SYNC         =  3 // Sync RPC number
const ARM_RPC_READ         =  4 // read bytes from arm memory
const ARM_RPC_WRITE        =  5 // write bytes to arm memory
const ARM_RPC_LOG          =  6 // RPC used to log over udp
const ARM_RPC_EXTERNAL_USB =  7 // External USB RPC number
const ARM_RPC_FW_UPDATE    =  8 // RPC number for DSP-ARM firmware update
const ARM_RPC_LIVE_DATA    =  9 // RPC number for live data
const ARM_RPC_FUA_TEST     = 10 // RPC number for .FUA file test
const ARM_RPC_DSP          = 11 // RPC number for dsp control
const ARM_RPC_TESTMODE     = 13 // RPC number for setting global test-mode for hardware testing
const ARM_RPC_DEBUG        = 15 //JTAG enable/disable
  
const ARM_RPC_IOB          = 100 // RPC number for io-board
  
const ARM_PROG_BLOCK_SIZE  = 512
  
const ARM_RPC_ERROR = 255

class ArmRpcError extends Error{}
class ArmRpcErrorTimeout extends ArmRpcError{}
class ArmRpcErrorChecksum extends ArmRpcError{}
class ArmRpcAckError extends ArmRpcError{}

class ArmRpcBase{
	constructor(host, port,loc_port){
		if(!host){
			return this;
		}
		port = port || ARM_RPC_PORT;
		loc_port = loc_port || 0;

		this.rem_ip = host
		this.rem_port = port
		this.loc_port = loc_port
		var self = this;
		this.init_socket()
		
	}
	init_socket(){
		/*
		@socket.close if @socket
        @socket = UDPSocket.new
        @socket.bind('0.0.0.0', @loc_port)
		*/
		var self = this;
		if(this.socket){
			this.socket.close();
			this.socket.unref();
		}
		this.socket = dgram.createSocket('udp4');
		this.socket.on("bind",function(){
			console.log("bound f")
		})
		this.socket.bind(0,'0.0.0.0');
		this.socket.unref(); 				// needed to add this because otherwise initializing socket hanges with incomplete binding
	}



	rpc(data, time_out, trys){
		time_out = time_out || 1.0
		trys = trys || 1

		var self = this;
		var packet = this.packet_for(data)
		this.send(packet)
		if(time_out <= 0){
			return 0;
		}else{
		var ack, sender
		this.get_rpc_ack(time_out,trys,packet, function(data){
			//console.log(rinfo);
			ack = data[0];
			sender = data[1];
			self.verify_rpc_ack(ack);

		});
		}
		//if(!ack)
	}

	// rpc1(func,args,string,timeout,callBack){
	// 	var self = this;
	// 	var payload = this.payloadForRpc(func,args,string);
	// 	console.log("rpc1 packet =", packet)
	// 	var packet = this.payload;
	// 	console.log("rpc1 payload =", payload)
	// 	console.log("rpc1 packet =", packet)
	// 	this.write(packet);
	// 	this.callBack = callBack;
	// }


	write(packet){
		console.log('writing packet'+JSON.stringify(packet))
		this.socket.send(packet, 0, packet.length, this.rem_port, this.rem_ip, function(){
			console.log('packet written')
		});
	}

	payloadForRpc(func,args,string){
		var payload = [func]//String.fromCharCode(func)
		var argByte = args.length%4 
		if(string){
			payload.push(argByte + 4)
		}else{
			payload.push(argByte)// = f.concat(argByte)
		}
		for(var i = 0; i<argByte; i++){
			var word = args[i]
			if(!Number.isInteger(word)){
				word = Math.round(word);
			}
			payload.push(word & 0xff)
			payload.push((word>>8)&0xff)
		}
		if(string){
			//	string = new Buffer(string); not going to deal with this yet
		}
		payload = this.addCheckSum(payload);
		return new Buffer(payload);
	}
	addCheckSum(str){
		var cs = this.checkBytes(str);
		str.push(cs[0]);
		str.push(cs[1]);
		return str;//str.concat(String.fromCharCode(cs[0])).concat(String.fromCharCode(cs[1])); 
	}
	checkBytes(str){
		var c = this.fletcherCheckbytes(str)
		var cs = []; 
		cs[0] = 255-((c[0]+c[1])%255);
		cs[1] = 255-((c[0]+cs[0])%255);
		return cs;
	}
	fletcherCheckbytes(str){
		var c1 = 0;
		var c2 = 0;
		var bytes = []
		for(var i = 0; i < str.length; i++){
			var b = str[i]
			c1 = c1 + b;
			if(c1>= 255){
				c1 = c1 - 255
			}
			c2 = c2 + c1;
			if (c2>=255){
				c2 = c2 - 255
			}
		}
		return [c1,c2];

	}
	send(packet, ip, port){
		ip = ip || this.rem_ip;
		port = port || this.rem_port;
		this.socket.send(packet,0,packet.length,port,ip, function () {
			console.log('sent packet!');
		});


	}
	packet_for(data, callBack){
		if(Array.isArray(data)){
			data = new Buffer(Array.prototype.concat.apply([],data));
		}
		else{
			data = new Buffer(data.toString());
		}
		var crcBuff = new Buffer(4)//[Crc.crc32(data)]);
		crcBuff.writeUInt32LE(Crc.crc32(data));
		return Buffer.concat([data, crcBuff]);
	}
	packet_for0(data){
		if(Array.isArray(data)){
			data = new Buffer(Array.prototype.concat.apply([],data));
		}
		else{
			data = new Buffer(data.toString());
		}
		var crcBuff = new Buffer([Crc.crc32(data)]);
		return Buffer.concat([data, crcBuff]);
		
	}
	get_rpc_ack(sec, trys, packet, callBack){
		sec = sec || 1.0
		trys = trys || 1

		var self = this;

		var ack;
		if(!packet){
			trys =1
		}
		var timedout = false;
		sec = sec/trys
		this.socket.on('message', function(msg,rinfo){
			self.init_socket();
			callBack([msg,rinfo]); 
			ack = msg;

			
		});

		var t = setInterval(function(){
			if(!ack){
				if(packet && (trys>1)){
					self.send(packet);
					console.log("trys: " + trys.toString());
					trys = trys - 1
				}
				else{
					// clearTimeout(t);
					console.log('oh no')
					// throw new ArmRpcErrorTimeout();
					return;

				}
			}
			else{
				// clearTimeout(t);
				return;
			}
		}, sec*3000)
	}
	verify_rpc_ack(ack){
 		if(ack.length < 4){
 			throw new ArmRpcErrorChecksum("Ack size is to small");
 		}
 		var data = ack.slice(0,-4);
 		var crc = Crc.crc32(data);

	}
	rpc_ack_dispatch(ack){
		//var res = ack.write()
	}
	echo(){
		var self = this;
		var pkt = [ARM_RPC_ECHO,1,2,3]
		this.packet_for(pkt,function(p){
			self.socket.send(p,0,p.length,self.rem_port,self.rem_ip )
			// console.log(p.byteLength)
			// console.log('echo')

		})
		
	}
	echo_cb(callback){
		var self = this;
		var pkt = [ARM_RPC_ECHO,1,2,3]
		this.packet_for(pkt,function(p){
			self.socket.send(p,0,p.length,self.rem_port,self.rem_ip )
			var payload = ['"'+ self.rem_ip+'",'+ '['+[p]+']'];
			callback(payload);
		})
		return;
	}
	dsp_open(){
		var self = this;
		this.packet_for([11,5],function(p){
			self.socket.send(p,0,p.length,self.rem_port,self.rem_ip )
			console.log(p.byteLength)
			console.log('dsp_open')

		})
		
	}

	dsp_open_cb(callback){
		var self = this;
		this.packet_for([11,5],function(p){
			self.socket.send(p,0,p.length,self.rem_port,self.rem_ip)
			console.log('dsp_open ;)')
			var payload = ['"'+ self.rem_ip+'",'+ '['+[p]+']'];
			callback(payload);
		})
		return;
	
	}

	bindSo(ip){
	console.log("binding socket")
    if(this.bound){
      return;
    }
    var self = this;
    var so = dgram.createSocket({'type':'udp4'})
    so.bind(DSP_SCOPE_PORT,'0.0.0.0', function(){
      console.log('bound on '+ DSP_SCOPE_PORT+' 0.0.0.0 ')
      so.on('error', (err) => {
		console.log(`server error:\n${err.stack}`);
		so.close();
	  });
      so.on('message', function(e,rinfo){
          console.log(e)
            console.log("socket makes it here")
          console.log('socket message sent')
          self.packetHandler(e)
      })
    });
  }
    
  bindNP(ip){
   console.log('binding net poll')
   var self = this;
   console.log('net poll ip ',ip)
   var np = dgram.createSocket('udp4')
    np.on("listening", function () {
      console.log('net poll event = ')
      self.init_net_poll_events(np.address().port);
      var e = 'sending this packet'
      self.parse_net_poll_event(e);
    });

    np.on('error', function(err) {
			  console.log(err);
			});

    var e = 'sending this packet'
    np.on('message', function(e,rinfo){
      if (e !== 1){
      	console.log('what is e = ',e)
      }
      console.log("new message from: "+rinfo.address)
      if(self.state.dspip == rinfo.address){
         console.log(e)
        if(e)
        {
        	idx = e.readInt16LE(0);
				var r = e.readInt16LE(2);
				var x = e.readInt16LE(4);
				ra.push(r);
				xa.push(x);
				// console.log([r,x,idx]);
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
          // self.parse_net_poll_event(e);
          //    console.log("parsed net poll event =", parse_net_poll_event(e));
        }
        e = null;
        rinfo = null;

    });


    np.bind({address: '0.0.0.0',port: 0,exclusive: true});
  	
  	return np
    // ({np:np})
  }

  init_net_poll_events( port){
  	var dsp = Fti.FtiRpc.udp(port);
  	console.log('init net poll')
    var self = this;
    dsp.rpc1(19,[10001,port], "",1.0, function(e, r){
    	dsp.scope_comb_test(20,pk)
      console.log("rpc1 opened ",e,r)
    });
    // var pk;

    // setTimeout(function(pk){
    //    dsp.dsp_manual_test(pk)
    // },500);
    
  }

  parse_net_poll_event(buf){
    // var key = buf.readUInt16LE(0);
    var key = buf;

    var res = "";
    var self = this;
    console.log("packet received: " + buf.toString('hex'));
//    console.log("Key: " + "0x" + key.toString(16));
    // var value = buf.readUInt16LE(2);
     var value = buf;
    if(49152 == (key & 0xf000)){// && ((e=="NET_POLL_PROD_SYS_VAR") || (e=="NET_POLL_PROD_REC_VAR")))
        console.log('PROD_REC_VAR')
        console.log(buf.slice(9).toString())
        if( self.state.askProd){
          this.setState({prec:buf.slice(9),askProd:false})
        }
     }else if(32768 == (key & 0xf000)){
        console.log('PROD_SYS_VAR')
        console.log(buf.slice(9))
      
     }
  
  }
}

class ArmRpc extends ArmRpcBase{
	constructor(host, port,loc_port){
		super(host, port,loc_port);
		if(!host){
			console.log('no host')
			return this;
		}
		port = port || ARM_RPC_PORT;
		loc_port = loc_port || 0;
		// console.log('port = ',port)
		// console.log('host = ',host)
		// console.log('loc_port = ',loc_port)

		this.rem_ip = host
		this.rem_port = port
		this.loc_port = loc_port
		this.init_socket();
	}
	init_session_key(callBack){
		if(this.aesECB){
			callBack([this.aesECB]);
		}else{
		this.KEY = [138, 23, 225,  96, 151, 39,  79,  57, 65, 108, 240, 251, 252, 54, 34,  87];
		var self = this;
		var bsize = this.KEY.length;
		var pk = [3, bsize];
		for(var i = 0; i<bsize; i++){
			pk.push(0);
		}

		var pkbuffer = new Buffer(pk);
		self.socket.send(pkbuffer,0,pkbuffer.length, LOCATOR_PORT, this.rem_ip);
		self.get_rpc_ack(1.0,1,pkbuffer,function(data){
			var msg = data[0];
			var tmp = []
			for(var i = 0; i < msg.byteLength; i++){
				tmp.push(msg.readUInt8(i));
			}
			var sk = tmp.slice(2, tmp.length);
			var aes = crypto.createDecipheriv('aes-128-ecb', new Buffer(self.KEY), "")
			aes.setAutoPadding(false);
			var k = aes.update((msg.slice(2,msg.byteLength)).toString('binary'),'binary');
			k = Buffer.concat([k,aes.final()]);
			self.aesk = k;
			var aesEcb = new aesjs.ModeOfOperation.ecb(self.KEY);
			var ke = aesEcb.decrypt(msg.slice(2,msg.byteLength));
			var ka = []
			for(var ko = 0; ko < ke.length; ko++){
				ka.push(ke[ko]);
			}
			self.aesECB = new aesjs.ModeOfOperation.ecb(ka);
			callBack([self.aesECB]);
		})
	
		}
		
	}

	packet_for(data, callBack){
		var dat = super.packet_for(data);
		var self = this;
		this.init_session_key(function(c){var bsize = self.KEY.length
			var pad = bsize - ((dat.length + 2)%bsize)
			if(pad == bsize){
				pad = 0;
			}
			var parry = []
			for(var i=0;i<pad;i++){
				parry.push(0)
			}
			console.log('pad size: ' + pad.toString())
			var bu = new Buffer(2)//[dat.length]);
			bu.writeUInt16LE(dat.length)
			dat = Buffer.concat([bu ,dat, new Buffer(parry)])
			var n = Math.floor(dat.length/bsize);
			var en = c[0];
			var t;
			var pkt = en.encrypt(dat.slice(0,bsize))
			callBack(pkt)
		})	
	}
}

module.exports = {}
module.exports.ArmRpcBase = ArmRpcBase
module.exports.ArmRpc = ArmRpc
module.exports.ArmRpcError = ArmRpcError
module.exports.ArmRpcErrorChecksum = ArmRpcErrorChecksum
module.exports.ArmRpcErrorTimeout = ArmRpcErrorTimeout
module.exports.ArmRpcAckError = ArmRpcAckError
