// ####################################################################
// uses BCM pinout

// ####################################################################

let gpio = require('node-rpi-gpio-control');
 
// sets the values for pin HIGH and LOW. 
 
const PIN_ON = 1;
const PIN_OFF = 0;
 
// exports the pin and sets the mode to write 
gpio.setup(10, gpio.modes.write, function() {
    gpio.write(10, 1, function() {
    	
    });
});
 
// exports the pin and sets the mode to read 
gpio.setup(11, gpio.modes.write, function() {
    gpio.write(11, 0, function() {
    });
});
 
 // unexports the pin 
gpio.teardown(10, function() {
});

// unexports the pin 
gpio.teardown(11, function() {
});