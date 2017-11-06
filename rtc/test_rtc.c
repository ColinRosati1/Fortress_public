/*******************************************************
test_rtc.c does read and wrties to Real Time Clock over SPI
data sheet: http://www.mouser.com/ds/2/389/m41t93-955030.pdf
compile with:  gcc -o test_rtc test_rtc.c rtc.c -lwiringPi
*******************************************************/
#include <stdio.h>      /* printf */
#include <string.h>     /* strcat */
#include <stdint.h>
#include <inttypes.h>
#include <unistd.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <time.h>
#include "rtc.h"

int main()
{
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  uint8_t address = 22;  
  uint8_t data[32]  ;
  uint8_t bytes = 0x80;
  rtc_init();
  //clock_set();
  //write_rtc(address, data);
  set_time_rtc(address, bytes);
  read_rtc(address, data);

  return 0;
}

/****************************** bit masking time **********************/
// static uint8_t  second  =  0Xb1;
// static uint8_t minute  = 0X01;
// static uint8_t hour  = 0Xd3;
// static uint8_t day   = 0Xa5;
// static uint8_t month   = 0Xb6;
// static uint8_t year  = 0Xc7;


// const char *byte_to_binary(int x)
// {
//     static char b[9];
//     b[0] = '\0';
//     int z;
//     for (z = 128; z > 0; z >>= 1){ strcat(b, ((x & z) == z) ? "1" : "0");}
//     return b;
// }

// const int mask(char byte)
// {
//  uint8_t mask = 0x0f;   // 00001111b
//    uint8_t value = byte;  // 01010101b
//    uint8_t result = mask & value;
//    return result;
//}




  /****************************** testing time **********************/
	//int  second  =	55;
    // uint8_t  second  =	0Xb3;
    // 	uint8_t	minute	=	0X00;
    // uint8_t	hour 	=	0Xd3;
    // uint8_t	day 	=	0Xa5;
    // uint8_t	month 	=	0Xb6;
    // uint8_t	year 	=	0Xc7;
    // uint8_t value;

  // uint8_t mask = 0x0f;   // 00001111b
  //  	uint8_t value = 0xa6;  // 01010101b
  //   	uint8_t result = mask & value;
  //   	printf("%s\n", result);

  //    /* byte to binary string */
  //    printf("Double mask : %02d, Value: %02d, Result %02d\n", mask, value, result);
  //    printf("%s\n", byte_to_binary(result));
    // printf("%s\n", byte_to_binary(value));

  //printf("TIME\n Year %s : Month %s : Day %s :\n Hour %s : Min %s : Sec %s\n",byte_to_binary(0Xc4),byte_to_binary(month),byte_to_binary(0Xd3),byte_to_binary(02),byte_to_binary(18),byte_to_binary(55));
     	// printf("TIME\n Year %s",byte_to_binary(year));
     	// printf(" Month %s ",byte_to_binary(month));
     	// printf(" Day %s ",byte_to_binary(day));
     	// printf(" hour %s ",byte_to_binary(hour));
     	// printf(" minute %s ",byte_to_binary(minute));
     	// printf(" second %s \n",byte_to_binary(second));

     	// printf("Mask and Shift bits\n");
 	// uint8_t mask = 0x0f;   // 00001111b
  // 	value = *byte_to_binary(year);  // 01010101b
 	// uint8_t result = mask & value;

  // 	printf("year %04d\n",result);

 	//printf("year %s\n", mask(year));


//     return 0;
// }
=======
  uint8_t address = 4;  
=======
  uint8_t address = 5;  
>>>>>>> ee40c4cc72950afb56362280205623ae8c3b17c8
  uint8_t data[32]  ;
  uint8_t bytes = 0x80;
  rtc_init();
   struct rtc_time 
  {
    uint8_t tm_sec ;
    uint8_t tm_min ;
    uint8_t tm_hour;
    uint8_t tm_mday ;
    uint8_t tm_wday ;
    uint8_t tm_mon  ;
    uint8_t tm_year ;
    struct rtc_time *tm;
  } ;
  struct rtc_time *tmptr;
  struct rtc_time tm;
  tm.tm_sec  = 28;
  tm.tm_min  = 9;
  tm.tm_hour = 12;
  tm.tm_mday = 28;
  tm.tm_wday = 3;
  tm.tm_mon  = 8;
  tm.tm_year = 17;
  tmptr = &tm;
=======
  char command_buf[2][32];
  uint8_t address = 10; 
>>>>>>> b46232db27205c9f77f95bff09c203ef1f683b29

  rtc_init();

  rtc_read_time(address, &rtc_ptr, sizeof(rtc_ptr));
  rtc_sync(address, &rtc_ptr, sizeof(rtc_ptr));
  rtc_read_time(address, &rtc_ptr, sizeof(rtc_ptr));
   printf("\nprinting command_buf time ()      \nTIME %d %d %d:%d:%d %d\n",command_buf[1][6],command_buf[1][5], command_buf[1][3], command_buf[1][2], command_buf[1][1], command_buf[1][7]);
 
  // rtc_write_time(address, command_buf, sizeof(command_buf), &rtc_ptr);
  // rtc_read_time(address, command_buf, sizeof(command_buf), &rtc_ptr);
  // return 0;
=======
  rtc_init( &rtc_ptr);
  rtc_read_time( &rtc_ptr, sizeof(rtc_ptr));
  rtc_sync( &rtc_ptr, sizeof(rtc_ptr));
  // rtc_read_time( &rtc_ptr, sizeof(rtc_ptr));
  // rtc_write_time( &rtc_ptr, sizeof(rtc_ptr));
  // rtc_read_time( &rtc_ptr, sizeof(rtc_ptr));
  
  return 0;
>>>>>>> 8c853fbfacb2adc8ae61baf71b109b0e4aa78fcf
}

>>>>>>> c2aa233229e370e1212bfca75d73534fd018758d
