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

	var read_file = 'scopedatafile.txt';
	var wr_file = 'parsed_scope.json';
	var   myFuncCalls = 0;

	function parse_scope_data(buf){
	    var self = this;
	    if(buf)
	    {
	        console.log('its a buffer', buf)
	        console.log('type of buf = ',typeof(buf))

	        var idx = buf.readInt16LE(0)
			var r = buf.readInt16LE(2);
			var x = buf.readInt16LE(4);
			debugger;
          
			var rx_data = {
			   idx: [idx],
			   r: 	[r],
			   x: 	[x]
			};

			debugger;
			var scope_data = JSON.stringify(rx_data);
			console.log('pasres = ',rx_data);
			debugger;
			writer(scope_data)
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
		console.log( data );
	
		var wstream = fs.createWriteStream(wr_file,{flags:'a'})
		wstream.write(data+'\n' );

	}

	function main(){
		console.log('begin translating ...');
		var readableStream = fs.createReadStream(read_file);
		var data = '';
		var chunk;
		var i = 1;

		const inStream = new stream();

		const stats = fs.statSync(read_file)
		console.log('size of file', stats.size)

		readableStream.on('data', (chunk) => {
		  console.log(`Received ${chunk.length} bytes of data.`);
		   while (chunk != null) {

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
		        // writer(rx_data)
		        readableStream.push(data);
		        // inStream.pipe(process.stdout);
		        // console.log(rx_data)
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