//simple read write test
//change speed, buffer

#include <stdio.h>
#include <string.h>

#include "FRAM-RW.h"

int main (void)
{
  int fd, speed = 80000;
  fram_init(); // wiringPi pin mapping, spi devices, fram pin setup  // nest a static funtion inside this funciton to to hide the speed, channel. make sure speed can only go to maximum and override speed
  int address = 50; 
  char data[] = "new string";
  fram_write(address, data, sizeof(data));
  memset(data, 0, sizeof(data));
  fram_read(address, data, sizeof(data));
  puts(data);
  return 0 ;
}

