// ####################################################################
// uses BCM pinout
//
// make a node script to scan ip addresses and get scope info
// no react, electron, webpack stuff
// ####################################################################

let gpio = require('node-rpi-gpio-control');
 
// sets the values for pin HIGH and LOW. 
 
const PIN_ON = 1;
const PIN_OFF = 0;
 
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
