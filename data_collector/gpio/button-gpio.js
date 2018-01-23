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
// var button = wpi.digitalRead(21);

// function myButton(){
// 	for(i=0;i<10;i++){
// 		console.log(button);				// write button state
// 	    if(button == 1){ 					// if button pressed locat detectors with Fti_locate
// 	    	console.log('button!');
// 	    	return;
// 	    }
// 	}
// }

// ####################################################################
// GPIO opens pins
// ####################################################################
function GPIO()
{
	var value = 1;
	console.log('opening GPIO pins');
	wpi.setup('gpio'); //wpi-node uses pin initialization GPIO
	wpi.pinMode(9, wpi.INPUT); //button
	wpi.pullUpDnControl(9, wpi.PUD_UP)
	wpi.pinMode(10, wpi.OUTPUT); //LED
	wpi.pinMode(11, wpi.OUTPUT); //LED
	var button = wpi.digitalRead(9);

	wpi.digitalWrite(11,0);		//LED off
	wpi.digitalWrite(10, 0);	//LED off
				// write button state
    

	wpi.digitalWrite(11,1);		//LED off
	wpi.digitalWrite(10, 1);	//LED off

	// setTimeout(myButton,3000);
}

GPIO();
