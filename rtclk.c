//real time clock this has the read write functions

#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <errno.h>
#include <string.h>

#include <wiringPi.h> //importing wiringPi library for pin mapping I/O control

#define SPI_CLK_SPEED   100000 //TODO look up time in data sheet max clk speed
#define SPI_CHAN    	1      //chip select 1
#define SPI_MODE        0 	

static void rtc_setup()
{
//static GPIO states, probably dont need this
}

void rtc_init()
{

  int fd;
  wiringPiSetup(); //wiringPi setups up pin mapping and Rpi's SPI devices
  rtc_Setup();    //initialize pin modes, and pin states 
  if ((fd = wiringPiSPISetupMode (SPI_CHAN, speed, MODE)) < 0)  //tests to see if SPI bus file device is seen
  {
    fprintf (stderr, "Can't open the SPI bus: %s\n", strerror (errno)) ;
    exit (EXIT_FAILURE) ;
  }
}