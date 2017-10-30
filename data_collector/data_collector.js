let gpio = require('node-rpi-gpio-control');
 
// sets the values for pin HIGH and LOW. 
 
const PIN_ON = 0;
const PIN_OFF = 1;
 
// exports the pin and sets the mode to write 
gpio.setup(19, gpio.modes.write, function() {
    gpio.write(19, PIN_OFF, function() {
    });
});
 
// exports the pin and sets the mode to read 
gpio.setup(23, gpio.modes.write, function() {
    gpio.write(23, PIN_ON, function() {
    });
});
 
 // unexports the pin 
gpio.teardown(19, function() {
});

// unexports the pin 
gpio.teardown(23, function() {
});