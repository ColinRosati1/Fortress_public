# node rpi gpio control

Easy to use node module that controls the Raspberry pi GPIO via the file system.


## Installation
`npm install node-rpi-gpio-control --save`


## Useage

NOTE: the program using this module must be running with superuser privileges to interact with the file system GPIO.

```javascript 1.8
let gpio = require('node-rpi-gpio-control');

// sets the values for pin HIGH and LOW.

const PIN_ON = 0;
const PIN_OFF = 1;

// exports the pin and sets the mode to write
gpio.setup(1, gpio.modes.write, function() {
    gpio.write(1, PIN_OFF, function() {
    });
});

// unexports the pin
gpio.teardown(1, function() {
});



// exports the pin and sets the mode to read
gpio.setup(2, gpio.modes.read, function() {
    gpio.read(2, function(err, data) {
		if (err) throw err;
    	console.log(data);
    });
});

// unexports the pin
gpio.teardown(2, function() {
});

```

## Methods

|Method|Description|
|---|---|
|`setup(pin, mode, cb)`| Sets up the pin up for use and sets the mode on the pin. |
|`teardown(pin, cb)`| Closes the pin so it is not in useany more. |
|`write(pin, value, cb)`| Writes a value to the pin. |
|`read(pin, cb)`| Reads the value of a pin. `cb(err, data)` |


## Properties

| Property |Description|
|---|---|
|`modes`| Provides access to the pin modes. `gpio.modes.write` & `gpio.modes.read` |
