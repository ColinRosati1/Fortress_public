#include <stdio.h>
#include <inttypes.h>
#include <time.h>


struct tm rtc_tm;
struct tm *rtc_ptr;

int readtime(struct tm *rtc_tm); // passing the struct by reference, modifying value at the right address
int changetime(struct tm *rtc_tm);// passing the struct by reference, modifying value at the right address
int newtime(struct tm *rtc_tm);// passing the struct by reference, modifying value at the right address
int synctime(struct tm *rtc_tm); //uses the time library to sync time

int main(struct tm *rtc_ptr)
{
  time_t time_raw_format;
  struct tm * ptr_time;
  time ( &time_raw_format );
  ptr_time = localtime ( &time_raw_format );
  rtc_ptr = ptr_time;
  synctime(rtc_ptr);
  readtime(rtc_ptr); // variable struct tm as function argument. read initialized time
  changetime(rtc_ptr); // variable struct tm as function argument. change time
  readtime(rtc_ptr);
 
 

}


// ===================================== Pass by referemce ===========================

int readtime(struct tm *rtc_ptr)
{
    printf("read time %s\n",asctime(rtc_ptr));
}

int changetime(struct tm *ptr_time)
{
  printf("Enter a time expressed as hh:mm:ss format.\n");
  int input_time;
  input_time = scanf("%02d:%02d:%02d",
        &ptr_time->tm_hour, &ptr_time->tm_min, &ptr_time->tm_sec);
  // if(input_time !=  3)
  // {
  //     printf("missing 3 time digits\n");
  //     return;
  // }
  // else if (input_time )
  // {

  // }
  // ptr_time->tm_sec  = 1;
  // ptr_time->tm_min  = 1;
  // ptr_time->tm_hour = 5;
  // ptr_time->tm_mday = 5;
  // ptr_time->tm_wday = 35;
  // ptr_time->tm_mon  = 86;
  // ptr_time->tm_year = 57;
}

int newtime(struct tm *rtc_tm)
{
  printf("newtime() %d:%d:%d %d:%d:%d\n", rtc_tm->tm_hour, rtc_tm->tm_min, rtc_tm->tm_sec, rtc_tm->tm_mday, rtc_tm->tm_mon, rtc_tm->tm_year);
   printf("%s\n",asctime(rtc_tm) );
}

int synctime(struct tm *rtc_ptr)
{
 
  time_t time_raw_format;
  struct tm * ptr_time;
  time ( &time_raw_format );
  ptr_time = localtime ( &time_raw_format );
  rtc_ptr = ptr_time;
  printf ("Current local time and date: %s", asctime(rtc_ptr));
}