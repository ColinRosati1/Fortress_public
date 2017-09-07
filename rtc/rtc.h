//rtc.h real time clock this has the read write library

#ifndef _RTC_H_
#define _RTC_H_

struct rtc_time
{
	uint8_t tm_sec;
	uint8_t tm_min;
	uint8_t tm_hour;
	uint8_t tm_mday;
	uint8_t tm_wday;
	uint8_t tm_mon;
	uint8_t tm_year;		
};

struct rtc_time tm;

void rtc_init();

void rtc_read_time(uint8_t address, struct rtc_time *tm);
void rtc_write_time(uint8_t address, struct rtc_time *tm);



//========================================================= UNUSED ===============================
//void write_rtc(int address, char *data, int size);
// int read_rtc(int address, uint8_t *data);
// int write_rtc(int address, uint8_t *data);
#endif