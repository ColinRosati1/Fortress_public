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

	https://github.com/google/kmsan/blob/master/drivers/rtc/rtc-m41t93.c this is a good resource same rtc chip

  https://github.com/mxgxw/MFRC522-python/blob/master/MFRC522.py reasource in python with similar chip


TODO load rtc-m41t93.ko kernal with modprobe or enable at boot in config file, or added int /etc/rc.local
    sudo modprobe rtc-m41t93 , check its loaded with lsmod

*****************************************************************************/

#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <errno.h>
#include <string.h>
#include <wiringPi.h> //importing wiringPi library for pin mapping I/O control
#include <inttypes.h>
#include <linux/kernel.h>

#include "rtc.h"

#define SPI_CLK_SPEED   5000000 //10mhz is max, 1mhz is min
#define SPI_CHAN    	1      // chip select 1
#define SPI_MODE        0 	   // supports SPI mode 0 [CPOL = 0, CPHA = 0]
#define CLK_SIZE		32

/**************************** GLOBALS *************************************************/
#define RTC_CS			11		//wiringPi pin
#define RTC_READ		0
#define RTC_WRITE		1
#define STP_BIT 		0

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

#define M41T93_REG_SSEC     0
#define M41T93_REG_ST_SEC   1
#define M41T93_REG_MIN      2
#define M41T93_REG_CENT_HOUR    3
#define M41T93_REG_WDAY     4
#define M41T93_REG_DAY      5
#define M41T93_REG_MON      6
#define M41T93_REG_YEAR     7

static int  second  =	0Xe7;
static int	minute	=	0Xc2;
static int	hour 	=	0Xd3;
static int	day 	=	0Xa5;
static int	month 	=	0Xb6;
static int	year 	=	0Xc7;


// do these work?
#define BCD2BIN(val) (((val)&15) + ((val)>>4)*10)
#define BIN2BCD(val) ((((val)/10)<<4) + (val)%10)

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


int read_time()
{
	//TODO #1 make a bin mask to read back time because [0,0,0,0,0,0,0,0] - Time uses 0 - 3 as the time bits
	//TODO #2 (optional weigh pros/cons of #1 & #2)make a binary[0000000] into 02d[00] int convertor
	//bitmask();

	//printf("TIME\n Year %02d : Month %02d : Day %02d :\n%02d : %02d : %02d\n",byte_to_binary(year),byte_to_binary(month),byte_to_binary(day),byte_to_binary(hour),byte_to_binary(minute),byte_to_binary(second));
}

/*******************************************************
read_rtc readz the clock time
*******************************************************/
int read_rtc(int address, uint8_t *data)
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
	printf("Address(%x) %x  %x  %x  %x  %x  %x  %x \n", command_buf[0],command_buf[1],command_buf[2],command_buf[3], command_buf[4], command_buf[5], command_buf[6], command_buf[7],command_buf[8]);
  return 0;
}

/*******************************************************
write_rtc writes the clock time
writing anywhere in 00h - 07h registers will result in an update of the RTC counters
*******************************************************/
int write_rtc(int address, uint8_t *data)
{
		char command_buf[CLK_SIZE];
  	memset(command_buf, 0, sizeof(command_buf));
  	command_buf[0] = address |  RTC_WRITE << 7;// read bit is 0 then addr for remain 7 bits

  	//write command to set the time manually YYYY/MM/DD | HH : MM : SS
  	printf("ENTER DATE YYYY/MM/DD | HH : MM : SS\n");

  	wiringPiSPIDataRW (SPI_CHAN, command_buf,sizeof(command_buf));
  	memcpy(data, &command_buf[2], CLK_SIZE);
    return 0;
}

 // struct rtc_time 
 // {
 //    uint8_t tm_sec;
 //    uint8_t tm_min;
 //    uint8_t tm_hour;
 //    uint8_t tm_mday;
 //    uint8_t tm_wday;
 //    uint8_t tm_mon;
 //    uint8_t tm_year;
 //  };

/*******************************************************
set_time_rtc sets the clock time
*******************************************************/
void set_time_rtc(uint8_t address, uint8_t bytes)
{ 
  struct rtc_time *tm;
  uint8_t command_buf[32];
  command_buf[0] = address |  RTC_WRITE << 7;// read bit is 0 then addr for remain 7 bits
  uint8_t * const data = &command_buf[1]; /* ptr to first data byte */
  //command_buf[9] =  bytes;        /* write cmd + 8 data bytes */

  data[M41T93_REG_SSEC]       = 0;
  data[M41T93_REG_ST_SEC]     = BIN2BCD(tm->tm_sec);
  data[M41T93_REG_MIN]        = BIN2BCD(tm->tm_min);
  data[M41T93_REG_CENT_HOUR]  = BIN2BCD(tm->tm_hour) | ((tm->tm_year/100-1) << 6);
  data[M41T93_REG_DAY]        = BIN2BCD(tm->tm_mday);
  data[M41T93_REG_WDAY]       = BIN2BCD(tm->tm_mday + 1);
  data[M41T93_REG_MON]        = BIN2BCD(tm->tm_mon + 1);
  data[M41T93_REG_YEAR]       = BIN2BCD(tm->tm_year % 100);

  wiringPiSPIDataRW (SPI_CHAN, command_buf,sizeof(command_buf));


  //write command to set the time manually YYYY/MM/DD | HH : MM : SS
  printf("ENTER DATE YYYY/MM/DD | HH : MM : SS\n");
  
}

void get_time_rtc()
{
  struct rtc_time *tm;
  const uint8_t start_addr = 0;
  uint8_t buf[8];
  int century_after_1900;
  int tmp;
  int ret = 0;

  /* Check status of clock. Two states must be considered:
     1. halt bit (HT) is set: the clock is running but update of readout
        registers has been disabled due to power failure. This is normal
        case after poweron. Time is valid after resetting HT bit.
     2. oscillator fail bit (OF) is set: time is invalid.
  */
  

  tm->tm_sec  = BCD2BIN(buf[M41T93_REG_ST_SEC]);
  tm->tm_min  = BCD2BIN(buf[M41T93_REG_MIN]);
  tm->tm_hour = BCD2BIN(buf[M41T93_REG_CENT_HOUR] & 0x3f);
  tm->tm_mday = BCD2BIN(buf[M41T93_REG_DAY]);
  tm->tm_mon  = BCD2BIN(buf[M41T93_REG_MON]) - 1;
  tm->tm_wday = BCD2BIN(buf[M41T93_REG_WDAY] & 0x0f) - 1;

  century_after_1900 = (buf[M41T93_REG_CENT_HOUR] >> 6) + 1;
  tm->tm_year = BCD2BIN(buf[M41T93_REG_YEAR]) + century_after_1900 * 100;

  // return ret < 0 ? ret : rtc_valid_tm(tm);
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

