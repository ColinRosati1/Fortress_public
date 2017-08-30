//rtc.h real time clock this has the read write library

#ifndef _RTC_H_
#define _RTC_H_

typedef struct rtc_time
{
	uint8_t tm_sec;
	uint8_t tm_min;
	uint8_t tm_hour;
	uint8_t tm_mday;
	uint8_t tm_wday;
	uint8_t tm_mon;
	uint8_t tm_year;
}tm;
 
void rtc_init();
int read_time();
void clock_set();
int read_rtc(int address, uint8_t *data);
int write_rtc(int address, uint8_t *data);
<<<<<<< HEAD
void set_time_rtc(uint8_t address, uint8_t bytes);
=======
void get_time_rtc(uint8_t address, struct rtc_time *tm);
void set_time_rtc(uint8_t address, struct rtc_time *tm);
>>>>>>> c2aa233229e370e1212bfca75d73534fd018758d
//void write_rtc(int address, char *data, int size);

#endif 