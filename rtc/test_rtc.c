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
  uint8_t address = 4;  
  uint8_t data[32]  ;
  uint8_t bytes = 0x80;
  rtc_init();
  struct rtc_time tm;
  // {
  //   uint8_t tm_sec  = 28;
  //   uint8_t tm_min  = 9;
  //   uint8_t tm_hour = 12;
  //   uint8_t tm_mday = 28;
  //   uint8_t tm_wday = 3;
  //   uint8_t tm_mon  = 8;
  //   uint8_t tm_year = 17;
  // } tm;


  // write_rtc(address, data);
  
  //set_time_rtc(address, &tm);
  get_time_rtc(address, &tm);
  //read_rtc(address, data);
  
  return 0;
}

