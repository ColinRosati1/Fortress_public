/*
 * blink.c:
 *	Standard "blink" program in wiringPi. Blinks an LED connected
 *	to the first GPIO pin.
 *
 * Copyright (c) 2012-2013 Gordon Henderson. <projects@drogon.net>
 ***********************************************************************
 * This file is part of wiringPi:
 *	https://projects.drogon.net/raspberry-pi/wiringpi/
 *
 *    wiringPi is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU Lesser General Public License as published by
 *    the Free Software Foundation, either version 3 of the License, or
 *    (at your option) any later version.
 *
 *    wiringPi is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Lesser General Public License for more details.
 *
 *    You should have received a copy of the GNU Lesser General Public License
 *    along with wiringPi.  If not, see <http://www.gnu.org/licenses/>.
 ***********************************************************************
 */
// remote_pi_dir = /home/pi/Documents/C

#include <stdio.h>
#include <wiringPi.h>

#define CS  10
#define HOLD  5
#define WP  4
#define MISO  12
#define MOSI  13
#define CLK  14

int main (void)
{
  char c;
  int fd;
  fd = open(GPIO_REGISTER, O_WRONLY);
  printf ("Raspberry Pi blink\n") ;

  wiringPiSetup () ;
  pinMode (HOLD, OUTPUT) ;
  for (;;)
  {
    
    if(-1 == fd)
      \printf("cant register GPIO pin\n");
    digitalWrite (HOLD, HIGH) ;	// On
    c = getc(stdin);
    printf("%d",digitalRead(HOLD));
    //   printf("this is on %d\n",c);
    // else printf("this is now low\n");

    digitalWrite (HOLD, LOW) ;	// Off
    //c = getc(stdin);
    printf("%d",digitalRead(HOLD));
    printf("%d\n",c);
  }
  return 0;
}