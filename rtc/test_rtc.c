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
  rtc_init( &rtc_ptr);
  rtc_read_time( &rtc_ptr, sizeof(rtc_ptr));
  rtc_sync( &rtc_ptr, sizeof(rtc_ptr));
  rtc_read_time( &rtc_ptr, sizeof(rtc_ptr));
  rtc_write_time( &rtc_ptr, sizeof(rtc_ptr));
  rtc_read_time( &rtc_ptr, sizeof(rtc_ptr));
  
  return 0;
}

