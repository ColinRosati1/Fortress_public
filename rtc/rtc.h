//rtc.h real time clock this has the read write library

#ifndef _RTC_H_
#define _RTC_H_

void rtc_init();
int read_time();
void clock_set();
void read_rtc(int address, char *data);
void write_rtc(int address, char *data);
//void write_rtc(int address, char *data, int size);

#endif