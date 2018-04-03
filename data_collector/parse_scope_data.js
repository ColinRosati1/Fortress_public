	//####################################################################
	//Parse_scope_data.js
	//
	// parses scope data from scopedatafile.txt that data_collector.js makes
	// spits out a formatted JSON object that can is indexed and can be plotted, modified
	//
	// ####################################################################
	var fs = require('fs'); // this is necassery to read and write
	var es = require('event-stream'); // event stream for pausing stopping stream
	var jsonfile = require('jsonfile')
	var stream = require('stream')
	var Writable = stream.Writable || require('readable-stream').Writable;

	var read_file = 'scopedatafile.txt';
	var wr_file = 'parsed_scope.json';
	var util = require('util');
	var   myFuncCalls = 0;

	function parse_scope_data(buf){
		    var self = this;
		    // var buf = new Buffer(buf,'utf8');
		    if(Buffer.isBuffer(buf))
		    // {
			    // var buf = Buffer.from(buf);
			    // var buf = new Buffer(buf,'utf8');
			    debugger;

			    if(buf)
			    {
			        console.log('its a buffer', buf)
			        console.log('type of buf = ',typeof(buf))
			        // console.log('parsing' , buf)

			        var idx = buf.readInt16LE(0)
	  			    var r = buf.readInt16LE(2);
	    			var x = buf.readInt16LE(4);
	    			debugger;
		            // var idx = buf.toString(0);
					// var r = buf.readInt32LE(2);
					// var x = buf.readInt32LE(4);

					var rx_data = {
					   idx: [idx],
					   r: 	[r],
					   x: 	[x]
					};

					debugger;
					var scope_data = JSON.stringify(rx_data);
					console.log('pasres = ',rx_data);
					debugger;
					// setTimeout(function(){writer(rx_data)},2000);
					// writer(rx_data)
					writer(scope_data)
					// return scope_data;
				}
			// }
			// else
			// 	// return console.log('not a buffer, cant parse')
		 //  		var idx = buf;
			// 	var r = buf;
			// 	var x = buf;
			// 	var rx_data = ([r,x,idx])
			// 	console.log([rx_data]);
		  }


	// ####################################################################
	// writer() writes data to file in JSON
	// ####################################################################
	function writer(data)
	{
		if(data==0){
			console.log('no data to write')
			return
		}
		console.log('writing')
		// var data_str = JSON.stringify(data)
		// console.log('wrting data string',data_str);
		console.log( data );
		// jsonfile.writeFile(wr_file , data, {flag: 'a'}, function (err) {console.error(err)});
		// fs.writeFile(wr_file, data + '\n' , {encoding:'utf8',flag: 'a'},  function (err,buf_size,buf) {console.error(err)});
		// fs.write(wr_file, data, {encoding:'utf8',flag: 'a'},  function (err,buf_size) {console.error(err)});

		var wstream = fs.createWriteStream(wr_file,{flags:'a'})
		wstream.write(data+'\n' );

	}

	function main(){
		console.log('begin translating ...');

		var readableStream = fs.createReadStream(read_file);
		var data = '';
		var chunk;
		var i = 1;
		readableStream.on('readable', function() {
		    while ((chunk=readableStream.read()) != null) {
		    	i++
		    	console.log('how many chunks = ',i)
    			debugger;

				var rx_data = {
				   idx: [idx = chunk.readInt16LE(0)],
				   r: 	[r = chunk.readInt16LE(2)],
				   x: 	[x = chunk.readInt16LE(4)]
				};

				debugger;
				var scope_data = JSON.stringify(rx_data);
					
		        data += scope_data;
		        console.log(rx_data)
		    }

		});

		readableStream.on('end', function() {
			 console.log(`Finished Reading The Trex File ${data.length}`);
			console.log(data)
			writer(data)
			// parse_scope_data(data);
		    // console.log(JSON.stringify(data))
		});

	}

  	

main()