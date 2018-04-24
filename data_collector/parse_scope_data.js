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
	// var  readline = require('readline');
	var lineReader = require('line-reader');	

	var read_file = 'scopedatafile.txt';
	var wr_file = 'parsed_scope.json';
	var   myFuncCalls = 0;
  

	//So if you can read the file as a string of hex characters and read up to a newline character, 
	//so you’d have a long string which is hex values, so “1a1234567890abcdef” etc. 
	//Then for each packet you read like that, pass the string into the above function and 
	//it should give you a raw byte array, which you can then read through with your current parsing function and get Int8’s,
	// Int16’s, etc. Hope this is helpful in some way….
	function parseHexString(str) {
	    var result = [];
	    while (str.length >= 2) {
	        result.push(parseInt(str.substring(0, 2), 16));
	        str = str.substring(2, str.length);
	        // console.log('(✿ ♥‿♥) ', result)
	    	parse_scope_data(str)
	    }
	    // console.log('(✿ ♥‿♥) ',typeof result)
	    // parse_scope_data(str)
	    return result;
	}

	function parse_scope_data(buf){
	    var self = this;
	    var i = 1;
	    // console.log( buf)
	     //========================= parse Array method ==============
			// buf.copy(buf1, 0, 1, 2);
			
			// var newcount = buf.slice(1,2)
			// console.log('new count array',newcount.toString());

			// var buf2 = new Buffer(4);
			// buf.copy(buf2, 0, 3, 6);
			// var log_in = buf2.readInt32LE()

			// var buf3 = new Buffer(4);
			// buf.copy(buf3, 0, 7, 10);
			// var log_out = buf3.readInt32LE();

			// var buf4 = new Buffer(2);
			// buf.copy(buf4, 0, 11, 12);
			// var r = buf4.readInt16LE()

			// var buf5 = new Buffer(2);
			// buf.copy(buf5, 0, 13, 14);
			// var x = buf5.readInt16LE()

			// var buf6 = new Buffer(2);
			// buf.copy(buf6, 0, 15, 16);
			// var phaseR = buf6.readInt16LE()

			// var buf7 = new Buffer(2);
			// buf.copy(buf7, 0, 17, 18);
			// var phaseX = buf7.readInt16LE()

			// var buf8 = new Buffer(4);
			// buf.copy(buf8, 0, 19, 24);
			// var sig_norm = buf8.readInt32LE()

			// var rx_data = {
			   // sig: [sig = buf.readInt8(0)], 
			   // count: [newcount],
			   // log_in:    [log_in],
			   // log_out:   [log_out],
			   // r: 		  [r],
			   // x: 		  [x],
			   // phaseR:    [phaseR],
			   // phaseX:    [phaseX],
			   // sig_norm:  [sig_norm] 
			// };

	 //========================= parse BUFFER method ============== 
	  //       i++
	  //   	console.log('how many chunks = ',i)
	  //   	console.log('bugs = ', buf)
			debugger;

			// var scope_buf = new Buffer(buf.length) // creates a buffer the size of buf
			var scope_buf = Buffer.from(buf)
			console.log('scope data =',scope_buf);
			console.log(buf[1].readInt16LE)
			var buf1 = new Buffer(2)

			// var buf1 = Buffer.alloc(2,0);
			scope_buf.copy(buf1, 0, 1, 2)
			//buf.copy(buf1, 0, 1, 2);
			var newcount = buf1.readInt16LE()
			console.log(newcount)

			var buf2 = new Buffer(4);
			scope_buf.copy(buf2, 0, 3, 6);
			var log_in = buf2.readInt32LE()

			var buf3 = new Buffer(4);
			scope_buf.copy(buf3, 0, 7, 10);
			var log_out = buf3.readInt32LE();

			var buf4 = new Buffer(2);
			scope_buf.copy(buf4, 0, 11, 12);
			var r = buf4.readInt16LE()

			var buf5 = new Buffer(2);
			scope_buf.copy(buf5, 0, 13, 14);
			var x = buf5.readInt16LE()

			// var buf6 = new Buffer(2);
			// buf.copy(buf6, 0, 15, 16);
			// var phaseR = buf6.readInt16LE()

			// var buf7 = new Buffer(2);
			// buf.copy(buf7, 0, 17, 18);
			// var phaseX = buf7.readInt16LE()

			// var buf8 = new Buffer(5);
			// buf.copy(buf8, 0, 19, 20);
			// var sig_norm = buf8.readInt16LE()

			var rx_data = {
			   sig: [sig = scope_buf.readInt8(0)], 
			   count: [newcount],
			   log_in:    [log_in],
			   log_out:   [log_out],
			   r: 		  [r],
			   x: 		  [x],
			   // phaseR:    [phaseR],
			   // phaseX:    [phaseX],
			   // sig_norm:  [sig_norm] 

			};

			var scope_data = JSON.stringify(rx_data);
	        console.log(rx_data)
	        // console.log(scope_data)
	        writer(scope_data)
	    // }
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
		console.log( data );
	
		var wstream = fs.createWriteStream(wr_file,{flags:'a'})
		wstream.write(data);

	}
//================================================
// signal & count = 1a 0200 		1 + 2 Bytes
// Logical input  = 0e 0000 00		4 Bytes
// logical ouput  = 08 1100 00		4 Bytes
// R			   = 00 ef 			2 Bytes
// x			   = bf bd 			2 Bytes
// phaseR		   = 00 ef 			2 Bytes
// phaseX		   = bf bd  		2 Bytes 
// sig_norm	   = 00 00 			2 Bytes
//================================================
	function main(){
		console.log('begin translating ...');

		// var instream = fs.createReadStream(read_file);
		// var outstream = new stream;
		// outstream.readable = true;
		// outstream.writable = true;

		// var rl = readline.createInterface({
		//     input: instream,
		//     output: outstream,
		//     terminal: false
		// });

		// rl.on('line', function(line) {  // line is a string
		//     setTimeout(function(){parseHexString(line)},1000);
		//     parse_scope_data(line)
		//     // console.log('recieved lines reading ',line.length + "\n")
		// });

		lineReader.eachLine(read_file, function(line, last) {
		  console.log(line);
		  parseHexString(line);

		});


	}

	main();