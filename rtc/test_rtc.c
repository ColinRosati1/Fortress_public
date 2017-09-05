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
    
  uint8_t address = 5;  

  rtc_init();
  rtc_write_time(address, &tm);
  rtc_read_time(address, &tm);
  return 0;
}

