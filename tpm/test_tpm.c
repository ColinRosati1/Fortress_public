/*******************************************************
test_tpm.c does read and wrties to Trusted Platform Module over SPI
data sheet: http://www.mouser.com/ds/2/389/m41t93-955030.pdf
compile with:  gcc -o test_tpm test_tpm.c tpm.c -lwiringPi
*******************************************************/
#include <stdio.h>      /* printf */
#include <string.h>     /* strcat */
#include <stdint.h>
#include <inttypes.h>
#include <unistd.h>
#include <sys/stat.h>
#include <sys/types.h>
#include "tpm.h"

int main()
{
	tpm_init	( );
	tpm_write  	( );
	tpm_read	( );
	gpioTerminate(); 

	return 1;
}

