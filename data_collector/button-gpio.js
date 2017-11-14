// ####################################################################
// GPIO button
//uses BCM pin out
// ####################################################################
 
var wpi = require('wiringpi-node'); // create an instance of the wiringpi-node GPIO pin modes 

// sets the values for pin HIGH and LOW.  
const HIGH = 1;
const LOW = 0;
var secTimeout = 2000;

// ####################################################################
// GPIO opens pins
// ####################################################################
function GPIO()
{
	var value = 1;
	console.log('opening GPIO pins');
	wpi.setup('gpio'); //wpi-node uses pin initialization GPIO
	wpi.pinMode(21, wpi.INPUT); //button
	wpi.pinMode(10, wpi.OUTPUT); //LED
	wpi.pinMode(11, wpi.OUTPUT); //LED

	var button = wpi.digitalRead(29);		//read button
	wpi.digitalWrite(11,0);		//LED off
	wpi.digitalWrite(10, 0);	//LED off

    console.log(button);				// write button state
    if(button == 1){ 					// if button pressed locat detectors with Fti_locate
    	console.log('button!');
    	wpi.digitalWrite(11, 1);
		wpi.digitalWrite(10, 1); 		//blinks LED
    	return;
    }
}


// ####################################################################
// GPIO blinking 
// ####################################################################
function blink() {
	var i = 0, blinkTime = 10, v = 1;
	setTimeout(function(){
	    wpi.digitalWrite(11, 1);
		wpi.digitalWrite(10, 1); 		//blinks LED

	},5000);

    
    wpi.digitalWrite(11, 0);
    wpi.digitalWrite(10, 0);
}

GPIO();
// blink();
