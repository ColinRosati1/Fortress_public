

#include <stdio.h>      /* printf */
#include <string.h>     /* strcat */
#include <stdint.h>
//#include "rtc.h"

const char *byte_to_binary(int x)
{
    static char b[9];
    b[0] = '\0';
    int z;
    for (z = 128; z > 0; z >>= 1){ strcat(b, ((x & z) == z) ? "1" : "0");}
    return b;
}

int main(void)
{
	uint8_t mask = 0x0f;   // 00001111b
  	uint8_t value = 0xa3;  // 01010101b
  	uint8_t result = mask & value;

    /* byte to binary string */
    printf("Double mask : %02d, Value: %02d, Result %02d\n", mask, value, result);
    printf("%s\n", byte_to_binary(result));
    printf("%s\n", byte_to_binary(value));
 
    return 0;
}