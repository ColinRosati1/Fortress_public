'use strict'
var Rpc = require('./rpc.js')

var BufferPack = require('bufferpack');

class FtiRpc{
	static arm_dsp(args, callBack){
		new ArmDspRpc(args, callBack)
	}
}
class ArmDspRpc extends Rpc.FtiRpcUdp{
	constructor(host, port, unit){
		this.port = port || 10002
		this.unit = unit || 1
		this.port = new ArmRpcPort(host, port)
	}
}
class ArmRpcPort{
	constructor(host, port, args){
		this.arm = new ArmRpc(host, port, args);
	}
	write(data){
		//data = 
	}
	getPayload(sec){

	}
}

module.exports = {}
module.exports.FtiRpc = FtiRpc;
module.exports.ArmRpcPort = ArmRpcPort;
module.exports.ArmDspRpc = ArmDspRpc;