

#include <stdio.h>      /* printf */
#include <string.h>     /* strcat */
#include <stdint.h>
//#include "rtc.h"

static uint8_t  second  =	0Xb1;
static uint8_t	minute	=	0X01;
static uint8_t	hour 	=	0Xd3;
static uint8_t	day 	=	0Xa5;
static uint8_t	month 	=	0Xb6;
static uint8_t	year 	=	0Xc7;


const char *byte_to_binary(int x)
{
    static char b[9];
    b[0] = '\0';
    int z;
    for (z = 128; z > 0; z >>= 1){ strcat(b, ((x & z) == z) ? "1" : "0");}
    return b;
}

const int mask(char byte)
{
	uint8_t mask = 0x0f;   // 00001111b
  	uint8_t value = byte;  // 01010101b
 	uint8_t result = mask & value;
 	return result;
}

int main(void)
{
	//int  second  =	55;
	uint8_t  second  =	0Xb3;
 	uint8_t	minute	=	0X00;
	uint8_t	hour 	=	0Xd3;
	uint8_t	day 	=	0Xa5;
	uint8_t	month 	=	0Xb6;
	uint8_t	year 	=	0Xc7;
	uint8_t value;
	
	// uint8_t mask = 0x0f;   // 00001111b
 //  	uint8_t value = 0xa6;  // 01010101b
 //   	uint8_t result = mask & value;
 //   	printf("%s\n", result);

 //    /* byte to binary string */
 //    printf("Double mask : %02d, Value: %02d, Result %02d\n", mask, value, result);
 //    printf("%s\n", byte_to_binary(result));
     printf("%s\n", byte_to_binary(value));

    //printf("TIME\n Year %s : Month %s : Day %s :\n Hour %s : Min %s : Sec %s\n",byte_to_binary(0Xc4),byte_to_binary(month),byte_to_binary(0Xd3),byte_to_binary(02),byte_to_binary(18),byte_to_binary(55));
 	printf("TIME\n Year %s",byte_to_binary(year));
 	printf(" Month %s ",byte_to_binary(month));
 	printf(" Day %s ",byte_to_binary(day));
 	printf(" hour %s ",byte_to_binary(hour));
 	printf(" minute %s ",byte_to_binary(minute));
 	printf(" second %s \n",byte_to_binary(second));

 	printf("Mask and Shift bits\n");
 	// uint8_t mask = 0x0f;   // 00001111b
  // 	value = *byte_to_binary(year);  // 01010101b
 	// uint8_t result = mask & value;

  // 	printf("year %04d\n",result);

 	printf("year %s\n", mask(year));
 
    return 0;
}