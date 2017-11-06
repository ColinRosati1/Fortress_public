//rtc.h real time clock this has the read write library

#ifndef _RTC_H_
#define _RTC_H_

struct tm rtc_ptr;

<<<<<<< HEAD
void rtc_init();
<<<<<<< HEAD
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
=======
void rtc_read_time(uint8_t address, struct tm *rtc_ptr, int ptr_size);
void rtc_sync(uint8_t address, struct tm *rtc_ptr, int ptr_size);
void rtc_write_time(uint8_t address, struct tm *rtc_ptr, int ptr_size);

>>>>>>> b46232db27205c9f77f95bff09c203ef1f683b29
=======
void rtc_init		(struct tm *rtc_ptr);
void rtc_read_time	( struct tm *rtc_ptr, int ptr_size);
void rtc_sync		( struct tm *rtc_ptr, int ptr_size);
void rtc_write_time	( struct tm *rtc_ptr, int ptr_size);
>>>>>>> 8c853fbfacb2adc8ae61baf71b109b0e4aa78fcf

#endif 