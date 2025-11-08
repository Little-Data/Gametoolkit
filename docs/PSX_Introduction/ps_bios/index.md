---
title: BIOS调用
---
import AuthorCard from '@site/src/components/AuthorCard';

<AuthorCard authors={['半个水果','Pinocchio', 'pinokio']} />

第一列：调用地址

第二列：调用时0xt1的值

第三列：函数名字

参数通过0xa0,1,2,3和0xsp+0x10(当参数多于4个时）

　

0x00a0 - 0x0000 - int open(char *name , int mode)

0x00a0 - 0x0001 - int lseek(int fd , int offset , int whence)

0x00a0 - 0x0002 - int read(int fd , char *buf , int nbytes)

0x00a0 - 0x0003 - int write(int fd , char *buf , int nbytes)

0x00a0 - 0x0004 - close(int fd)

0x00a0 - 0x0005 - int ioctl(int fd , int cmd , int arg)

0x00a0 - 0x0006 - exit()

0x00a0 - 0x0007 - sys_b0_39()

0x00a0 - 0x0008 - char getc(int fd)

0x00a0 - 0x0009 - putc(char c , int fd)

0x00a0 - 0x000a - todigit

0x00a0 - 0x000b - double atof(char *s)

0x00a0 - 0x000c - long strtoul(char *s , char **ptr , int base)

0x00a0 - 0x000d - unsigned long strtol(char *s , char **ptr , int base)

0x00a0 - 0x000e - int abs(int val)

0x00a0 - 0x000f - long labs(long lval)

0x00a0 - 0x0010 - long atoi(char *s)

0x00a0 - 0x0011 - int atol(char *s)

0x00a0 - 0x0012 - atob

0x00a0 - 0x0013 - int setjmp(jmp_buf *ctx)

0x00a0 - 0x0014 - longjmp(jmp_buf *ctx , int value)

0x00a0 - 0x0015 - char *strcat(char *dst , char *src)

0x00a0 - 0x0016 - char *strncat(char *dst , char *src , int n)

0x00a0 - 0x0017 - int strcmp(char *dst , char *src)

0x00a0 - 0x0018 - int strncmp(char *dst , char *src , int n)

0x00a0 - 0x0019 - char *strcpy(char *dst , char *src)

0x00a0 - 0x001a - char *strncpy(char *dst , char *src , int n))

0x00a0 - 0x001b - int strlen(char *s)

0x00a0 - 0x001c - int index(char *s , int c)

0x00a0 - 0x001d - int rindex(char *s , int c)

0x00a0 - 0x001e - char *strchr(char *c , int c)

0x00a0 - 0x001f - char *strrchr(char *c , int c)

0x00a0 - 0x0020 - char *strpbrk(char *dst , *src)

0x00a0 - 0x0021 - int strspn(char *s , char *set)

0x00a0 - 0x0022 - int strcspn(char *s , char *set)

0x00a0 - 0x0023 - strtok(char *s , char *set)

0x00a0 - 0x0024 - strstr(char *s , char *set)

0x00a0 - 0x0025 - int toupper(int c)

0x00a0 - 0x0026 - int tolower(int c)

0x00a0 - 0x0027 - void bcopy(void *src , void *dst , int len)

0x00a0 - 0x0028 - void bzero(void *ptr , int len)

0x00a0 - 0x0029 - int bcmp(void *ptr1 , void *ptr2 , int len)

0x00a0 - 0x002a - memcpy(void *dst , void *src , int n)

0x00a0 - 0x002b - memset(void *dst , char c , int n)

0x00a0 - 0x002c - memmove(void *dst , void *src , int n)

0x00a0 - 0x002d - memcmp(void *dst , void *src , int n)

0x00a0 - 0x002e - memchr(void *s , int c , int n)

0x00a0 - 0x002f - int rand()

0x00a0 - 0x0030 - void srand(unsigned int seed)

0x00a0 - 0x0031 - void qsort(void *base , int nel , int width , int (*cmp)*void *,void *))

0x00a0 - 0x0032 - double strtod(char *s , char *endptr)

0x00a0 - 0x0033 - void *malloc(int size)

0x00a0 - 0x0034 - free(void *buf)

0x00a0 - 0x0035 - void *lsearch(void *key , void *base , int belp , int width , int (*cmp)(void * , void *))

0x00a0 - 0x0036 - void *bsearch( void *key , void *base , int nel , int size , int (*cmp)(void * , void *))

0x00a0 - 0x0037 - void *calloc(int size , int n)

0x00a0 - 0x0038 - void *realloc(void *buf , int n)

0x00a0 - 0x0039 - InitHeap(void *block , int n)

0x00a0 - 0x003a - _exit()

0x00a0 - 0x003b - char getchar(int fd)

0x00a0 - 0x003c - putchar(char c , int fd)

0x00a0 - 0x003d - char *gets(char *s)

0x00a0 - 0x003e - puts(char *s)

0x00a0 - 0x003f - printf(char *fmt , ...)

0x00a0 - 0x0041 - LoadTest(char *name , XF_HDR *header)

0x00a0 - 0x0042 - Load(char *name , XF_HDR *header)

0x00a0 - 0x0043 - Exec(struct EXEC *header , int argc , char **argc)

0x00a0 - 0x0044 - FlushCache()

0x00a0 - 0x0045 - void InstallInterruptHandler()

0x00a0 - 0x0046 - GPU_dw

0x00a0 - 0x0048 - int SetGPUStatus(int status)

0x00a0 - 0x0049 - GPU_cw

0x00a0 - 0x004a - GPU_cwb (not sure)

0x00a0 - 0x004d - int GetGPUStatus()

0x00a0 - 0x0049 - GPU_sync

0x00a0 - 0x0051 - LoadExec(char *name , int , int)

0x00x0 - 0x0052 - GetSysSp()

0x00a0 - 0x0054 - _96_init()

0x00a0 - 0x0055 - _bu_init()

0x00a0 - 0x0056 - _96_remove()

0x00a0 - 0x0057 - return 0 (it only does this)

0x00a0 - 0x0058 - return 0 (it only does this)

0x00a0 - 0x0059 - return 0 (it only does this)

0x00a0 - 0x005a - return 0 (it only does this)

0x00a0 - 0x005b - dev_tty_init

0x00a0 - 0x005c - dev_tty_open

0x00a0 - 0x005e - dev_tty_ioctl

0x00a0 - 0x005f - dev_cd_open

0x00a0 - 0x0060 - dev_cd_read

0x00a0 - 0x0061 - dev_cd_close

0x00a0 - 0x0062 - dev_cd_firstfile

0x00a0 - 0x0063 - dev_cd_nextfile

0x00a0 - 0x0064 - dev_cd_chdir

0x00a0 - 0x0065 - dev_card_open

0x00a0 - 0x0066 - dev_card_read

0x00a0 - 0x0067 - dev_card_write

0x00a0 - 0x0068 - dev_card_close

0x00a0 - 0x0069 - dev_card_firstfile

0x00a0 - 0x006a - dev_card_nextfile

0x00a0 - 0x006b - dev_card_erase

0x00a0 - 0x006c - dev_card_undelete

0x00a0 - 0x006d - dev_card_format

0x00a0 - 0x006e - dev_card_rename

0x00a0 - 0x0070 - _bu_init

0x00a0 - 0x0071 - _96_init

0x00a0 - 0x0072 - _96_remove

0x00a0 - 0x0078 - _96_CdSeekL

0x00a0 - 0x007c - _96_CdGetStatus

0x00a0 - 0x007e - _96_CdRead

0x00a0 - 0x0085 - _96_CdStop

0x00a0 - 0x0096 - AddCDROMDevice()

0x00a0 - 0x0097 - AddMemCardDevice()

0x00a0 - 0x0098 - DisableKernelIORedirection()

0x00a0 - 0x0099 - EnableKernelIORedirection()

0x00a0 - 0x009c - GetConf(int Event , int TCB , int Stack)

0x00a0 - 0x009d - GetConf(int *Event , int *TCB , int *Stack)

0x00a0 - 0x009f - SetMem(int size)

0x00a0 - 0x00a0 - _boot

0x00a0 - 0x00a1 - SystemError

0x00a0 - 0x00a2 - EnqueueCdIntr

0x00a0 - 0x00a3 - DequeueCdIntr

0x00a0 - 0x00a5 - ReadSector(count,sector,buffer)

0x00a0 - 0x00a6 - get_cd_status ??

0x00a0 - 0x00a7 - bufs_cb_0

0x00a0 - 0x00a8 - bufs_cb_1

0x00a0 - 0x00a9 - bufs_cb_2

0x00a0 - 0x00aa - bufs_cb_3

0x00a0 - 0x00ab - _card_info

0x00a0 - 0x00ac - _card_load

0x00a0 - 0x00ad - _card_auto

0x00a0 - 0x00ae - bufs_cb_4

0x00a0 - 0x00b2 - do_a_long_jmp()

0x00a0 - 0x00b4 - (sub_function)

    0 - u_long GetKernelDate (date is in 0xYYYYMMDD BCD format)

    1 - u_long GetKernel???? (returns 3 on cex1000 and cex3000)

    2 - char *GetKernelRomVersion()

    3 - ?

    4 - ?

    5 - u_long GetRamSize() (in bytes)

    6 -> F - ??

0x00b0 - 0x0000 - SysMalloc (to malloc kernel memory)

0x00b0 - 0x0007 - DeliverEvent(class , event)

0x00b0 - 0x0008 - OpenEvent(class , spec , mode , func) (source code is corrected)

0x00b0 - 0x0009 - CloseEvent(event)

0x00b0 - 0x000a - WaitEvent(event)

0x00b0 - 0x000b - TestEvent(event)

0x00b0 - 0x000c - EnableEvent(event)

0x00b0 - 0x000d - DisableEvent(event)

0x00b0 - 0x000e - OpenTh

0x00b0 - 0x000f - CloseTh

0x00b0 - 0x0010 - ChangeTh

0x00b0 - 0x0012 - InitPad

0x00b0 - 0x0013 - StartPad

0x00b0 - 0x0014 - StopPAD

0x00b0 - 0x0015 - PAD_init

0x00b0 - 0x0016 - u_long PAD_dr()

0x00b0 - 0x0017 - ReturnFromException

0x00b0 - 0x0018 - ResetEntryInt

0x00b0 - 0x0019 - HookEntryInt

0x00b0 - 0x0020 - UnDeliverEvent(class , event)

0x00b0 - 0x0032 - int open(char *name,int access)

0x00b0 - 0x0033 - int lseek(int fd,long pos,int seektype)

0x00b0 - 0x0034 - int read(int fd,void *buf,int nbytes)

0x00b0 - 0x0035 - int write(int fd,void *buf,int nbytes)

0x00b0 - 0x0036 - close(int fd)

0x00b0 - 0x0037 - int ioctl(int fd , int cmd , int arg)

0x00b0 - 0x0038 - exit(int exitcode)

0x00b0 - 0x003a - char getc(int fd)

0x00b0 - 0x003b - putc(int fd,char ch)

0x00b0 - 0x003c - char getchar()

0x00b0 - 0x003d - putchar(char ch)

0x00b0 - 0x003e - char *gets(char *s)

0x00b0 - 0x003f - puts(char *s)

0x00b0 - 0x0040 - cd

0x00b0 - 0x0041 - format

0x00b0 - 0x0042 - firstfile

0x00b0 - 0x0043 - nextfile

0x00b0 - 0x0044 - rename

0x00b0 - 0x0045 - delete

0x00b0 - 0x0046 - undelete

0x00b0 - 0x0047 - AddDevice (used by AddXXXDevice)

0x00b0 - 0x0048 - RemoveDevice

0x00b0 - 0x0049 - PrintInstalledDevices

0x00b0 - 0x004a - InitCARD

0x00b0 - 0x004b - StartCARD

0x00b0 - 0x004c - StopCARD

0x00b0 - 0x004e - _card_write

0x00b0 - 0x004f - _card_read

0x00b0 - 0x0050 - _new_card

0x00b0 - 0x0051 - Krom2RawAdd

0x00b0 - 0x0054 - long _get_errno(void)

0x00b0 - 0x0055 - long _get_error(long fd)

0x00b0 - 0x0056 - GetC0Table

0x00b0 - 0x0057 - GetB0Table

0x00b0 - 0x0058 - _card_chan

0x00b0 - 0x005b - ChangeClearPad(int)

0x00b0 - 0x005c - _card_status

0x00b0 - 0x005d - _card_wait

0x00c0 - 0x0000 - InitRCnt

0x00c0 - 0x0001 - InitException

0x00c0 - 0x0002 - SysEnqIntRP(int index , long *queue)

0x00c0 - 0x0003 - SysDeqIntRP(int index , long *queue)

0x00c0 - 0x0004 - get_free_EvCB_slot()

0x00c0 - 0x0005 - get_free_TCB_slot()

0x00c0 - 0x0006 - ExceptionHandler

0x00c0 - 0x0007 - InstallExceptionHandlers

0x00c0 - 0x0008 - SysInitMemory

0x00c0 - 0x0009 - SysInitKMem

0x00c0 - 0x000a - ChangeClearRCnt

0x00c0 - 0x000b - SystemError ???

0x00c0 - 0x000c - InitDefInt

0x00c0 - 0x0012 - InstallDevices

0x00c0 - 0x0013 - FlushStdInOutPut

0x00c0 - 0x0014 - return 0

0x00c0 - 0x0015 - _cdevinput

0x00c0 - 0x0016 - _cdevscan

0x00c0 - 0x0017 - char _circgetc(struct device_buf *circ)

0x00c0 - 0x0018 - _circputc(char c , struct device_buf *circ)

0x00c0 - 0x0019 - ioabort(char *str)

0x00c0 - 0x001b - KernelRedirect(int flag)

0x00c0 - 0x001c - PatchA0Table

另外有3个的调用方法不像上面的那样：

```
MiPS R3000:

Exception() {

li $a0,0

syscall

}

EnterCriticalSection() {

li $a0,1

syscall

}

ExitCriticalSection() {

li $a0,2

syscall

} 
```