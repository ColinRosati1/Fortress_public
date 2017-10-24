'use strict';
var os = require('os');
var Netmask = require('netmask').Netmask;

class NetInterface{
	constructor(name, ip, broadcast,mac, netmask){
		this.name = name;
		this.ip = ip;
		this.broadcast = broadcast;
		this.mac = mac;
		this.netmask = netmask;
	}
	static find(filter){
		filter = filter || null; 
		if (/^win/.test(process.platform)){
			return this.interface_list_win(filter);
		}
		else{
			return this.interface_list_mac(filter);
		}
	}
	static interface_list_mac(filter){
		var list = os.networkInterfaces();
		console.log(list)
		var names = []
		var ifList = []
		if (filter != null){
			names = Object.keys(list).filter(function(val){return filter.test(val);});
		}
		else{
			names = Object.keys(list);
		}
		console.log(names);
		

		for (var i = names.length - 1; i >= 0; i--) {
			//console.log(list[names[i]])
			var j;
			if(list[names[i]][0]['family']=='IPv4'){
				j = 0;
			}else{
				j = 1;
			}
			console.log(j)
			var block = new Netmask(list[names[i]][j]['address'],list[names[i]][j]['netmask']);

			ifList.push( new NetInterface(names[i], list[names[i]][j]['address'], block.broadcast, list[names[i]][j]['mac'].split(':').map(function(e){
				return parseInt(e,16);
			}), block.mask));
		};
		return ifList;

	}
	static interface_list_win(filter){
		var list = os.networkInterfaces();
		var names = []
		var ifList = []
		if (filter != null){
			names = Object.keys(list).filter(function(val){return filter.test(val);});
		}
		else{
			names = Object.keys(list);
		}
		console.log(names);

		for (var i = names.length - 1; i >= 0; i--) {
			var j;
			if(list[names[i]][0]['family']=='IPv4'){
				j = 0;
			}else{
				j = 1;
			}
			var block = new Netmask(list[names[i]][j]['address'],list[names[i]][j]['netmask']);

			ifList.push( new NetInterface(names[i], list[names[i]][j]['address'], block.broadcast, list[names[i]][j]['mac'].split(':').map(function(e){
				return parseInt(e,16);
			}), block.mask));
		};
		return ifList;
	}

}
module.exports = NetInterface