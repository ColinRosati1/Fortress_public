#include <stdio.h>
#include <inttypes.h>
#include <time.h>


<<<<<<< HEAD

struct tm rtc_tm;

int readtime(struct tm *rtc_tm); // passing the struct by reference, modifying value at the right address
int changetime(struct tm *rtc_tm);// passing the struct by reference, modifying value at the right address
int newtime(struct tm *rtc_tm);// passing the struct by reference, modifying value at the right address

// ========== VALUE =========
// int readtime(struct rtc_time *tm); // passing the struct by reference, modifying value at the right address
// int changetime(struct rtc_time *tm);// passing the struct by reference, modifying value at the right address
// int newtime(struct rtc_time *tm);// passing the struct by reference, modifying value at the right address

int main()
{
  struct tm rtc_tm;
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

int readtime(struct tm *rtc_tm)
{
  printf("sec:%d, min:%d, hour:%d, day:%d, month:%d, year:%d\n", rtc_tm->tm_sec, rtc_tm->tm_min, rtc_tm->tm_hour, rtc_tm->tm_mday, rtc_tm->tm_mon, rtc_tm->tm_year);
}

int changetime(struct tm *rtc_tm)
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

int newtime(struct tm *rtc_tm)
{
  printf("sec:%d, min:%d, hour:%d, day:%d, month:%d, year:%d\n", rtc_tm->tm_sec, rtc_tm->tm_min, rtc_tm->tm_hour, rtc_tm->tm_mday, rtc_tm->tm_mon, rtc_tm->tm_year);
}

int synctime(struct tm *rtc_tm)
{
  struct tm *timeinfo;
  time_t rawtime ;
  char tmbuf [80] ;

  rawtime = time (NULL) ;
  rtc_tm = localtime(&rawtime) ;  

  strftime(tmbuf,80,"%H:%M:%S %d-%b-%Y",rtc_tm);  

  printf ("time library %s\n", tmbuf) ;

=======
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
>>>>>>> b46232db27205c9f77f95bff09c203ef1f683b29
}