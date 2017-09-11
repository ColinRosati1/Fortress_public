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

int main(int argc, char **argv)
{
  uint8_t address = 1; 

  rtc_init();
  rtc_sync(address, &rtc_ptr);
  rtc_read_time(address, &rtc_ptr, sizeof(rtc_ptr));
  // rtc_write_time(address, &rtc_ptr);
  // rtc_read_time(address, &rtc_ptr);
  return 0;
}

