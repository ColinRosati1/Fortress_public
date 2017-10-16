/***************************************************************************
//TPM Trusted Platform Module communication over SPI (mode 0?)
// data sheet: https://www.infineon.com/dgdl/Infineon-SLB_9670_1.2-DS-v11_15-EN.pdf?fileId=5546d462525dbac401532d32465e7ec7
OPTIGA™ TPM (Trusted Platform Module) offers a broad portfolio of standardized security controllers to protect the integrity and authenticity of embedded devices and systems. 
With a secured key store and support for a variety of encryption algorithms, OPTIGA™ TPM security chips provide robust protection for critical data and processes through their rich functionality.
//WiringPi library does not work with second SPI channel. Using PIGPIO 

Functions : 
  tpm_init()
  tpm_read()
  tpm_write()

Dependencies *
make sure you have spi1 enable with correct chipselect: dtoverlay=spi1-3cs
check you have /dev/spidev1.2 with $ ls /dev/spidev*
/****************************  Libraries  *************************************************/
#include <stdio.h>
#include <stdlib.h>  
#include <stdint.h>
#include <errno.h>
#include <string.h>
#include <wiringPi.h> //importing wiringPi library for pin mapping I/O control
#include <inttypes.h>
#include <linux/kernel.h>
#include "tpm.h"

/**************************** GLOBALS *************************************************/
#define TPM_CS          27    //wiringPi pin
#define TPM_READ        0
#define TPM_WRITE       1
#define SPI_CLK_SPEED   5000000 //10mhz is max, 1mhz is min
#define SPI_CHAN        1      // spi channel 0.0 or 0.1
#define SPI_MODE        0      // supports SPI mode 0 [CPOL = 0, CPHA = 0]

/*******************************************************
rtc_setup initializes pins for reading and writing
opens and tests SPI channel
********************************************************/
int tpm_init()
{
  int fd;
  wiringPiSetup(); //wiringPi setups up pin mapping and Rpi's SPI devices
  if ((fd = wiringPiSPISetupMode (SPI_CHAN, SPI_CLK_SPEED, SPI_MODE)) < 0)  //tests to see if SPI bus file device is seen
  {
    fprintf (stderr, "Can't open the SPI bus: %s\n", strerror (errno)) ;
    exit (EXIT_FAILURE) ;
  }

  pinMode (TPM_CS, OUTPUT);
  digitalWrite (TPM_CS, HIGH) ;
  return 1;
}

/*******************************************************
tpm_read
reads the clock time. pass the address and the tm reference
*******************************************************/
void tpm_read()
{
  char command_buf[9];//??
  command_buf[0]        = (char)  1  | TPM_READ << 7; //adress && RW
  wiringPiSPIDataRW (SPI_CHAN, command_buf,sizeof(command_buf));  
  printf("tpm_read\n");

  // delay(1000);
  }


/*******************************************************
tpm_write writes the to the tpm
********************************************************/
void tpm_write()
{ 
  char command_buf[9];
  command_buf[0]        = (char) 1  | TPM_WRITE << 7;  //adress && RW

  printf("\nttpm_write\n"); 
  char data ;
  command_buf[1] = data["new string"];
  wiringPiSPIDataRW (SPI_CHAN, command_buf,sizeof(command_buf)); 

  delay(500);
  // digitalWrite (TPM_CS, LOW) ;
 
}

