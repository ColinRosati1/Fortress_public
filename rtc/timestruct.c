#include <stdio.h>
#include <inttypes.h>
#include <time.h>


struct tm rtc_tm;
struct tm rtc_ptr;

void readtime(struct tm *rtc_tm); // passing the struct by reference, modifying value at the right address
void changetime(struct tm *rtc_tm);// passing the struct by reference, modifying value at the right address
void newtime(struct tm *rtc_tm);// passing the struct by reference, modifying value at the right address
void synctime(struct tm *rtc_tm); //uses the time library to sync time

int main(struct tm *rtc_ptr)
{
  struct tm time_ptr;

  synctime(&time_ptr);
  readtime(&time_ptr); // variable struct tm as function argument. read initialized time
  changetime(&time_ptr); // variable struct tm as function argument. change time
  printf("after changetime() ");
  readtime(&time_ptr);
}

void readtime(struct tm *rtc_ptr)
{
  printf("read time %s\n",asctime(rtc_ptr));
}

void changetime(struct tm *rtc_ptr)
{
  struct tm *ptr_time;
  printf("Enter a time expressed as hh:mm:ss format.\n");
  int input_time;
  input_time = scanf("%d %d %02d:%02d:%02d %d", &ptr_time->tm_mon, &ptr_time->tm_mday,&ptr_time->tm_hour, &ptr_time->tm_min, &ptr_time->tm_sec, &ptr_time->tm_year);
  *rtc_ptr = *ptr_time;
}

void newtime(struct tm *rtc_tm)
{
  printf("newtime() %d:%d:%d %d:%d:%d\n", rtc_tm->tm_hour, rtc_tm->tm_min, rtc_tm->tm_sec, rtc_tm->tm_mday, rtc_tm->tm_mon, rtc_tm->tm_year);
  printf("%s\n",asctime(rtc_tm) );
}

void synctime(struct tm *rtc_ptr)
{
  time_t time_raw_format;
  struct tm * ptr_time;
  time ( &time_raw_format );
  ptr_time = localtime ( &time_raw_format );
  *rtc_ptr = *ptr_time;
  printf ("Current local time and date: %s", asctime(rtc_ptr));
}