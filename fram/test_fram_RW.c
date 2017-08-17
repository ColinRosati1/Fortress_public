
/***********************************************************************
  SPI transaction to FRAM  --(datasheet)--: http://www.mouser.com/ds/2/100/001-84485_FM25L16B_16_KBIT_2K_X_8_SERIAL_SPI_F-RAM-476934.pdf 
  simple read write test
 * use -lwiring in compile
 ************************************************************************/
#include <stdio.h>
#include <string.h>

#include "FRAM_RW.h"

int main (void)
{
  fram_init(); // wiringPi pin mapping, spi devices, fram pin setup 
  int address = 50; 
  char data[] = "new string";
  fram_write(address, data, sizeof(data));
  memset(data, 0, sizeof(data));
  fram_read(address, data, sizeof(data));
  puts(data);
  return 0 ;
}

