/***************************************************************************
//real time clock this has the read write functions
// data sheet: http://www.mouser.com/ds/2/389/m41t93-955030.pdf
// supports SPI mode 0
Functions : 
  time-of-day clock/calendar
  write time

<<<<<<< HEAD
	https://github.com/google/kmsan/blob/master/drivers/rtc/rtc-m41t93.c this is a good resource same rtc chip
=======
  https://github.com/google/kmsan/blob/master/drivers/rtc/rtc-m41t93.c this is a good resource same rtc chip
>>>>>>> c2aa233229e370e1212bfca75d73534fd018758d

/etc/default/hwclock make sure rtc is enabled

// connect a ntp server???
****************************  Libraries  *************************************************/
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <errno.h>
#include <string.h>
#include <wiringPi.h> //importing wiringPi library for pin mapping I/O control
#include <inttypes.h>
#include <linux/kernel.h>
<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> c2aa233229e370e1212bfca75d73534fd018758d
=======
#include <time.h> // for time sync 
>>>>>>> b46232db27205c9f77f95bff09c203ef1f683b29
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
<<<<<<< HEAD
<<<<<<< HEAD
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
  	memcpy(data, &command_buf[2], CLK_SIZE);
	printf("Address(%x) %x  %x  %x  %x  %x  %x  %x \n", command_buf[0],command_buf[1],command_buf[2],command_buf[3], command_buf[4], command_buf[5], command_buf[6], command_buf[7],command_buf[8]);
=======
  //register 1 - 8 reads: 00h(1)-mircosec, 01h(2)-mircosec, 02h(3)-min, 03h(4)-hour, 04h(5)-day/week, 05h(6)-day/month, 06h(7)-month, 07(8)-year  
    char command_buf[CLK_SIZE];
    memset(command_buf, 0, sizeof(command_buf));
    command_buf[0] = address |  RTC_READ << 7; // read bit is 0 then addr for remain 7 bits
    int i;
    for(i = 0 ; i < 5000; i ++)
=======
    if (num == 0)
>>>>>>> b46232db27205c9f77f95bff09c203ef1f683b29
    {
      return 0;
    }
    else
    {
      return (num % 2) + 10 * binary_conversion(num / 2);
    }
<<<<<<< HEAD
  printf("Address(%x) %x  %x  %x  %x  %x  %x  %x \n", command_buf[0],command_buf[1],command_buf[2],command_buf[3], command_buf[4], command_buf[5], command_buf[6], command_buf[7],command_buf[8]);
  return 0;
    memcpy(data, &command_buf[2], CLK_SIZE);
  printf("Address(%x) %x  %x  %x  %x  %x  %x  %x \n", command_buf[0],command_buf[1],command_buf[2],command_buf[3], command_buf[4], command_buf[5], command_buf[6], command_buf[7],command_buf[8]);
>>>>>>> c2aa233229e370e1212bfca75d73534fd018758d
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

<<<<<<< HEAD
  	//write command to set the time manually YYYY/MM/DD | HH : MM : SS
  	printf("ENTER DATE YYYY/MM/DD | HH : MM : SS\n");
=======
//     //write command to set the time manually YYYY/MM/DD | HH : MM : SS
//     printf("ENTER DATE YYYY/MM/DD | HH : MM : SS\n");

//     wiringPiSPIDataRW (SPI_CHAN, command_buf,sizeof(command_buf));
//     memcpy(data, &command_buf[2], CLK_SIZE);
//     return 0;
// }
>>>>>>> c2aa233229e370e1212bfca75d73534fd018758d

int binary_conversion(int num)
=======
}

int binary_conversion_char(char num)
>>>>>>> b46232db27205c9f77f95bff09c203ef1f683b29
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
// void rtc_read_time(uint8_t address, char command_buf[1][32], int buf_size, struct tm *rtc_ptr)
{
  char command_buf[1][31];
  memset(command_buf, 0, sizeof(command_buf)); // wipe all buf to 0, so nothing is written
  command_buf[0][0] = address |  RTC_READ << 7;
  memcpy(command_buf, rtc_ptr, sizeof(rtc_ptr)); 

  wiringPiSPIDataRW (SPI_CHAN, command_buf,sizeof(command_buf));
   memcpy(rtc_ptr, command_buf, sizeof(rtc_ptr));  
  // printf ("Current local time and date: %s", asctime(rtc_ptr));
   
  printf("\nprinting command_buf time from rtc_read_time\nTIME %d %d %d:%d:%d %d\n",command_buf[1][6],command_buf[1][5], command_buf[1][3], command_buf[1][2], command_buf[1][1], command_buf[1][7]);

  printf("sec = %d\n",rtc_ptr->tm_sec)  ;
  printf("min = %d\n",rtc_ptr->tm_min)  ;
  printf("hour = %d\n",rtc_ptr->tm_hour)  ;
  printf("day = %d\n",rtc_ptr->tm_mday)  ;
  printf("month = %d\n",rtc_ptr->tm_mon + 1)  ;
  printf("year = %d\n",rtc_ptr->tm_year)  ;
}


/*******************************************************
rtc_write_time writes the clock time. pass the address and the tm reference
*******************************************************/
<<<<<<< HEAD
<<<<<<< HEAD
void set_time_rtc(uint8_t address, uint8_t data)
{ 

  struct rtc_time *tm;

=======
void set_time_rtc(uint8_t address, struct rtc_time *tm)
{ 
<<<<<<< HEAD
  // struct rtc_time *settime;
>>>>>>> c2aa233229e370e1212bfca75d73534fd018758d
  uint8_t command_buf[32];
=======
  struct rtc_time settime;
  uint8_t command_buf[9];
>>>>>>> ee40c4cc72950afb56362280205623ae8c3b17c8
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

<<<<<<< HEAD
  tm->tm_sec  = BCD2BIN(buf[M41T93_REG_ST_SEC]);
  tm->tm_min  = BCD2BIN(buf[M41T93_REG_MIN]);
  tm->tm_hour = BCD2BIN(buf[M41T93_REG_CENT_HOUR] & 0x3f);
  tm->tm_mday = BCD2BIN(buf[M41T93_REG_DAY]);
  tm->tm_mon  = BCD2BIN(buf[M41T93_REG_MON]) - 1;
  tm->tm_wday = BCD2BIN(buf[M41T93_REG_WDAY] & 0x0f) - 1;

  century_after_1900 = (buf[M41T93_REG_CENT_HOUR] >> 6) + 1;
  tm->tm_year = BCD2BIN(buf[M41T93_REG_YEAR]) + century_after_1900 * 100;

  // return ret < 0 ? ret : rtc_valid_tm(tm);
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

=======
>>>>>>> c2aa233229e370e1212bfca75d73534fd018758d
=======
void rtc_write_time(uint8_t address, struct tm *rtc_ptr, int ptr_size)
// void rtc_write_time(uint8_t address, char command_buf[2][32], int buf_size, struct tm *rtc_ptr)
{ 
  char command_buf[1][31];
  printf("\nprinting command_buf time ()      \nTIME %d %d %d:%d:%d %d\n",rtc_ptr->tm_mon,rtc_ptr->tm_mday, rtc_ptr->tm_hour, rtc_ptr->tm_min, rtc_ptr->tm_sec, rtc_ptr->tm_year);
  struct tm *ptr_time;
  ptr_time = (struct tm *) malloc (sizeof(struct tm));
  printf("Enter a time expressed as hh:mm:ss format.\n");
  // char input_time;
  // input_time = scanf("%02d:%02d:%02d", &ptr_time->tm_hour, &ptr_time->tm_min, &ptr_time->tm_sec);
  scanf("%d:%d:%d", &ptr_time->tm_hour, &ptr_time->tm_min, &ptr_time->tm_sec);
  // scanf("%d:%d:%d", &rtc_ptr->tm_hour, &rtc_ptr->tm_min, &rtc_ptr->tm_sec);

  // *rtc_ptr = *ptr_time;

  command_buf[0][0] = address |  RTC_WRITE << 7;
  uint8_t * data; /* data byte */
  // data = &command_buf[1][0]; /* ptr to first data byte */
  // data[M41T93_REG_SSEC]       = 0;
  // data[M41T93_REG_ST_SEC]     = BIN2BCD(rtc_ptr->tm_sec);
  // data[M41T93_REG_MIN]        = BIN2BCD(rtc_ptr->tm_min);
  // data[M41T93_REG_CENT_HOUR]  = BIN2BCD(rtc_ptr->tm_hour) | ((rtc_ptr->tm_year/100-1) << 6);
  // data[M41T93_REG_DAY]        = BIN2BCD(rtc_ptr->tm_mday);
  // data[M41T93_REG_WDAY]       = BIN2BCD(rtc_ptr->tm_mday + 1);
  // data[M41T93_REG_MON]        = BIN2BCD(rtc_ptr->tm_mon + 1);
  // data[M41T93_REG_YEAR]       = BIN2BCD(rtc_ptr->tm_year % 100);
  command_buf[1][1]        = ptr_time->tm_sec  ;
  command_buf[1][2]        = ptr_time->tm_min  ;
  command_buf[1][3]        = ptr_time->tm_hour ;
  command_buf[1][5]        = ptr_time->tm_mday ;
  command_buf[1][6]        = ptr_time->tm_mon + 1 ;
  command_buf[1][7]        = ptr_time->tm_year % 100;

  // printf("\nprinting command_buf[array]            : buf[0]%d, buf[1]%d\nbuf[1][1] sec  : %d\nbuf[1][2] min  : %d\nbuf[1][3] hour : %d\nbuf[1][5] day  : %d\nbuf[1][6] mon  : %d\nbuf[1][7] year : %d\n", command_buf[0],command_buf[1], command_buf[1][1], command_buf[1][2], command_buf[1][3], command_buf[1][5], command_buf[1][6], command_buf[1][7]);
  // printf("\nprinting command_buf binary: \nW/R & Address buf[0]%d\nbuf[1][1] sec  : %d\nbuf[1][2] min  : %d\nbuf[1][3] hour : %d\nbuf[1][5] day  : %d\nbuf[1][6] mon  : %d\nbuf[1][7] year : %d\n", binary_conversion_char(*command_buf[0]), binary_conversion_char(command_buf[1][1]), binary_conversion_char(command_buf[1][2]), binary_conversion_char(command_buf[1][3]), binary_conversion_char(command_buf[1][5]), binary_conversion_char(command_buf[1][6]), binary_conversion_char(command_buf[1][7]));

  wiringPiSPIDataRW (SPI_CHAN, command_buf,sizeof(command_buf));  
  printf("\nWrite time\n");
>>>>>>> b46232db27205c9f77f95bff09c203ef1f683b29
}

/*******************************************************
rtc_sync gets time from time library calls and writes it to the clock time. pass reference to tm trc_ptr
*******************************************************/
void rtc_sync(uint8_t address, struct tm *rtc_ptr, int ptr_size)
// void rtc_sync(uint8_t address, char command_buf[2][32], int buf_size, struct tm *rtc_ptr)
{
  // get time from time library pass it to our rtc_ptr by reference to be accessed globally
  time_t time_raw_format;
  struct tm * ptr_time;
  time ( &time_raw_format );
  ptr_time = localtime ( &time_raw_format );
  *rtc_ptr = *ptr_time;
  printf ("Current local time and date: %s", asctime(rtc_ptr));
  
  char command_buf[1][31];
  command_buf[0][0] = address |  RTC_WRITE << 7;
  uint8_t * data; /* data byte */
  data = &command_buf[1][0]; /* ptr to first data byte */

  // data[M41T93_REG_SSEC]       = 0;
  // data[M41T93_REG_ST_SEC]     = BIN2BCD(rtc_ptr->tm_sec);
  // data[M41T93_REG_MIN]        = BIN2BCD(rtc_ptr->tm_min);
  // data[M41T93_REG_CENT_HOUR]  = BIN2BCD(rtc_ptr->tm_hour) | ((rtc_ptr->tm_year/100-1) << 6);
  // data[M41T93_REG_DAY]        = BIN2BCD(rtc_ptr->tm_mday);
  // data[M41T93_REG_WDAY]       = BIN2BCD(rtc_ptr->tm_mday + 1);
  // data[M41T93_REG_MON]        = BIN2BCD(rtc_ptr->tm_mon + 1);
  // data[M41T93_REG_YEAR]       = BIN2BCD(rtc_ptr->tm_year % 100);
// printf("\nprinting command_buf time        : buf[0]%d, buf[1]%d\nTIME %d %d %d:%d:%d %d\n", command_buf[0],command_buf[1],command_buf[1][6],command_buf[1][5], command_buf[1][3], command_buf[1][2], command_buf[1][1], command_buf[1][7]);
  
  // data[M41T93_REG_SSEC]       = ptr_time->tm_sec       ;
  // data[M41T93_REG_ST_SEC]     = ptr_time->tm_sec       ;
  // data[M41T93_REG_MIN]        = ptr_time->tm_min       ;
  // data[M41T93_REG_CENT_HOUR]  = ptr_time->tm_hour      ;
  // data[M41T93_REG_DAY]        = ptr_time->tm_mday      ;
  // data[M41T93_REG_WDAY]       = ptr_time->tm_mday      ;
  // data[M41T93_REG_MON]        = ptr_time->tm_mon  + 1  ;
  // data[M41T93_REG_YEAR]       = ptr_time->tm_year % 100;

  uint8_t mask = 0x8f;   // 10001111b
  uint8_t value =  binary_conversion(rtc_ptr->tm_sec);  // 01010101b
  uint8_t tm_sec_masked_result = mask & value;
  printf("%d\n", rtc_ptr->tm_min);
   printf("\nprinting binary masked result: %d\n", binary_conversion_char(tm_sec_masked_result));

  command_buf[1][1]        = tm_sec_masked_result  ;
  command_buf[1][2]        = rtc_ptr->tm_min  ;
  command_buf[1][3]        = rtc_ptr->tm_hour ;
  command_buf[1][5]        = rtc_ptr->tm_mday ;
  command_buf[1][6]        = rtc_ptr->tm_mon + 1 ;
  command_buf[1][7]        = rtc_ptr->tm_year % 100;
  command_buf[1][13]       = 0;
  

  // memcpy(&command_buf[1][32], rtc_ptr, ptr_size);
  
  // printf("\nprinting command_buf sync()            : buf[0]%d, buf[1]%d\nbuf[1][1] sec  : %d\nbuf[1][2] min  : %d\nbuf[1][3] hour : %d\nbuf[1][5] day  : %d\nbuf[1][6] mon  : %d\nbuf[1][7] year : %d\n", command_buf[0],command_buf[1], command_buf[1][1], command_buf[1][2], command_buf[1][3], command_buf[1][5], command_buf[1][6], command_buf[1][7]);
  printf("\nprinting command_buf time ()      \nTIME %d %d %d:%d:%d %d\n",command_buf[1][6],command_buf[1][5], command_buf[1][3], command_buf[1][2], command_buf[1][1], command_buf[1][7]);
  wiringPiSPIDataRW (SPI_CHAN, command_buf,ptr_size);  
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

