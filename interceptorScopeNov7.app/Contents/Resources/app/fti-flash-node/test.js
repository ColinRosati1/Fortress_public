'use strict'
var fti = require('./index.js');
var arloc = fti.ArmFind
var ArmRpc = fti.ArmRpc;
var ArmConfig = fti.ArmConfig;
var FtiRpc = fti.Rpc.FtiRpc;
var dgram = require('dgram');
var os = require('os')

class TestRunner{

	change_dsp_ip(){
		this.scan_for_dsp_board(this.send_ip_change)
	}
	scan_for_dsp_board(callBack){
		this.dsp_board = []
		arloc.ArmLocator.scan(2000, function(e){callBack(e)})
	}
	send_ip_change(e){
		var nifip = e[0].nif_ip
		console.log(nifip);
		var ip = nifip.split('.').map(function(e){return parseInt(e)});
		var n = ip[3] + 1;
		if(n==0||n==255){
			n = 50
		}
		var new_ip = [ip[0],ip[1],ip[2],n].join('.');
		var querystring = "mac:" + e[0].mac+ ", mode:static, ip:" + new_ip + ", nm:255.255.255.0"
		console.log(querystring);
		ArmConfig.parse(querystring);

	}
	test_fti_rpc(){
		var dsp = new FtiRpc(1,	'192.168.5.56');
		dsp.scope_comb_test(3*231);
	}


}

var test = new TestRunner();

var KEY = [138, 23, 225,  96, 151, 39,  79,  57, 65, 108, 240, 251, 252, 54, 34,  87];
		var bsize = KEY.length;
		var pk = [3, bsize]
		for(var i = 0; i<bsize; i++){
			pk.push(0);
		}
console.log(pk);
console.log(os.networkInterfaces())

		var dsp = FtiRpc.udp('192.168.5.56');
		dsp.scope_comb_test(10);
		setTimeout(function(){
			dsp.close();
		},4500)
		/*var s = dgram.createSocket('udp4');
		s.bind(10004,'0.0.0.0');
		dsp.rpc0(6,[3*231,0])
		s.on('message', function(e,rinfo){
			if(e){
				console.log(e.byteLength)
				//var r = e.readInt16LE(0);
				//var x = e.
			}
		});*/
		//dsp.scope_comb_test(3*231);


//test.test_fti_rpc();

//test.scan_for_dsp_board(function  (e) {
//	console.log(e);
//})
//test.change_dsp_ip();

