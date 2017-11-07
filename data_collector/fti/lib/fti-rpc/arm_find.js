'use strict';

var NetInterface = require('./net-interface.js');
var dgram = require('dgram');
var BufferPack = require('bufferpack');

//console.log(NetInterface.find(/^en/));

const LOC_TYPE_DISCOVER = 4;

function LocatorClient(){
	var sender = {};
	var listener = {};
	var nif; 
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
		//console.log(data.toString())
	},
	local_port_ip: function() {
		// body...
		console.log(this.listener.address().address)
		console.log(this.listener.address().port)
	},
}

class ArmLocator{
	static scan(secTimeout, callBack){
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
				listeners[i].bind(0,'', function() {
				  
				  listener.setBroadcast(true);
				  listenerClient.listener(listeners[i]);
				  listenerClient.sender(senders[i]);
				  console.log(sender.address().address);
				  listenerClient.local_port_ip();
				  listenerClient.sender().send(packed,0,packed.length,27182, '255.255.255.255' )
				  listenerClient.net_if(nif);

				  console.log(listenerClient.discover_query());
				  
				  
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
	
			
		
		console.log(devlist)
		return devlist;
		
	}
}
class ArmDev{
	constructor(data, nif_ip){
		this.nif_ip = nif_ip
		this.extract_loc_data(data);
	}
	extract_loc_data(data){
		
	/*	
	type,len  =  data[0,2].unpack('C*')
      return unless type == LocatorClient::LOC_TYPE_DISCOVER
      @my_mac   = data[ 2,6].unpack('C*')
      @dir_conn = data[ 8,1].unpack('C*')
      eth  =     data[ 9,19].unpack('C*')  # eth-config
      fram =     data[28,19].unpack('C*')  # eth-config
      loc  =     data[47..-1].unpack('C*')
      @mac, @ip, @nm, @gw, @net_flags = parse_config(eth,  false)
      @f_mac, @f_ip, @f_nm, @f_gw, @net_mode = parse_config(fram, true)
      parse_loc_data(loc)

*/
	var type = data.readUInt8(0); //BufferPack.unpack('H',data[0]);
	//console.log(type);
	if(type != LOC_TYPE_DISCOVER){
		return
	}
	var len = data.readUInt8(1);//BufferPack.unpack('H',data[1]);
	this.my_mac =[];
	for(var i = 0; i <6; i++){
		this.my_mac[i] = data.readUInt8(2+i);	
	} //BufferPack.unpack('6H',data,2);
	this.dir_conn = data.readUInt8(8,1)//BufferPack.unpack('H',data,8);
	var eth = []
	for(var i = 0; i <19; i++){
		eth[i] = data.readUInt8(9+i);	
	}
	var fram = []
	for(var i = 0; i <19; i++){
		fram[i] = data.readUInt8(28+i);	
	}	 
	 //BufferPack.unpack('19H', data,9);
	//var fram = BufferPack.unpack('19H',data,28);
	var loc = []
	for(var i = 0; i <data.byteLength - 47; i++){
		loc[i] = data.readUInt8(47+i);	
	}	
	//var loc = BufferPack.unpack((data.length - 47) + 'H', data, 47);
	//console.log
	var conf = this.parse_config(eth, false);
	var fm = this.parse_config(fram, true);

	this.mac = conf[0];
	this.ip = conf[1];
	this.nm = conf[2];
	this.gw = conf[3];
	this.net_flags = conf[4];
	this.f_mac = fm[0];
	this.f_ip = fm[1];
	this.f_nm = fm[2];
	this.f_gw = fm[3];
	this.net_mode = fm[4];

	this.parse_loc_data(loc);
	}
	parse_config(config, fram){
		fram = fram !== false;

		var c_mac = config.slice(0,6).map(function(e){
			return ("00" + (+e).toString(16)).slice(-2);
		}).join('-');
		var c_ip = config.slice(6,10).map(function(e){
			return e.toString();
		}).join('.');
		var c_nm = config.slice(10,14).map(function(e){
			return e.toString();
		}).join('.');
		var c_gw = config.slice(14,18).map(function(e){
			return e.toString();
		}).join('.'); 
		var c_mode = config[18];
		if(fram){
			switch(c_mode){
				case 0:
					c_mode = "STATIC-IP"
					break;
				case 1:
					c_mode = "DHCP"
					break;
				case 2:
					c_mode = "AUTO-IP"
					break;
				default:
					break;
			}
		}else{
			var flags = []
			if ((c_mode & 0x01) !=0) flags.push("UP");
			if ((c_mode & 0x02) !=0) flags.push("BROADCAST");
			if ((c_mode & 0x04) !=0) flags.push("P-TO-P");
			if ((c_mode & 0x08) !=0) flags.push("DHCP");
			if ((c_mode & 0x10) !=0) flags.push("LINK-UP");
			if ((c_mode & 0x20) !=0) flags.push("ARP");
			if ((c_mode & 0x40) !=0) flags.push("IGMP");
			c_mode = flags.join(',')
		}
		return [c_mac, c_ip, c_nm, c_gw, c_mode];
	}
	parse_loc_data(data){
		console.log(data);
		this.board_type = data[0];
		this.board_id = data[1];
		//data.slice(0,2).map([this.board_type, this.board_id])
		this.ver = data.slice(2,6).map(function (e) {
			// body...
			return e.toString()
		}).join('.')
		this.name = (new Buffer(data.slice(6,18))).toString().trim();
		this.s_key = data.slice(18,34);
		this.app_name = (new Buffer(data.slice(34,-1))).toString().trim()
	}	
}

module.exports = {}
module.exports.ArmDev = ArmDev
module.exports.ArmLocator = ArmLocator
