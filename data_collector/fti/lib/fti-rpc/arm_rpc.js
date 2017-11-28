'use strict'
var dgram = require('dgram');
var Crc = require('crc');
var crypto = require('crypto');
var aesjs = require('aes-js')
//var Sync = require('sync');

const ARM_RPC_PORT = 10002
const LCD_DISPLAY_PORT = 54005
const LOCATOR_PORT = 27182

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
		//Sync(function(){
			//self.socket = self.init_socket.sync(null);	
		//})
		
	}
	init_socket(){
		/*
		@socket.close if @socket
        @socket = UDPSocket.new
        @socket.bind('0.0.0.0', @loc_port)
		*/
		var self = this;
		console.log("socket init")
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
	send(packet, ip, port){
		ip = ip || this.rem_ip;
		port = port || this.rem_port;
		console.log('port? ')
		console.log(port)
		this.socket.send(packet,0,packet.length,port,ip, function () {
			// body...
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
					clearTimeout(t);
					console.log('oh no')
					throw new ArmRpcErrorTimeout();

				}
			}
			else{
				clearTimeout(t);
			}
		}, sec*1000)
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
			console.log(p.byteLength)
			console.log('echo')

		})
		
	}
	echo_cb(callback){
		var self = this;
		var pkt = [ARM_RPC_ECHO,1,2,3]
		this.packet_for(pkt,function(p){
			console.log('from echo callback');
			self.socket.send(p,0,p.length,self.rem_port,self.rem_ip )
			callback();
		})
		return;
	}
	dsp_open(){
		//this.rpc([11,5],0);
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
			self.socket.send(p,0,p.length,self.rem_port,self.rem_ip )
			// console.log(p.byteLength)
			console.log('dsp_open')
			callback();
		})
		return;
		
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
		console.log('port = ',port)
		console.log('host = ',host)
		console.log('loc_port = ',loc_port)

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
			console.log(k.length)
			k = Buffer.concat([k,aes.final()]);
			self.aesk = k;
			var aesEcb = new aesjs.ModeOfOperation.ecb(self.KEY);
			var ke = aesEcb.decrypt(msg.slice(2,msg.byteLength));
			

			var ka = []
			console.log('ke',ke);
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
		//var pkt = new Buffer([]);
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
