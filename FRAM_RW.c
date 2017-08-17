/*
 ***********************************************************************
  SPI transaction to FRAM  --(datasheet)--: http://www.mouser.com/ds/2/100/001-84485_FM25L16B_16_KBIT_2K_X_8_SERIAL_SPI_F-RAM-476934.pdf 
  Uses wiringPi library to handle RPI's SPI devices

  write/Read status register, write/read

 * use -lwiring in compile

TODO check the speed and make it static
 ***********************************************************************

Libraries
*/
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <errno.h>
#include <string.h>

#include <wiringPi.h> //importing wiringPi library for pin mapping I/O control
/*-------------------------------------------------------
SPI globals
*/
#define SPI_CHAN    0           //chip select 0
#define MODE        0 // mode 0- from wiringPiSPI.c master mode 0 is default

/*-------------------------------------------------------*/
//FRAM init & commands

#define FRAM_CS0_PIN         10    // set CS pin 24 = BCM 8 = wiringPi 10
#define FRAM_CS0_OFF        HIGH   // pin state
#define FRAM_CS0_ON         LOW    // pin state
#define FRAM_CS1_PIN        10     //  set CS pin 24 = BCM 8 = wiringPi 10
#define FRAM_CS1_OFF        HIGH   // pin state
#define FRAM_CS1_ON         LOW    // pin state
#define FRAM_WP_PIN         4      // set WP pin 16 = BCM 23 = wirinpi 4
#define FRAM_WP_OFF         HIGH   //set pin state
#define FRAM_WP_ON          LOW    // pin state
#define FRAM_HOLD_PIN       5      // set Hold pin 18 = BCM 24 = wiringpi 5
#define FRAM_HOLD_OFF       HIGH   // pin state
#define FRAM_HOLD_ON        LOW    // pin state

//op codes
#define FRAM_WREN           0x06  // Set write enable latch.
#define FRAM_WRDI           0x04  // Write disable. 
#define FRAM_RDSR           0x05  // Read status register.
#define FRAM_WRSR           0x01  // Write status register.
#define FRAM_READ           0x03  // Read memory data.
#define FRAM_WRITE          0x02  // Write memory data. 

static void fram_Setup() // initialize pin modes, and pin states 
{
  pinMode (FRAM_CS0_PIN, OUTPUT);
  pinMode (FRAM_CS1_PIN, OUTPUT);
  pinMode (FRAM_WP_PIN, OUTPUT);
  pinMode (FRAM_HOLD_PIN, OUTPUT);
  digitalWrite (FRAM_CS0_PIN, FRAM_CS0_OFF) ;
  digitalWrite (FRAM_CS1_PIN, FRAM_CS1_OFF) ;
  digitalWrite (FRAM_WP_PIN, FRAM_WP_OFF) ;
  digitalWrite (FRAM_HOLD_PIN, FRAM_HOLD_OFF) ;
}

static void fram_WREN() //write enable must be set befor every write function
{
  char buf[4];
  buf[0] =  0x06; 
  wiringPiSPIDataRW (SPI_CHAN, buf, 1);
}

static void fram_WRSR() //writes f-ram status register to 0 to remove all hardware protection
{ 
 fram_WREN(); //write enable command
 char buf[2];
 buf[0] = FRAM_WRSR; //opcode
 buf[1] = 0; // write to status register with 0
 wiringPiSPIDataRW (SPI_CHAN, buf, sizeof(buf));
// printf("WRSR buf = %d, %d\n", buf[0], buf[1]);
}

void fram_init()
{
  int fd;
  wiringPiSetup(); //wiringPi setups up pin mapping and Rpi's SPI devices
  fram_Setup();    //initialize pin modes, and pin states 
  if ((fd = wiringPiSPISetupMode (SPI_CHAN, speed, MODE)) < 0)  //tests to see if SPI bus file device is seen
  {
    fprintf (stderr, "Can't open the SPI bus: %s\n", strerror (errno)) ;
    exit (EXIT_FAILURE) ;
  }
  fram_WRSR();
}

static void fram_RDSR() //Reading the status register provides information about the current state of the write-protection features
{
  char buf[2];
  buf[0] = FRAM_RDSR;
  buf[1] = 0 ;
  wiringPiSPIDataRW (SPI_CHAN, buf, 2);
  printf("RDSR buf = %d, %d\n", buf[0], buf[1]);
}

void fram_write(int address, char *data, int size)
{
  char command_buf[size + 3];
  command_buf[0] = FRAM_WRITE; //opcode
  command_buf[1] = address >> 8;  // sends the most significant byte first
  command_buf[2] = address;  // least significant byte first
  memcpy(&command_buf[3], data, size);
  fram_WREN(); //write enable command  
  wiringPiSPIDataRW (SPI_CHAN, command_buf,sizeof(command_buf));// TODO check function for error
}

void fram_read(int address, char *data, int size)
{
  char command_buf[size + 3];
  memset(command_buf, 0, sizeof(command_buf));
  command_buf[0] = FRAM_READ; //opcode
  command_buf[1] = address >> 8;  // sends the most significant byte first
  command_buf[2] = address;  // least significant byte first
  wiringPiSPIDataRW (SPI_CHAN, command_buf,sizeof(command_buf));// TODO check function for error
  memcpy(data, &command_buf[3], size);
}

