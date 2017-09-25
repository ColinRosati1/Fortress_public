//rtc.h real time clock this has the read write library

#ifndef _RTC_H_
#define _RTC_H_

struct tm rtc_ptr;

void rtc_init();
void rtc_read_time(uint8_t address, struct tm *rtc_ptr, int ptr_size);
void rtc_sync(uint8_t address, struct tm *rtc_ptr, int ptr_size);
void rtc_write_time(uint8_t address, struct tm *rtc_ptr, int ptr_size);

#endif