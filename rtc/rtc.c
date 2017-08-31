/***************************************************************************
//real time clock this has the read write functions
// data sheet: http://www.mouser.com/ds/2/389/m41t93-955030.pdf
// supports SPI mode 0

 possibly needs a lithion ion battery. TEST

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

<<<<<<< HEAD
TODO Write Time
TODO Network sync Time

  https://github.com/google/kmsan/blob/master/drivers/rtc/rtc-m41t93.c this is a good resource same rtc chip

  https://github.com/mxgxw/MFRC522-python/blob/master/MFRC522.py reasource in python with similar chip


TODO load rtc-m41t93.ko kernal with modprobe or enable at boot in config file, or added int /etc/rc.local
    sudo modprobe rtc-m41t93 , check its loaded with lsmod

*****************************************************************************
****************************  Libraries  *************************************************/

#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <errno.h>
#include <string.h>
#include <wiringPi.h> //importing wiringPi library for pin mapping I/O control
#include <inttypes.h>
#include <linux/kernel.h>
#include "rtc.h"

/**************************** GLOBALS *************************************************/
#define RTC_CS          11    //wiringPi pin
#define RTC_READ        0
#define RTC_WRITE       1
#define STP_BIT         0
#define SPI_CLK_SPEED   5000000 //10mhz is max, 1mhz is min
#define SPI_CHAN        1      // chip select 1
#define SPI_MODE        0      // supports SPI mode 0 [CPOL = 0, CPHA = 0]
#define CLK_SIZE        12
#define ADDR            22 

/**************************** TIME REGISTER ADDRESSES *************************************************/
#define SECOND        0X01  // register address
#define MINUTE        0X02  // register address
#define HOUR          0X03  // register address
#define DAY           0X05  // register address
#define MONTH         0X06  // register address
#define YEAR          0X07  // register address
#define HALT          0X0C  // Halt bit, bit 6
#define DIGITAL_CALIB 0X08    // digital callibration register
#define ANALOG_CALIB  0X12    // analog callibration register

#define M41T93_REG_SSEC      0
#define M41T93_REG_ST_SEC    1
#define M41T93_REG_MIN       2
#define M41T93_REG_CENT_HOUR 3
#define M41T93_REG_WDAY      4
#define M41T93_REG_DAY       5
#define M41T93_REG_MON       6
#define M41T93_REG_YEAR      7

// static int  second  = 0Xe7;
// static int  minute  = 0Xc2;
// static int  hour  = 0Xd3;
// static int  day   = 0Xa5;
// static int  month   = 0Xb6;
// static int  year  = 0Xc7;

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

  pinMode (RTC_CS, OUTPUT);
  digitalWrite (RTC_CS, HIGH) ;

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
read_rtc readz the clock time 
*******************************************************/
int read_rtc(int address, uint8_t *data)
{
  //register 1 - 8 reads: 00h(1)-mircosec, 01h(2)-mircosec, 02h(3)-min, 03h(4)-hour, 04h(5)-day/week, 05h(6)-day/month, 06h(7)-month, 07(8)-year  
    char command_buf[CLK_SIZE];
    memset(command_buf, 0, sizeof(command_buf));
    command_buf[0] = address |  RTC_READ << 7; // read bit is 0 then addr for remain 7 bits
    int i;
    for(i = 0 ; i < 5000; i ++)
    {
      wiringPiSPIDataRW (SPI_CHAN, command_buf,sizeof(command_buf));
    }
  printf("Address(%x) %x  %x  %x  %x  %x  %x  %x \n", command_buf[0],command_buf[1],command_buf[2],command_buf[3], command_buf[4], command_buf[5], command_buf[6], command_buf[7],command_buf[8]);
  return 0;
    memcpy(data, &command_buf[2], CLK_SIZE);
  printf("Address(%x) %x  %x  %x  %x  %x  %x  %x \n", command_buf[0],command_buf[1],command_buf[2],command_buf[3], command_buf[4], command_buf[5], command_buf[6], command_buf[7],command_buf[8]);
}

/*******************************************************
write_rtc writes the clock time
writing anywhere in 00h - 07h registers will result in an update of the RTC counters
*******************************************************/
// int write_rtc(int address, uint8_t *data)
// {
//     char command_buf[CLK_SIZE];
//     memset(command_buf, 0, sizeof(command_buf));
//     command_buf[0] = address |  RTC_WRITE << 7;// read bit is 0 then addr for remain 7 bits

//     //write command to set the time manually YYYY/MM/DD | HH : MM : SS
//     printf("ENTER DATE YYYY/MM/DD | HH : MM : SS\n");

//     wiringPiSPIDataRW (SPI_CHAN, command_buf,sizeof(command_buf));
//     memcpy(data, &command_buf[2], CLK_SIZE);
//     return 0;
// }

int binary_conversion(int num)
{
    if (num == 0)
    {
        return 0;
    }
    else
    {
        printf("bin conversion: %d\n", num);
        return (num % 2) + 10 * binary_conversion(num / 2);
    }

}

const int mask(char byte)
{
   printf("value %d\n",  binary_conversion(byte));
   uint8_t mask = 0x0f;   // 00001111b
   uint8_t value =  binary_conversion(byte);  // 01010101b
   uint8_t result = mask & value;
   printf("result %d\n", binary_conversion(result));
   return result;
}

void get_time_rtc(uint8_t address, struct rtc_time *tm)
{
  uint8_t command_buf[32];
  command_buf[0] = address |  RTC_READ << 7;
  int century_after_1900;
 
  /* Check status of clock. Two states must be considered:
     1. halt bit (HT) is set: the clock is running but update of readout
        registers has been disabled due to power failure. This is normal
        case after poweron. Time is valid after resetting HT bit.
     2. oscillator fail bit (OF) is set: time is invalid.
  */
  
  // tm->tm_sec  = BCD2BIN(command_buf[M41T93_REG_ST_SEC]);
  // tm->tm_min  = BCD2BIN(command_buf[M41T93_REG_MIN]);
  // tm->tm_hour = BCD2BIN(command_buf[M41T93_REG_CENT_HOUR] & 0x3f);
  // tm->tm_mday = BCD2BIN(command_buf[M41T93_REG_DAY]);
  // tm->tm_mon  = BCD2BIN(command_buf[M41T93_REG_MON]) - 1;
  // tm->tm_wday = BCD2BIN(command_buf[M41T93_REG_WDAY] & 0x0f) - 1;
  // century_after_1900 = (command_buf[M41T93_REG_CENT_HOUR] >> 6) + 1;
  // tm->tm_year = BCD2BIN(command_buf[M41T93_REG_YEAR]) + century_after_1900 * 100;

   wiringPiSPIDataRW (SPI_CHAN, command_buf,sizeof(command_buf));    
  printf("Get Time\n");
  printf("sec: %d | min: %d | hour: %d | day: %d | month: %d | year: %d\n", binary_conversion(tm->tm_sec),  binary_conversion(tm->tm_min), binary_conversion(tm->tm_hour), binary_conversion(tm->tm_mday), binary_conversion(tm->tm_mon), binary_conversion(tm->tm_year));  
  printf("tm : %d\n", tm);
  printf("tm_sec : %d\n", tm->tm_sec);
  printf("tm_min : %d\n", tm->tm_min);
  printf("tm_hour : %d\n", tm->tm_hour);
  printf("tm_day/month : %d\n", tm->tm_mday);
  printf("tm_day/week : %d\n", tm->tm_wday);
  printf("tm_month : %d\n", tm->tm_mon);
  printf("tm_year : %d\n\n", tm->tm_year);

  printf("bin tm_sec : %d\n", BCD2BIN(command_buf[M41T93_REG_ST_SEC]));
  printf("bin tm_min : %d\n", BCD2BIN(command_buf[M41T93_REG_MIN]));
  printf("bin tm_hour : %d\n", BCD2BIN(command_buf[M41T93_REG_CENT_HOUR] & 0x3f));
  printf("bin tm_day/month : %d\n", BCD2BIN(command_buf[M41T93_REG_DAY]));
  printf("bin tm_day/week : %d\n", BCD2BIN(command_buf[M41T93_REG_WDAY] & 0x0f) - 1);
  printf("bin tm_month : %d\n", tm->tm_mon);
  printf("bin tm_year : %d\n\n", BCD2BIN(command_buf[M41T93_REG_YEAR]) + century_after_1900 * 100);

  printf("buf tm_sec : %d\n", command_buf[M41T93_REG_ST_SEC]);
  printf("buf tm_min : %d\n", command_buf[M41T93_REG_MIN]);
  printf("buf tm_hour : %d\n", command_buf[M41T93_REG_CENT_HOUR]);
  printf("buf tm_day/month : %d\n", command_buf[M41T93_REG_DAY]);
  printf("buf tm_day/week : %d\n", command_buf[M41T93_REG_WDAY]);
  printf("buf tm_month : %d\n", command_buf[M41T93_REG_MON]);
  printf("buf tm_year : %d\n", command_buf[M41T93_REG_YEAR]);

  printf("global sec : %d\n", command_buf[M41T93_REG_ST_SEC]);
  printf("global tm_min : %d\n", command_buf[M41T93_REG_MIN]);
  printf("global tm_hour : %d\n", command_buf[M41T93_REG_CENT_HOUR]);
  printf("global tm_day/month : %d\n", command_buf[M41T93_REG_DAY]);
  printf("global tm_day/week : %d\n", command_buf[M41T93_REG_WDAY]);
  printf("global tm_month : %d\n", command_buf[M41T93_REG_MON]);
  printf("global tm_year : %d\n", command_buf[M41T93_REG_YEAR]);

}

/*******************************************************
set_time_rtc sets the clock time
*******************************************************/
void set_time_rtc(uint8_t address, struct rtc_time *tm)
{ 
  struct rtc_time settime;
  uint8_t command_buf[9];
  command_buf[0] = address |  RTC_WRITE << 7;// read bit is 0 then addr for remain 7 bits
  uint8_t * data = &command_buf[1]; /* ptr to first data byte */

  // segmentation error because of BIN2BCD equaiton
  data[M41T93_REG_SSEC]       = 0;
  data[M41T93_REG_ST_SEC]     = BIN2BCD(tm->tm_sec);
  data[M41T93_REG_MIN]        = BIN2BCD(tm->tm_min);
  data[M41T93_REG_CENT_HOUR]  = BIN2BCD(tm->tm_hour) | ((tm->tm_year/100-1) << 6);
  data[M41T93_REG_DAY]        = BIN2BCD(tm->tm_mday);
  data[M41T93_REG_WDAY]       = BIN2BCD(tm->tm_mday + 1);
  data[M41T93_REG_MON]        = BIN2BCD(tm->tm_mon + 1);
  data[M41T93_REG_YEAR]       = BIN2BCD(tm->tm_year % 100);
  
  int i;
  for(i = 0 ; i < 2; i ++)
    {
      wiringPiSPIDataRW (SPI_CHAN, command_buf,sizeof(command_buf));
    }
   // wiringPiSPIDataRW (SPI_CHAN, command_buf,sizeof(command_buf));  

  //write command to set the time manually YYYY/MM/DD | HH : MM : SS
  printf("\nSET Time\n");
  //printf("sec: %d | min: %d | hour: %d | day: %d | month: %d | year: %d\n", BIN2BCD( data[M41T93_REG_ST_SEC]), BIN2BCD(tm->tm_min),BIN2BCD(tm->tm_hour),BIN2BCD(tm->tm_mday), tm->tm_mon, tm->tm_year);
  printf("Address: %d | sec: %d | min: %d | hour: %d | day: %d | month: %d | year: %d\n",binary_conversion(address |  RTC_WRITE << 7), binary_conversion(tm->tm_sec),  binary_conversion(tm->tm_min), binary_conversion(tm->tm_hour), binary_conversion(tm->tm_mday), binary_conversion(tm->tm_mon), binary_conversion(tm->tm_year));  
 
  printf("bit masked minute: %d\n", mask(binary_conversion(tm->tm_hour)));

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

