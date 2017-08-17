/***************************************************************************
//real time clock this has the read write functions
// data sheet: http://www.mouser.com/ds/2/389/m41t93-955030.pdf
// supports SPI mode 0

TODO possibly needs a lithion ion battery. TEST

Functions : 
	non-volatile time-of-day clock/calendar,
	alarm
	interrupt, 
	watchdog timer, 
	programmable 8-bit counter, 
	square wave outputs

After power-on, CS1 (E) is held low. required prior to the start of any operation

A typical power-up flow is to read the time of last access, then clear the HT bit, then read the
current time. 
*****************************************************************************/
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <errno.h>
#include <string.h>

#include <wiringPi.h> //importing wiringPi library for pin mapping I/O control

#define SPI_CLK_SPEED   100000 //TODO look up time in data sheet max clk speed
#define SPI_CHAN    	1      //chip select 1
#define SPI_MODE        0 	   // supports SPI mode 0 [CPOL = 0, CPHA = 0]

/**************************** GLOBALS *************************************************/
#define RTC_CS			11		//wiringPi pin

#define RTC_READ		0
#define RTC_WRITE		1

/**************************** TIME REGISTER ADDRESSES *************************************************/
#define SECOND 			0X01	// register address
#define	MINUTE			0X02	// register address
#define	HOUR 			0X03	// register address
#define	DAY 			0X05	// register address
#define	MONTH 			0X06	// register address
#define	YEAR 			0X07	// register address
#define HALT 			0X0C	// Halt bit, bit 6
#define DIGITAL_CALIB   0X08    // digital callibration register
#define ANALOG_CALIB    0X12    // analog callibration register

static int  second  =	0Xe7;
static int	minute	=	0Xc2;
static int	hour 	=	0Xd3;
static int	day 	=	0Xa5;
static int	month 	=	0Xb6;
static int	year 	=	0Xc7;


static int address 		20; 	//TODO check address accessible starting points?

static void rtc_setup()
{
//static GPIO states, probably dont need this
//TODO confirm CS is low on boot
	pinmode(RTC_CS, OUTPUT);
	digitalwrite(RTC_CS, LOW);
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

/*******************************************************
rtc_halt_clear is used for when rtc powers into battery mode, the halt bit is set to 1 and will not update
halt bit at 0X0Ch bit 6 needs to be set to 0 to update
*******************************************************/
void rtc_halt_clear()
{
	uint8_t value = 0 		// not sure if this is proper to set 0 to the 6th bit at register 0X0Ch
	uint8_t Haltclear = value&~(1<<6)
}

void clock_set()
{
	char buf[8]
	buf[0] = 1;// set the ST bit to 1
	buf[0] = 0;// reset the ST bit to “kick-start” to the oscillator circuit.
}

const char *byte_to_binary(int x)
{
    static char b[9];
    b[0] = '\0';
    int z;
    for (z = 128; z > 0; z >>= 1){ strcat(b, ((x & z) == z) ? "1" : "0");}
    return b;
}

int read_time()
{
	//TODO #1 make a bin mask to read back time because [0,0,0,0,0,0,0,0] - Time uses 0 - 3 as the time bits
	//TODO #2 (optional weigh pros/cons of #1 & #2)make a binary[0000000] into 02d[00] int convertor
	bitmask();
	

	

	printf("TIME\n Year %02d : Month %02d : Day %02d :\n%02d : %02d : %02d\n",byte_to_binary(year),byte_to_binary(month),byte_to_binary(day),byte_to_binary(hour),byte_to_binary(minute),byte_to_binary(second))
}

void read_rtc()
{
	// binary coded decimal (BCD) format
	//read the time, frequency, alarms, flags
	//read from address and bit 
	//address 00H - 07H for time
	// 08H for digital calibration
	// 09H Watch dog
	// 0AH - 0EH alarms
	// 0FH Flags
	// 10H Timer value
	// 11H Timer control
	// 12H Alanlog calibration
	// 13H Square Wave
	// 14H - 18H Alarms 2
	// 19H - 1FH SRAM

	//read the year, month, day, hour, min, sec  

	char buf[4];
	buf[0] = RTC_READ; //opcode
	buf[0] = address >> 8;
	// or buf[0] RTC_READ + address >>7
	// buf[0] = 1 0 0 0 1 0 1 1  
	//          R < A D D R - >     1st bit is RW, 2nd - 8th is address
	buf[1] = data

	read_time()
}

void write_rtc()
{
	//writing anywhere in 00h - 07h registers will result in an update of the RTC counters and a reset of the divider chain
}

void alarm()
{
	// binary coded decimal (BCD) format
}

void interrupt()
{

}

void watchdot_timer()
{
	// binary format
}

void counter()
{

}

void squarewave()
{
	// binary format
}

/*******************************************************
analog_calib adjust internal (on-chip Cx1, Cx0) load
capacitors for oscillator capacitance trimming. Nominally 25 pF each,
*******************************************************/
void analog_calib()
{

}

/*******************************************************
digital_calib calibrates the clock accuracy by adjusting the capacitance load
The total possible compensation is typically –93 ppm to +156 ppm
A digital calibration register (08h) can also be used to adjust the clock counter by
adding or subtracting a pulse at the 512 Hz divider stage.
*******************************************************/
void digital_calib()
{

}