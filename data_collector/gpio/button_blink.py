import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BOARD)

GPIO.setup(40, GPIO.IN, pull_up_down=GPIO.PUD_UP)
GPIO.setup(19, GPIO.OUT)
GPIO.setup(23, GPIO.OUT)

while True:
    input_state = GPIO.input(40)
    if input_state == False:
        print('Button Pressed')
        GPIO.output(19,True)
	GPIO.output(23,False)
        time.sleep(0.2)
    else:
    	GPIO.output(19,False)
	GPIO.output(23,True)
