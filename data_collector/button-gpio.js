// ####################################################################
// GPIO button
//uses BCM pin out
// ####################################################################
 
var wpi = require('wiringpi-node'); // create an instance of the wiringpi-node GPIO pin modes 
var fs = require('fs');

// sets the values for pin HIGH and LOW.  
const HIGH = 1;
const LOW = 0;
var secTimeout = 2000;
var button = wpi.digitalRead(21);

function myButton(){
	for(i=0;i<10;i++){
		console.log(button);				// write button state
	    if(button == 1){ 					// if button pressed locat detectors with Fti_locate
	    	console.log('button!');
	    	return;
	    }
	}
}

// ####################################################################
// GPIO opens pins
// ####################################################################
function GPIO()
{
	var value = 1;
	var path = ("datafile.txt")
	console.log('opening GPIO pins');
	wpi.setup('gpio'); //wpi-node uses pin initialization GPIO
	wpi.pinMode(21, wpi.INPUT); //button
	
	var button = wpi.digitalRead(21);		//read button

	fs.appendFile(path,'button-new'+'\n',function(err){});

	for(i=0;i<10;i++){
		setTimeout(function(i){
			console.log(button);				// write button state
		    if(button == 1){ 					// if button pressed locat detectors with Fti_locate
		    	console.log('button!');
		    	callback();
		    }
		}
		, 250);
	}

	// setTimeout(myButton,3000);
}

GPIO();
