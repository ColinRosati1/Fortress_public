// fram_RW.h this is the header for fram_RW library

#ifndef _FRAM_RW_H_
#define _FRAM_RW_H_

void fram_read(int address, char *data, int size);

void fram_write(int address, char *data, int size);

void fram_init(int fd);

#endif