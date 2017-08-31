/*******************************************************
test_rtc.c does read and wrties to Real Time Clock over SPI
data sheet: http://www.mouser.com/ds/2/389/m41t93-955030.pdf
compile with:  gcc -o test_rtc test_rtc.c rtc.c -lwiringPi
*******************************************************/
#include <stdio.h>      /* printf */
#include <string.h>     /* strcat */
#include <stdint.h>
#include "rtc.h"

int main()
{
  uint8_t address = 5;  
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

  // struct rtc_time *tmptr;
  // tmptr = &tm;

  // write_rtc(address, data);
  
  set_time_rtc(address, tmptr);
  //get_time_rtc(address, &tm);
  //read_rtc(address, data);
  
  return 0;
}

