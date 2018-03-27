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
	var read_file = 'scopedatafile.txt';
	var wr_file = 'parsed_scope.json';
	var util = require('util');

	function parse_scope_data(buf){
		    var self = this;
		    var buf = Buffer.from(buf);

		    if(buf)
		        {
		        console.log('parsing')
	            var idx = buf.readInt16LE(0);
				var r = buf.readInt16LE(2);
				var x = buf.readInt16LE(4);
				var a = buf.readInt16LE(6);
				var b = buf.readInt16LE(8);
				var c = buf.readInt16LE(10);
				var d = buf.readInt16LE(12);
				var e = buf.readInt16LE(14);
				var f = buf.readInt16LE(16);
				var g = buf.readInt16LE(18);

				var rx_data = {
				   idx: [idx],
				   r: 	[r],
				   x: 	[x],
				   a: 	[a],
				   b: 	[b],
				   c: 	[c],
				   d: 	[d],
				   e: 	[e],
				   f: 	[f],
				   g: 	[g],
				};

				var scope_data = JSON.stringify(rx_data);
				console.log('pasres = ',rx_data);
				// writer(rx_data)
				return scope_data;
			}
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
		fs.writeFile(wr_file, data + '\n' , {encoding:'utf8',flag: 'a'},  function (err,buf_size,buf) {console.error(err)});
		// fs.write(wr_file, data, {encoding:'utf8',flag: 'a'},  function (err,buf_size) {console.error(err)});

	}

	function main(){
		console.log('begin translating ...');
		// fs.stat(read_file, function(error, stats) {console.log(stats)});

		// ================================= readFile ====================

		// fs.readFile(read_file, function(err, buf) {
		// 	if (err) throw err;
		// 	console.log('read file');
		// 	if(buf){
		// 		var data = [];
		// 		data.push(parse_net_poll_event(buf))
		// 		console.log(data)
		// 		// buf.forEach(function(){
		// 			// parse_net_poll_event(buf);
		// 		// })
		// 	  // parse_net_poll_event(buf);
		// 	}
		// 	else {
		// 		console.log('cant read file')
		// 		return
		// 	}
		// });

		// var readStream = fs.createReadStream(read_file);
	
	//============================= read stream ======================	
		// var lineNr = 0;

		// var s = fs.createReadStream(read_file)
  //   .pipe(es.split())
  //   .pipe(es.mapSync(function(line){
  //   	 // parse_net_poll_event(buf);
  //       // pause the readstream
  //       s.pause();
  //       var data = [];
  //       console.log('read stream ...')	
  //       console.log(typeof(line))
  //       data.push(parse_net_poll_event(line))
  //       lineNr += 1;
  //       console.log('data object from read stream concatenated', data)

  //       // process line here and call s.resume() when rdy
  //       // function below was for logging memory usage
  //       // logMemoryUsage(lineNr);

  //       // resume the readstream, possibly from a callback
  //       s.resume();
  //   })
  //   .on('error', function(err){
  //       console.log('Error while reading file.', err);
  //   })
  //   .on('end', function(data){
  //       console.log('Read entire file.', data)
  //   }))

  // ============================= readLine ============================
  	var input = fs.createReadStream(read_file);
  	readLines(input,func)

	}

  	function readLines(input, func) {
	  var remaining = '';

	  input.on('data', function(data) {
	  	var pdata = data
	    remaining += pdata;
	    var index = remaining.indexOf('\n');
	    while (index > -1) {
	      var line = remaining.substring(0, index);
	      remaining = remaining.substring(index + 1);
	      func(line);
	      index = remaining.indexOf('\n');
	    }
	  });

	  input.on('end', function() {
	    if (remaining.length > 0) {
	      func(remaining);
	    }
	  });
	}

	function func(data) {
	  // console.log('Line: ' + data);
	  parse_scope_data(data)
	  writer(parse_scope_data(data))

	}

main()