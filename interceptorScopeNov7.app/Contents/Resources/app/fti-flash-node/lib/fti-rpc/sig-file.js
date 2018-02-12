'use strict'
var path = require('path');
var fs = require('fs');

class SigFile{
	constructor(){
		this.pack_width = 80;
		this.packs = []

	}
	static load(sig_file){
		var sig = null;
		switch(path.extname(sig_file)){
			case ".sig":
			break;
			case ".fss":
			break;
			default:

		}
		
	}
	static read_sig_file(path){
		var s = fs.readFileSync(path);
		var points;
	}	
}