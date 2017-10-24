#***********************************************************************
# data_collector.py
# RPi data collector for detectors using fti-flash gem.
# Interfaces with breakout circuit with LED and buttons
#

# requirements:
# 	for FTI-flash Raspbian needs:
#		 sudo apt-get install ruby-dev
# 		 colorize --version 0.7.7
# 		 eventmachine --version 1.0.0 ??
#***********************************************************************

import RPi.GPIO as GPIO
import time
import subprocess # used for command line processes
import datetime

GPIO.setmode(GPIO.BOARD)
GPIO.setup(40, GPIO.IN, pull_up_down=GPIO.PUD_UP)
GPIO.setup(19, GPIO.OUT)
GPIO.setup(23, GPIO.OUT)

f = open('datafile', 'a') #opens file for read and
command = subprocess.check_output(['fti arm-conf'], shell=True) #calls a command process
# (('grep', 'process_name'), stdin=ps.stdout)

try: 
	while True:
	    input_state = GPIO.input(40)
	    if (GPIO.input(40) == True):
		    GPIO.output(19,True)
		    time.sleep(0.05)
		    GPIO.output(19,False)
		    time.sleep(0.05)
	    if input_state == False:
	        print('Button Pressed - executing ...')
		GPIO.output(23,True)
		f.write('\n')
	    	f.write(command) #write our command to text file
	    	f.write(datetime.datetime.now().ctime())
	    	f.write('\n')
	        time.sleep(1)
	        GPIO.output(23,False)
	        time.sleep(0.2)
	    else:
			GPIO.output(23,False)


except KeyboardInterrupt:  
    # exits when you press CTRL+C  
    print " EXIT\n"   
  
except:  
    # this catches ALL other exceptions including errors.  
    # You won't get any error messages for debugging  
    # so only use it once your code is working  
    print "Other error or exception occurred!"  
  
finally:  
    GPIO.cleanup() # this ensures a clean exit  
    f.close()