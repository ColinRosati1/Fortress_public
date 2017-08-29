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

TODO Write Time
TODO Network sync Time

****************************  Libraries  *************************************************/

#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <errno.h>
#include <string.h>
#include <wiringPi.h> //importing wiringPi library for pin mapping I/O control
#include <inttypes.h>
#include "rtc.h"

/**************************** GLOBALS *************************************************/
#define RTC_CS			11		//wiringPi pin
#define RTC_READ		0
#define RTC_WRITE		1
#define STP_BIT 		0
#define SPI_CLK_SPEED   5000000 //10mhz is max, 1mhz is min
#define SPI_CHAN    	1      // chip select 1
#define SPI_MODE        0 	   // supports SPI mode 0 [CPOL = 0, CPHA = 0]
#define CLK_SIZE		32

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

/*******************************************************
rtc_setup initializes pins for reading and writing
opens and tests SPI channel
*******************************************************/
void rtc_init()
{
  int fd;
  wiringPiSetup(); //wiringPi setups up pin mapping and Rpi's SPI devices
  if ((fd = wiringPiSPISetupMode (SPI_CHAN, SPI_CLK_SPEED, SPI_MODE)) < 0)  //tests to see if SPI bus file device is seen
  {
    fprintf (stderr, "Can't open the SPI bus: %s\n", strerror (errno)) ;
    exit (EXIT_FAILURE) ;
  }
  //clear the stop bit to 0
	char command_buf[3];
  	memset(command_buf, 0, sizeof(command_buf));
  	command_buf[2] = STP_BIT << 7; // make sure sets stop bit is set to 0
  	wiringPiSPIDataRW (SPI_CHAN, command_buf,(command_buf + 3));
}

/*******************************************************
rtc_halt_clear is used for when rtc powers into battery mode, the halt bit is set to 1 and will not update
halt bit at 0X0Ch bit 6 needs to be set to 0 to update
*******************************************************/
void rtc_halt_clear()
{
	char command_buf[14];
  	command_buf[13] = 0 << 6; // make sure sets stop bit is set to 0
  	wiringPiSPIDataRW (SPI_CHAN, command_buf,(command_buf + 3));
}

/*******************************************************
clock_set resets clock
*******************************************************/
void clock_set()
{
	char command_buf[3];
  	memset(command_buf, 0, sizeof(command_buf));
  	command_buf[2] = 1 << 7; // make sure sets stop bit is set to 0
  	wiringPiSPIDataRW (SPI_CHAN, command_buf,(command_buf + 3));
  	command_buf[2] = STP_BIT << 7; // make sure sets stop bit is set to 0
  	wiringPiSPIDataRW (SPI_CHAN, command_buf,(command_buf + 3));
}

// const char *byte_to_binary(int x)
// {
// //     static char b[9];
// //     b[0] = '\0';
// //     int z;
// //     for (z = 128; z > 0; z >>= 1){ strcat(b, ((x & z) == z) ? "1" : "0");}
// //     return b;
//  }

int read_time()
{
	//TODO #1 make a bin mask to read back time because [0,0,0,0,0,0,0,0] - Time uses 0 - 3 as the time bits
	//TODO #2 (optional weigh pros/cons of #1 & #2)make a binary[0000000] into 02d[00] int convertor
	//bitmask();

	//printf("TIME\n Year %02d : Month %02d : Day %02d :\n%02d : %02d : %02d\n",byte_to_binary(year),byte_to_binary(month),byte_to_binary(day),byte_to_binary(hour),byte_to_binary(minute),byte_to_binary(second));
}

void read_rtc(int address, char *data)
{
	//register 1 - 8 reads: 00h(1)-mircosec, 01h(2)-mircosec, 02h(3)-min, 03h(4)-hour, 04h(5)-day/week, 05h(6)-day/month, 06h(7)-month, 07(8)-year  
	char command_buf[CLK_SIZE];
  	memset(command_buf, 0, sizeof(command_buf));
  	command_buf[0] = address |  RTC_READ << 7; // read bit is 0 then addr for remain 7 bits
  	int i;
  	for(i = 0 ; i < 50000; i ++)
  	{
  		wiringPiSPIDataRW (SPI_CHAN, command_buf,sizeof(command_buf));
  	}
  	memcpy(data, &command_buf[2], CLK_SIZE);
	printf("Address(%x) %x  %x  %x  %x  %x  %x  %x \n", command_buf[0],command_buf[1],command_buf[2],command_buf[3], command_buf[4], command_buf[5], command_buf[6], command_buf[7],command_buf[8]);
}

void write_rtc(int address, char *data)
{
	//writing anywhere in 00h - 07h registers will result in an update of the RTC counters and a reset of the divider chain
	char command_buf[CLK_SIZE];
  	memset(command_buf, 0, sizeof(command_buf));
  	
  	command_buf[0] = address |  RTC_WRITE << 7;// read bit is 0 then addr for remain 7 bits

  	//write command to set the time manually YYYY/MM/DD | HH : MM : SS
  	printf("ENTER DATE YYYY/MM/DD | HH : MM : SS\n");
  	// scanf("%d", command_buf[8] << 3); scanf("%d", command_buf[8] << 2); scanf("%d", command_buf[8] << 1); scanf("%d",  command_buf[8]);
  	// // MONTH
  	// scanf("%d", command_buf[7] << 1); scanf("%d",  command_buf[7]);
  	// // DAY
  	// scanf("%d", command_buf[5] << 1); scanf("%d", command_buf[5]);
  	// // HOUR
  	// scanf("%d", command_buf[4] << 1); scanf("%d", command_buf[4]);
  	// // MINUTE
  	// scanf("%d", command_buf[3] << 1); scanf("%d", command_buf[3]);
  	// // SEC
  	// scanf("%d", command_buf[2] << 1); scanf("%d", command_buf[2]);
  	
  	wiringPiSPIDataRW (SPI_CHAN, command_buf,sizeof(command_buf));
  	memcpy(data, &command_buf[2], CLK_SIZE);
	//printf("%02i/%02i/%02i | %02D : %02D : %02D\n", command_buf[8],command_buf[7],command_buf[5],command_buf[4],command_buf[3],command_buf[2]);
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