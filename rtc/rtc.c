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


http://www.sciencegizmo.com.au/?p=137 follow this, i almost have it working



/etc/default/hwclock make sure rtc is enabled
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
#define M41T93_REG_ST_SEC    0X01
#define M41T93_REG_MIN       0X02
#define M41T93_REG_CENT_HOUR 0X03
#define M41T93_REG_WDAY      0X04
#define M41T93_REG_DAY       0X05
#define M41T93_REG_MON       0X06
#define M41T93_REG_YEAR      0X07

// #define M41T93_REG_SSEC      0
// #define M41T93_REG_ST_SEC    1
// #define M41T93_REG_MIN       2
// #define M41T93_REG_CENT_HOUR 3
// #define M41T93_REG_WDAY      4
// #define M41T93_REG_DAY       5
// #define M41T93_REG_MON       6
// #define M41T93_REG_YEAR      7

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
binary_conversion
raccepts an int and returns a byte
*******************************************************/
int binary_conversion(int num)
{
    if (num == 0)
    {
        return 0;
    }
    else
    {
        return (num % 2) + 10 * binary_conversion(num / 2);
    }
}

int binary_conversion_char(char num)
{
    if (num == 0)
    {
        return 0;
    }
    else
    {
        return (num % 2) + 10 * binary_conversion(num / 2);
    }
}

/*******************************************************
mask
accepts a byte                                01010101
returns a result with only the last 4 bits.   00000101
*******************************************************/
const int mask(char byte)
{
   uint8_t mask = 0x0f;   // 00001111b
   uint8_t value =  binary_conversion(byte);  // 01010101b
   uint8_t result = mask & value;
   return result;
}

/*******************************************************
rtc_read_time
reads the clock time. pass the address and the tm reference
*******************************************************/
void rtc_read_time(uint8_t address, struct rtc_time *tm)
{
  char command_buf[2];
  command_buf[0] = address |  RTC_READ << 7;
  int century_after_1900;
  printf("Read Time \n");
  printf("printing data time struct: %d | min: %d | hour: %d | day: %d | month: %d | year: %d\n", tm->tm_sec, tm->tm_min, tm->tm_hour, tm->tm_mday, tm->tm_mon, tm->tm_year);
  wiringPiSPIDataRW (SPI_CHAN, command_buf,sizeof(command_buf));    
}

/*******************************************************
rtc_write_time writes the clock time. pass the address and the tm reference
*******************************************************/
void rtc_write_time(uint8_t address, struct rtc_time *tm)
{ 
  struct rtc_time settime;
  char command_buf[1][7];
  command_buf[0][0] = address |  RTC_WRITE << 7;// read bit is 0 then addr for remain 7 bits
  uint8_t * data = &command_buf[1][0]; /* ptr to first data byte */

  tm->tm_sec  = 21 ;
  tm->tm_min  = 11 ;
  tm->tm_hour = 15 ;
  tm->tm_mday = 8  ;
  tm->tm_wday = 5  ;
  tm->tm_mon  = 12 ;
  tm->tm_year = 3  ;

  // declairing the data time registers to the time index from our tm struct
  data[M41T93_REG_SSEC]       = tm->tm_sec  ;
  data[M41T93_REG_ST_SEC]     = tm->tm_sec  ;
  data[M41T93_REG_MIN]        = tm->tm_min  ;
  data[M41T93_REG_CENT_HOUR]  = tm->tm_hour ;
  data[M41T93_REG_DAY]        = tm->tm_mday ;
  data[M41T93_REG_WDAY]       = tm->tm_mday ;
  data[M41T93_REG_MON]        = tm->tm_mon  ;
  data[M41T93_REG_YEAR]       = tm->tm_year ;

  //commang buffer before we send it
  printf("\nprinting command_buf[array]            : buf[0]%d, buf[1]%d\nbuf[1][1] sec  : %d\nbuf[1][2] min  : %d\nbuf[1][3] hour : %d\nbuf[1][5] day  : %d\nbuf[1][6] mon  : %d\nbuf[1][7] year : %d\n", command_buf[0],command_buf[1], command_buf[1][1], command_buf[1][2], command_buf[1][3], command_buf[1][5], command_buf[1][6], command_buf[1][7]);
  printf("\nprinting command_buf binary: \nW/R & Address buf[0]%d\nbuf[1][1] sec  : %d\nbuf[1][2] min  : %d\nbuf[1][3] hour : %d\nbuf[1][5] day  : %d\nbuf[1][6] mon  : %d\nbuf[1][7] year : %d\n", binary_conversion_char(*command_buf[0]), binary_conversion_char(command_buf[1][1]), binary_conversion_char(command_buf[1][2]), binary_conversion_char(command_buf[1][3]), binary_conversion_char(command_buf[1][5]), binary_conversion_char(command_buf[1][6]), binary_conversion_char(command_buf[1][7]));

  wiringPiSPIDataRW (SPI_CHAN, command_buf,sizeof(command_buf));  
  //write command to set the time manually YYYY/MM/DD | HH : MM : SS
  printf("\nWrite time\n");
  printf("printing data time struct: %d | min: %d | hour: %d | day: %d | month: %d | year: %d\n", tm->tm_sec, tm->tm_min, tm->tm_hour, tm->tm_mday, tm->tm_mon, tm->tm_year);
  // printf("printing command_buf[array]            : buf[0]%d, buf[1]%d, buf[2]%d, buf[3]%d\n", command_buf[0], command_buf[1], command_buf[2], command_buf[3]);
  // printf("printing command_buf[array] with binary: buf[0]%d, buf[1]%d, buf[2]%d, buf[3]%d \n\n", binary_conversion(command_buf[0]), binary_conversion(command_buf[1]) , binary_conversion(command_buf[2]), binary_conversion(command_buf[3]));
}

void sync_rtc(uint8_t address)
{
  struct rtc_time *tm;
  tm->tm_sec  = 51;
  tm->tm_min  = 11;
  tm->tm_hour = 15;
  tm->tm_mday = 38;
  tm->tm_wday = 35;
  tm->tm_mon  = 86;
  tm->tm_year = 57;

  char command_buf[1];
  uint8_t * data; /* data byte */
  data = &command_buf[1]; /* ptr to first data byte */
  data[M41T93_REG_SSEC]       = 0;
  data[M41T93_REG_ST_SEC]     = BIN2BCD(tm->tm_sec);
  data[M41T93_REG_MIN]        = BIN2BCD(tm->tm_min);
  data[M41T93_REG_CENT_HOUR]  = BIN2BCD(tm->tm_hour) | ((tm->tm_year/100-1) << 6);
  data[M41T93_REG_DAY]        = BIN2BCD(tm->tm_mday);
  data[M41T93_REG_WDAY]       = BIN2BCD(tm->tm_mday + 1);
  data[M41T93_REG_MON]        = BIN2BCD(tm->tm_mon + 1);
  data[M41T93_REG_YEAR]       = BIN2BCD(tm->tm_year % 100);
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

