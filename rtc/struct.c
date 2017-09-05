#include <stdio.h>
#include <inttypes.h>
#include <time.h>

struct rtc_time 
{
  uint8_t tm_sec ;
  uint8_t tm_min ;
  uint8_t tm_hour;
  uint8_t tm_mday ;
  uint8_t tm_wday ;
  uint8_t tm_mon  ;
  uint8_t tm_year ;
} ;

struct rtc_time rtc_tm;

int readtime(struct rtc_time *rtc_tm); // passing the struct by reference, modifying value at the right address
int changetime(struct rtc_time *rtc_tm);// passing the struct by reference, modifying value at the right address
int newtime(struct rtc_time *rtc_tm);// passing the struct by reference, modifying value at the right address

// ========== VALUE =========
// int readtime(struct rtc_time *tm); // passing the struct by reference, modifying value at the right address
// int changetime(struct rtc_time *tm);// passing the struct by reference, modifying value at the right address
// int newtime(struct rtc_time *tm);// passing the struct by reference, modifying value at the right address

int main()
{
  struct rtc_time rtc_tm;
  rtc_tm.tm_sec  = 28;
  rtc_tm.tm_min  = 9;
  rtc_tm.tm_hour = 12;
  rtc_tm.tm_mday = 28;
  rtc_tm.tm_wday = 3;
  rtc_tm.tm_mon  = 8;
  rtc_tm.tm_year = 17;


  readtime(&rtc_tm); // variable struct tm as function argument. read initialized time
  changetime(&rtc_tm); // variable struct tm as function argument. change time
  readtime(&rtc_tm);
  synctime(&rtc_tm);
  
}


// ===================================== Pass by referemce ===========================

int readtime(struct rtc_time *rtc_tm)
{
  printf("sec:%d, min:%d, hour:%d, day:%d, month:%d, year:%d\n", rtc_tm->tm_sec, rtc_tm->tm_min, rtc_tm->tm_hour, rtc_tm->tm_mday, rtc_tm->tm_mon, rtc_tm->tm_year);
}

int changetime(struct rtc_time *rtc_tm)
{
  rtc_tm->tm_sec  = 51;
  rtc_tm->tm_min  = 11;
  rtc_tm->tm_hour = 15;
  rtc_tm->tm_mday = 38;
  rtc_tm->tm_wday = 35;
  rtc_tm->tm_mon  = 86;
  rtc_tm->tm_year = 57;
  printf("sec:%d, min:%d, hour:%d, day:%d, month:%d, year:%d\n", rtc_tm->tm_sec, rtc_tm->tm_min, rtc_tm->tm_hour, rtc_tm->tm_mday, rtc_tm->tm_mon, rtc_tm->tm_year);

}

int newtime(struct rtc_time *rtc_tm)
{
  printf("sec:%d, min:%d, hour:%d, day:%d, month:%d, year:%d\n", rtc_tm->tm_sec, rtc_tm->tm_min, rtc_tm->tm_hour, rtc_tm->tm_mday, rtc_tm->tm_mon, rtc_tm->tm_year);
}

int synctime(struct rtc_time *rtc_tm)
{
  struct tm *timeinfo;
  time_t rawtime ;
  char tmbuf [80] ;

  rawtime = time (NULL) ;
  timeinfo = localtime(&rawtime) ;  
  printf("rawtime %d\n", rawtime);
  printf("timeinfo %d\n", timeinfo);
  strftime(tmbuf,80,"%H:%M:%S %d-%b-%Y",timeinfo);  

  printf ("time library %s\n", tmbuf) ;

}