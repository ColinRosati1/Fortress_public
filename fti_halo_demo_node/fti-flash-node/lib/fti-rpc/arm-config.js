'use strict'

var NetInterface = require('./net-interface.js');
var dgram = require('dgram');

class ArmConfig{
	static parse(conf){
		var h = {}
		conf.split(',').forEach(function(e){
			e = e.trim();
			var key = e.split(':')[0].trim();
			var val = e.split(':')[1].trim();
			h[key] =val
		})
		return (new ArmConfig()).set_config(h)
	}
	set_config(opts){
		var mac = this.get_mac(opts['mac'], 'mac');
		var new_mac = opts['new_mac'] || opts['mac'];
		if (new_mac == 'rand'){
			new_mac = [1,2,3,4,5,6].map(function(){
				return Math.floor(Math.random()*256);
			});
			new_mac[0] = new_mac[0] & 0xfe
			new_mac = new_mac.map(function(b){
				return ("00" + (+e).toString(16)).slice(-2);
			}).join('-');
		}
		new_mac = this.get_mac(new_mac, 'new_mac');

		var ip = '0.0.0.0'
		var nm = '255.255.255.0'
		var mode;
		var gw='0.0.0.0';
		switch(opts['mode'] || 'static')
		{
			case 'static':
			case 'static_ip':
				mode = 0;
				ip = this.get_ip(opts['ip'], 'ip')
				nm = this.get_ip(opts['nm'] || opts['netmask'] || nm, 'nm');
				break;
			case 'dhcp':
				mode = 1;
				break;
			case 'auto':
			case 'auto_ip':
				mode = 2;
				nm = '255.255.0.0';
				gw = this.get_ip(opts['gw'] || opts['gateway'] || gw, 'gw');
				break;
			default:
				throw "bad mode, use 'static' or 'dhcp' or 'auto'";
				break;

		}
		//console.log([mac, new_mac, ip, nm, gw, mode]);
		var conf = [ip,nm,gw].map(function(e){
			return e.split('.').map(function(d) {
				return parseInt(d);
			})
		})
		mac = mac.split(/[-]|[:]/).map(function(m){
			return parseInt('0x'+m);
		});
		new_mac = new_mac.split(/[-]|[:]/).map(function(m){
			return parseInt('0x'+m);
		});
		conf.push(mode);
		conf.unshift(new_mac)
		conf = Array.prototype.concat.apply([],conf)
		var len = mac.length + conf.length
		var msg = [2, len, mac, conf]
		msg = Array.prototype.concat.apply([],msg)
		msg = new Buffer(Array.prototype.concat.apply([],msg));

		NetInterface.find(/^en/).forEach(function(nif){
			var s = dgram.createSocket('udp4');
			s.bind(0,nif.ip, function(){s.setBroadcast(true)

			
			});
			s.send(msg, 0, msg.length, 27182, '255.255.255.255', function () {
			// body...
				console.log('query sent')
				s.close(function() {
				// body...
				});

			});
				
			//s.unref();
		});
		return this;
	}
	get_mac(mac, name){
		if(!mac){
			throw (name + ' is nil');
		}
		var vals = mac.split(/[-]|[:]/).map(function(e){
			return parseInt('0x'+e);
		})
		if(vals.length != 6){
			throw (name + ": bad mac size");
		}
		vals.forEach(function(v){
			if(v<0 || v>255){
				throw (name + ": bad mac numbers");
			}
		});
		if((vals[0]&1) != 0){
			throw (name + ": first byte of mac must be an even number");
		}
		return mac
	}
	get_ip(ip, name){
		console.log(ip)
		if(!ip){
			throw (name + " is nil")
		}
		var vals = ip.split('.').map(function(e) {
			return parseInt(e);			
		}) 
		if(vals.length != 4){
			throw (name + ": bad ip size")
		}
		vals.forEach(function(v){
			if(v<0 || v>255){
				throw (name + ": bad ip numbers");
			}
		});
		return ip
	}

}

module.exports = ArmConfig