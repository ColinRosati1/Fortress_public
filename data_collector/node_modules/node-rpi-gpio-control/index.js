const fs = require('fs');

function rpiGPIOControl() {

    let pinsOn = [];

    this.modes = {
        write: 'out',
        read: 'in'
    };

    const paths = {
        export: '/sys/class/gpio/export',
        unexport: '/sys/class/gpio/unexport',
        pin: '/sys/class/gpio/gpio',
        direction: '/direction',
        value: '/value'
    };

    this.setup = function(pin, mode, cb) {
        fs.writeFile(paths.export, pin, function() {
            pinsOn.push(pin);
            fs.writeFile(paths.pin + pin + paths.direction, mode, cb);
        });
    };

    this.teardown = function(pin, cb) {
        fs.writeFile(paths.unexport, pin, function(){
            pinsOn.splice(pinsOn.indexOf(pin), 1);
            cb();
        });
    };


    this.write = function(pin, value, cb) {
        fs.writeFile(paths.pin + pin + paths.value, value, cb);
    };

    this.read = function(pin, cb) {
        fs.readFile(paths.pin + pin + paths.value, cb);
    };
}

module.exports = new rpiGPIOControl;
