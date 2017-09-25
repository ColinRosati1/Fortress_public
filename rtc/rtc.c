/***************************************************************************
//real time clock interfaces RPI with m4t193 over SPI (mode 0)
// data sheet: http://www.mouser.com/ds/2/389/m41t93-955030.pdf

Functions : 
  rtc_init()
  rtc_halt_clear()
  rtc_read_time()
  rtc_write_time()
  rtc_sync()
  rtc_ntp_time()


// connect a ntp server???

/****************************  Libraries  *************************************************/
#include <stdio.h>
#include <stdlib.h>  
#include <stdint.h>
#include <errno.h>
#include <string.h>
#include <wiringPi.h> //importing wiringPi library for pin mapping I/O control
#include <inttypes.h>
#include <linux/kernel.h>
#include <time.h> // for time sync 
#include "rtc.h"

/**************************** GLOBALS *************************************************/
#define RTC_CS          11    //wiringPi pin
#define RTC_READ        0
#define RTC_WRITE       1
#define STP_BIT_CLEAR         0
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

#define M41T93_REG_SSEC      0//0
#define M41T93_REG_ST_SEC    1//0X01
#define M41T93_REG_MIN       2//0X02
#define M41T93_REG_CENT_HOUR 3//0X03
#define M41T93_REG_WDAY      4//0X04
#define M41T93_REG_DAY       5//0X05
#define M41T93_REG_MON       6//0X06
#define M41T93_REG_YEAR      7//0X07

#define BCD2BIN(val) (((val)&15) + ((val)>>4)*10)
#define BIN2BCD(val) ((((val)/10)<<4) + (val)%10)

struct tm rtc_tm;
struct tm rtc_ptr;

/*******************************************************
rtc_setup initializes pins for reading and writing
opens and tests SPI channel
*******************************************************/
void rtc_ntp_time();

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
  rtc_ntp_time();

  //clear the stop bit to 0
  char command_buf[3];
  memset(command_buf, 0, sizeof(command_buf));
  command_buf[2] = STP_BIT_CLEAR << 7; // make sure sets stop bit is set to 0
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
void rtc_read_time(uint8_t address, struct tm *rtc_ptr, int ptr_size)
{
  char command_buf[9];
  command_buf[0]        = (char)address |  RTC_READ << 7;
  command_buf[1]        = (char)rtc_ptr->tm_sec  ;
  command_buf[2]        = (char)rtc_ptr->tm_min  ;
  command_buf[3]        = (char)rtc_ptr->tm_hour ;
  command_buf[5]        = (char)rtc_ptr->tm_mday ;
  command_buf[6]        = (char)rtc_ptr->tm_mon + 1 ;
  command_buf[7]        = (char)rtc_ptr->tm_year % 100;

  wiringPiSPIDataRW (SPI_CHAN, command_buf,sizeof(command_buf));  
  printf("rtc_read_time\n");
  printf ("Current local time and date: %s", asctime(rtc_ptr));
  printf("command_buf[]  %d %d %d:%d:%d %d\n",command_buf[6], command_buf[5], command_buf[3], command_buf[2], command_buf[1],command_buf[7]);
  // printf("struct         %d %d %d:%d:%d %d\n\n", rtc_ptr->tm_mon + 1, rtc_ptr->tm_mday,rtc_ptr->tm_hour,rtc_ptr->tm_min,rtc_ptr->tm_sec, rtc_ptr->tm_year % 100)  ;
  }


/*******************************************************
rtc_write_time writes the clock time. pass the address and the tm reference
*******************************************************/
void rtc_write_time(uint8_t address, struct tm *rtc_ptr, int ptr_size)
{ 
  printf("Enter a time expressed as month:day hh:mm:ss year format.\n");
  scanf("%d %d %d:%d:%d %d",&rtc_ptr->tm_mon, rtc_ptr->tm_mday, &rtc_ptr->tm_hour, &rtc_ptr->tm_min, &rtc_ptr->tm_sec, &rtc_ptr->tm_year);

  char command_buf[9];
  command_buf[0]        = (char)address |  RTC_WRITE << 7;
  command_buf[1]        = (char)rtc_ptr->tm_sec  ;
  command_buf[2]        = (char)rtc_ptr->tm_min  ;
  command_buf[3]        = (char)rtc_ptr->tm_hour ;
  command_buf[5]        = (char)rtc_ptr->tm_mday ;
  command_buf[6]        = (char)rtc_ptr->tm_mon + 1 ;
  command_buf[7]        = (char)rtc_ptr->tm_year % 100;

  wiringPiSPIDataRW (SPI_CHAN, command_buf,sizeof(command_buf));  
  printf("\nWrite time\n");
}

/*******************************************************
rtc_sync gets time from time library calls and writes it to the clock time. pass reference to tm trc_ptr
Get time from time library pass it to our rtc_ptr by reference to be accessed globally
*******************************************************/
void rtc_sync(uint8_t address, struct tm *rtc_ptr, int ptr_size)
{
  time_t time_raw_format;
  struct tm * ptr_time;
  time ( &time_raw_format );
  ptr_time = localtime ( &time_raw_format );
  *rtc_ptr = *ptr_time;

  char command_buf[9];
  uint8_t mask = 0x8f;   // 10001111b
  uint8_t value =  binary_conversion(rtc_ptr->tm_sec);  // 01010101b
  uint8_t tm_sec_masked_result = mask & value;
  
  command_buf[0]        = (char)address |  RTC_WRITE << 7;
  command_buf[1]        = (char)rtc_ptr->tm_sec  ;
  command_buf[2]        = (char)rtc_ptr->tm_min  ;
  command_buf[3]        = (char)rtc_ptr->tm_hour ;
  command_buf[5]        = (char)rtc_ptr->tm_mday ;
  command_buf[6]        = (char)rtc_ptr->tm_mon + 1 ;
  command_buf[7]        = (char)rtc_ptr->tm_year % 100;
  ptr_size = sizeof(command_buf);
  printf("rtc_sync\n");
  printf ("time():  %s", asctime(rtc_ptr));
  printf("command_buf[]  %d %d %d:%d:%d %d\n\n",command_buf[6], command_buf[5], command_buf[3], command_buf[2], command_buf[1],command_buf[7]);
 
  wiringPiSPIDataRW (SPI_CHAN, command_buf,ptr_size);  
 }

 void rtc_ntp_time()
 {
  system("ntpdate");

 }

// void alarm()
// {
//   // binary coded decimal (BCD) format
// }

// void interrupt()
// {

// }

// void watchdot_timer()
// {
//   // binary format
// }

// void counter()
// {

// }

// void squarewave()
// {
//   // binary format
// }

/*******************************************************
analog_calib adjust internal (on-chip Cx1, Cx0) load
capacitors for oscillator capacitance trimming. Nominally 25 pF each,
*******************************************************/
// void analog_calib()
// {

// }

/*******************************************************
digital_calib calibrates the clock accuracy by adjusting the capacitance load
The total possible compensation is typically –93 ppm to +156 ppm
A digital calibration register (08h) can also be used to adjust the clock counter by
adding or subtracting a pulse at the 512 Hz divider stage.
*******************************************************/
// void digital_calib()
// {

// }

