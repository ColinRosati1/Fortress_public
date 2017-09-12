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
  char command_buf[2][32];
  uint8_t address = 10; 

  rtc_init();

  rtc_read_time(address, &rtc_ptr, sizeof(rtc_ptr));
  rtc_sync(address, &rtc_ptr, sizeof(rtc_ptr));
  rtc_read_time(address, &rtc_ptr, sizeof(rtc_ptr));
   printf("\nprinting command_buf time ()      \nTIME %d %d %d:%d:%d %d\n",command_buf[1][6],command_buf[1][5], command_buf[1][3], command_buf[1][2], command_buf[1][1], command_buf[1][7]);
 
  // rtc_write_time(address, command_buf, sizeof(command_buf), &rtc_ptr);
  // rtc_read_time(address, command_buf, sizeof(command_buf), &rtc_ptr);
  // return 0;
}

