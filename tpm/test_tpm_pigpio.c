/***************************************************************************
//TPM Trusted Platform Module communication over SPI (mode 0?)
// data sheet: https://www.infineon.com/dgdl/Infineon-SLB_9670_1.2-DS-v11_15-EN.pdf?fileId=5546d462525dbac401532d32465e7ec7
OPTIGA™ TPM (Trusted Platform Module) offers a broad portfolio of standardized security controllers to protect the integrity and authenticity of embedded devices and systems. 
With a secured key store and support for a variety of encryption algorithms, OPTIGA™ TPM security chips provide robust protection for critical data and processes through their rich functionality.

Functions : 
  tpm_init()
  tpm_read()
  tpm_write()

Dependencies ***
*compile with -pthread ,  -lpigpio
 gcc -pthread  -o test_tpm test_tpm.c test_tpm_pigpio.c -lpigpio 
*make sure you have spi1 enable with correct chipselect: dtoverlay=spi1-3cs
*check you have /dev/spidev1.2 with $ ls /dev/spidev*

/****************************  Libraries  *************************************************/
#include <stdio.h>
#include <stdlib.h>  
#include <stdint.h>
#include <errno.h>
#include <string.h>
#include <inttypes.h>
#include <linux/kernel.h>
#include <wiringPi.h> //importing wiringPi library for pin mapping I/O control
#include <pigpio.h>
#include "tpm.h"

/**************************** GLOBALS *************************************************/
#define TPM_CS          16    //PIGPIO uses BCM pinout 
#define TPM_MOSI        20
#define TPM_MISO        19
#define TPM_SCLK        21
#define TPM_READ        0
#define TPM_WRITE       1
#define SPI_CLK_SPEED   200000 
#define SPI_CHAN        1      // spi channel 0.0 or 0.1
#define SPI_MODE        3      // supports SPI mode 0 [CPOL = 0, CPHA = 0]

int spi;
int AUX_SPI;
/*******************************************************
rtc_setup initializes pins for reading and writing
opens and tests SPI channel
********************************************************/
int tpm_init()
{
  int h;
  int fd;
  if (gpioInitialise() < 0)
  { 
    fprintf(stderr, "pigpio initialisation failed.\n");
    return -1;
  }

  gpioSetMode(TPM_CS,  PI_OUTPUT);
  gpioWrite(TPM_CS, 1) ;
  // spi = spiOpen(SPI_CHAN, SPI_CLK_SPEED, 8); //auxiliary SPI needs to set bit 8 flag
  printf("gpio SPI1 is now open %d\n", spi);
   // bbSPIOpen(TPM_CS, TPM_MISO, TPM_MOSI, TPM_SCLK, SPI_CLK_SPEED, 0); //opens our spi pins
  AUX_SPI=(1<<8);
  spi = spiOpen(SPI_CHAN, SPI_CLK_SPEED, AUX_SPI);

 
}

/*******************************************************
tpm_read
reads the clock time. pass the address and the tm reference
*******************************************************/
void tpm_read()
{
  char command_buf[9];
  int i;
  for ( i = 0; i < 9; i ++)
  {
    command_buf[i] = 'a';
  }
  int count = sizeof(command_buf);
   printf("tpm_read\n");
    AUX_SPI=(1<<8);
  int spi = spiOpen(SPI_CHAN, SPI_CLK_SPEED, AUX_SPI);
  printf("spi %d\n",spi);
  spiRead(spi, command_buf, count);

  }

/*******************************************************
tpm_write writes the to the tpm
********************************************************/
void tpm_write()
{ 
  
  printf("\ntpm_write\n"); 
  char command_buf[9];
  int i;
  for ( i = 0; i < 9; i ++)
  {
    command_buf[i] = 'a';
  }
  int count = sizeof(command_buf);
  // spi = spiOpen(SPI_CHAN, SPI_CLK_SPEED, AUX_SPI);
  printf("spi %d\n",spi);
  spiWrite(spi, command_buf, count);

}

