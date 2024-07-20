中央处理器（CPU） R3000A
=================

PSX采用的R3000A芯片有些小变动，由MIPS变成LSI，它是一个32位的缩减指令集控制器（RISC）处理器，主频是33.8688MHz，每秒钟能处理3千万条指令。它有4KB的指令缓存、1KB的数据缓存和传输率为132MB/秒的总线，内含一个算术/逻辑运算器（ALU）和一个移位器，但缺少一个浮点运算器（FPU）。在R3000A里，一个字是32位，半字是16位，字节是8位的。PSX里有2个协处理器Cop，Cop0是系统控制器，Cop1是图形处理器（GPU）。

### 指令缓存：

（4KB缓存的管道尺寸为16字节）。可以获得80％左右的命中率，缓存是物理寻址和标识的。

### 数据缓存：

（1KB缓存的管道尺寸为4字节）。也可以获得80％左右的命中率，也是物理寻址和标识的。这是写通缓存，可以保持缓存内容和主存内容一致，为了减少写数据时CPU的停顿，总线接口单元用了一个4深度的写缓冲器以CPU的速度来捕获地址和数据，允许用较慢的速度来写入主存而不影响CPU。

### 通用寄存器：

R3000A使用32个32位的寄存器，一个32位的指令指针，两个32位的乘除寄存器，见下表：

| 寄存器号码   | 名字    | 用法         |
| ------- | ----- |:----------:|
| R0      | ZR    | 常量 0       |
| R1      | AT    | 为汇编程序保留    |
| R2-R3   | V0-V1 | 计算结果和表达式赋值 |
| R4-R7   | A0-A3 | 自变量        |
| R8-R15  | T0-T7 | 临时变量       |
| R16-R23 | S0-S7 | 全局变量       |
| R24-R25 | T8-T9 | 额外的临时变量    |
| R26-R27 | K0-K1 | 为操作系统核心保留  |
| R28     | GP    | 全局指针       |
| R29     | SP    | 栈指针        |
| R30     | FP    | 页面指针       |
| R31     | RA    | 返回地址       |

### 乘除结果寄存器和指令指针:

| 名字  | 描述                      |
| --- | ----------------------- |
| HI  | 乘法运算64位结果的高32位，或除法运算的余数 |
| LO  | 乘法运算64位结果的低32位，或除法运算的商  |
| PC  | 指令指针                    |

尽管每个寄存器都有自己的名字，但它们都是一样的，除了2个：R0（ZR）是由硬件指定永远为0的；R31（RA）用于Link或Jump到子程序时保存返回地址，它可以象普通寄存器那样被其他指令读写。

## R3000A指令集

指令编码是基于MIPS结构的，这表示了有三种类型指令编码：

I类型（Immediate立即）

| op  | rs  | rt  | immediate |
| --- | --- | --- | --------- |

J类型（Jump跳转）

| op  | target |
| --- | ------ |

R类型（Register寄存器）

| op  | rs  | rt  | rd  | shamt | funct |
| --- | --- | --- | --- | ----- | ----- |

其中：

| op        | 6位的操作码             |
| --------- | ------------------ |
| rs        | 5位的源寄存器指示器         |
| rt        | 5位的目标寄存器或者跳转条件     |
| immediate | 16位的立即数，或者跳转或者替换地址 |
| target    | 26位跳转目标地址          |
| rcl       | 5位目标寄存器指示器         |
| shamt     | 5位的移位总数            |
| funct     | 6位的函数段             |

R3000A指令可以分为下面几个基本组：

装入/储存指令：在内存和通用寄存器之间移动数据，是I类型指令。唯一的寻址模式是寄存器＋带符号立即数偏移寻址，这使得可以直接使用3种不同的寻址模式：寄存器＋偏移、寄存器直接和立即数。

算术指令：对寄存器执行算术，逻辑和移位操作，当源操作数和结果都是通用寄存器时，是R类型；当源操作数中有一个是16位立即数时，是R类型指令。计算指令使用3个地址格式，所以操作不必影响到源寄存器的内容。

跳转和分支指令：改变程序的控制流。当跳转目标地址是联合一个26位立即数和4位指令指针得到的页面绝对地址，是J类型指令，用于调用子程序；当目标地址是通用寄存器中的32位值时，是R类型，通常用来返回和快速结束；分支指令是I类型，目标地址是指令指针＋16位偏移。跳转和链接指令在寄存器R31保存一个返回地址，通常用于调用子程序，子程序的返回地址就存在R31。

协处理器指令：执行协处理器集的操作。协处理器的装入和储存总是I类型；协处理器操作性指令是依赖于协处理器的格式。在R3000A中，系统控制协处理器（cop0）包含了内存管理和异常处理的寄存器。

特殊指令：执行多种任务，包括在特殊和通用寄存器之间移动数据、系统调用和断点操作，总是R类型的。

## 指令集

下面的表是R3000A的汇编指令。

### 转入和储存指令

| 指令                     | 格式和描述                                                                            |
| ---------------------- | -------------------------------------------------------------------------------- |
| Load Byte              | LB rt, offset (base)<br> 符号扩展16位偏移＋寄存器中的基址寻址<br> 寻址字节符号扩展后装到rt                   |
| Load Byte Unsigned     | LBU rt, offset (base)<br> 符号扩展16位偏移＋寄存器中的基址寻址<br> 寻址字节0扩展后装到rt                   |
| Load Halfword          | LH rt, offset (base)<br> 符号扩展16位偏移＋寄存器中的基址寻址<br> 寻址半字符号扩展后装到rt                   |
| Load Halfword Unsigned | LHU rt, offset (base)<br> 符号扩展16位偏移＋寄存器中的基址寻址<br> 寻址半字0扩展后装到rt                   |
| Load Word              | LW rt, offset (base)<br> 符号扩展16位偏移＋寄存器中的基址寻址<br> 寻址字装到rt                         |
| Load Word Left         | LWL rt, offset (base)<br> 符号扩展16位偏移＋寄存器中的基址寻址<br> 寻址字左移位，使得寻址字节是字的左字节，然后合并到rt寄存器 |
| Load Word Right        | LWR rt, offset (base)<br> 符号扩展16位偏移＋寄存器中的基址寻址<br> 寻址字右移位，使得寻址字节是字的右字节，然后合并到rt寄存器 |
| Store Byte             | SB rt, offset (base)<br> 符号扩展16位偏移＋寄存器中的基址寻址<br> 储存rt寄存器的最低有效字节到寻址位置             |
| Store Halfword         | SH rt, offset (base)<br> 符号扩展16位偏移＋寄存器中的基址寻址<br> 储存rt寄存器的最低有效半字到寻址位置             |
| Store Word             | SW rt, offset (base)<br> 符号扩展16位偏移＋寄存器中的基址寻址<br> 储存rt寄存器的最低有效字到寻址位置              |
| Store Word Left        | SWL rt, offset (base)<br> 符号扩展16位偏移＋寄存器中的基址寻址<br> rt寄存器右移位，然后储存到寻址字节             |
| Store Word Right       | SWR rt, offset (base)<br> 符号扩展16位偏移＋寄存器中的基址寻址<br> rt寄存器左移位，然后储存到寻址字节             |

### 算术指令

#### ALU立即指令

| 指令                                  | 格式和描述                                                                         |
| ----------------------------------- | ----------------------------------------------------------------------------- |
| ADD Immediate                       | ADDI rt, rs, immediate<br> 寄存器rs加16位符号扩展数到寄存器rt。2补数溢出自陷                       |
| ADD Immediate Unsigned              | ADDIU rt, rs, immediate<br> 寄存器rs加16位符号扩展数到寄存器rt。溢出不自陷                        |
| Set on Less Than Immediate          | SLTI rt, rs, immediate<br> 比较16位符号扩展立即数和带符号32位整数rs，如果rs小于立即数，rt是1，否则是0        |
| Set on Less Than Unsigned Immediate | SLTIU rt, rs, immediate<br> 比较16位符号扩展立即数和无符号32位整数rs，如果rs小于立即数，rt是1，否则是0。溢出不自陷 |
| AND Immediate                       | ANDI rt, rs, immediate<br> 0扩展16位立即数‘与’寄存器rs到寄存器rt                            |
| OR Immediate                        | ORI rt, rs, immediate<br> 0扩展16位立即数‘或’寄存器rs到寄存器rt                             |
| Exclusive OR Immediate              | XORI rt, rs, immediate<br> 0扩展16位立即数‘异或’寄存器rs到寄存器rt                           |
| Load Upper Immediate                | LUI rt, immediate<br> 16位立即数左移16位。设置字的最低有效16位为0，结果存到rt                        |

#### 3操作数R类型指令

| 指令                        | 格式和描述                                                         |
| ------------------------- | ------------------------------------------------------------- |
| Add                       | ADD rd, rs, rt<br> 寄存器rs＋rt，32位结果存到寄存器rd<br> 2的补数溢出自陷         |
| ADD Unsigned              | ADDU rd, rs, rt<br> 寄存器rs＋rt，32位结果存到寄存器rd<br> 不自陷             |
| Subtract                  | SUB rd, rs, rt<br> 寄存器rs-rt，32位结果存到寄存器rd<br> 2的补数溢出自陷         |
| Subtract Unsigned         | SUBU rd, rs, rt<br> 寄存器rs-rt，32位结果存到寄存器rd<br> 不自陷             |
| Set on Less Than          | SLT rd, rs, rt<br> 比较寄存器rs和rt（32位带符号整数），如果rs小于rt，rd＝1，否则rt＝0  |
| Set on Less Than Unsigned | SLTU rd, rs, rt<br> 比较寄存器rs和rt（32位无符号整数），如果rs小于rt，rd＝1，否则rt＝0 |
| AND                       | AND rd, rs, rt<br> rs‘与’rt，结果存到rd                             |
| OR                        | OR rd, rs, rt<br> rs‘或’rt，结果存到rd                              |
| Exclusive OR              | XOR rd, rs, rt<br> rs‘异或’rt，结果存到rd                            |
| NOR                       | NOR rd, rs, rt<br> rs‘或非’rt，结果存到rd                            |

#### 移位操作指令

| 指令                              | 格式和描述                                                      |
| ------------------------------- | ---------------------------------------------------------- |
| Shift Left Logical              | SLL rd, rt, shamt<br> 寄存器rt左移shamt位，低位补0，32位结果存在rd         |
| Shift Right Logical             | SRL rd, rt, shamt<br> 寄存器rt右移shamt位，高位补0，32位结果存在rd         |
| Shift Right Arithmetic          | SRA rd, rt, shamt<br> 寄存器rt左移shamt位，符号扩展高位，32位结果存在rd       |
| Shift Left Logical Variable     | SLLV rd, rt, rs<br> 寄存器rt左移，移位数是寄存器rs的低5位，低位补0，32位结果存在rd   |
| Shift Right Logical Variable    | SRLV rd, rt, rs<br> 寄存器rt右移，移位数是寄存器rs的低5位，高位补0，32位结果存在rd   |
| Shift Right Arithmetic Variable | SRAV rd, rt, rs<br> 寄存器rt左移，移位数是寄存器rs的低5位，符号扩展高位，32位结果存在rd |

#### 乘除运算指令

| 指令                | 格式和描述                                                     |
| ----------------- | --------------------------------------------------------- |
| Multiply          | MULT rs, rt<br> 寄存器rs和rt作为2的补数相乘，64位结果存在寄存器HI/LO          |
| Multiply Unsigned | MULTU rs, rt<br> 寄存器rs和rt作为无符号数相乘，64位结果存在寄存器HI/LO         |
| Divide            | DIV rs, rt<br> 寄存器rs和rt作为2的补数相除，32位商存在寄存器LO，32位余数存在寄存器HI  |
| Divide Unsigned   | DIVU rs, rt<br> 寄存器rs和rt作为无符号数相除，32位商存在寄存器LO，32位余数存在寄存器HI |
| Move From HI      | MFHI rd<br> 移动寄存器HI的值到rd                                  |
| Move From LO      | MFLO rd<br> 移动寄存器LO的值到rd                                  |
| Move To HI        | MTHI rd<br> 移动寄存器rd的值到HI                                  |
| Move To LO        | MTLO rd<br> 移动寄存器rd的值到LO                                  |

### 跳转和转移指令

#### 跳转指令

| 指令                     | 格式和描述                                                              |
| ---------------------- | ------------------------------------------------------------------ |
| Jump                   | J target<br> 左移26位target地址，加上PC的高4位，1个指令延时后跳转。                     |
| Jump and Link          | JAL arget<br> 左移26位target地址，加上PC的高4位，1个指令延时后跳转。下一个指令地址放到r31（链接寄存器） |
| Jump Register          | JR rs<br> 跳转到寄存器rs中的地址，1个指令延时                                      |
| Jump and Link Register | JALR rs, rd<br> 跳转到寄存器rs中的地址，1个指令延时。下一个指令地址放到r31（链接寄存器）            |

#### 分支指令

| 指令                                            | 格式和描述                                                                  |
| --------------------------------------------- | ---------------------------------------------------------------------- |
| .                                             | 分支目标：<br> 所有分支指令目标地址是这样计算的：指令地址加上16位偏移地址（左移2位后扩展符号到32位），全部的分支都是1个指令延时。 |
| Branch on Equal                               | BEQ rs, rt, offset<br> 如果rs等于rt，转移到目标地址                                |
| Branch on Not Equal                           | BNE rs, rt, offset<br> 如果rs不等于rt，转移到目标地址                               |
| Branch on Less than or Equal Zero             | BLEZ rs, offset<br> 如果rs小于等于0，转移到目标地址                                  |
| Branch on Greater Than Zero                   | BGTZ rs, offset<br> 如果rs大于0，转移到目标地址                                    |
| Branch on Less Than Zero                      | BLTZ rs, offset<br> 如果rs小于0，转移到目标地址                                    |
| Branch on Greater than or Equal Zero          | BGEZ rs, offset<br> 如果rs大于等于0，转移到目标地址                                  |
| Branch on Less Than Zero And Link             | BLTZAL rs, offset<br> 如果rs小于0，转移到目标地址。下一个指令地址存到r31                     |
| Branch on greater than or Equal Zero And Link | BGEZAL rs, offset<br> 如果rs大于等于0，转移到目标地址。下一个指令地址存到r31                   |

### 特殊指令

| 指令          | 格式和描述                             |
| ----------- | --------------------------------- |
| System Call | SYSCALL<br> 初始化系统调用自陷，立刻转移控制到异常处理 |
| Breakpoint  | BREAK<br> 初始化断点自陷，立刻转移控制到异常处理     |

### 协处理器指令

| 指令                             | 格式和描述                                                              |
| ------------------------------ | ------------------------------------------------------------------ |
| Load Word to Co-processor      | LWCz rt, offset (base)<br> 16位符号扩展偏移＋基址寻址<br> 寻址字装到z协处理器单元的寄存器rt   |
| Store Word from Co-processor   | SWCz rt, offset (base)<br> 16位符号扩展偏移＋基址寻址<br> z协处理器单元的寄存器rt存到内存寻址字 |
| Move To Co-processor           | MTCz rt, rd<br> 移动CPU寄存器rt到z协处理器单元的寄存器rd                           |
| Move from Co-processor         | MFCz rt,rd<br> 移动z协处理器单元的寄存器rd到CPU寄存器rt                            |
| Move Control To Co-processor   | CTCz rt,rd<br> 移动CPU寄存器rt到z协处理器单元的控制寄存器rd                          |
| Move Control From Co-processor | CFCz rt,rd<br> 移动z协处理器单元的控制寄存器rd到CPU寄存器rt                          |
| Move Control To Co-processor   | COPz cofun<br> 协处理器z进行一个操作，R3000A的状态不会被协处理器改变                      |

#### 系统控制协处理器（COP0）指令

| 指令                           | 格式和描述                                                                      |
| ---------------------------- | -------------------------------------------------------------------------- |
| Move To CP0                  | MTC0 rt, rd<br> 储存CPU寄存器rt到CP0寄存器rd。这个命令跟在普通储存操作之后。                        |
| Move From CP0                | MFC0 rt, rd<br> 装载CP0寄存器rd到CPU寄存器rt                                        |
| Read Indexed TLB Entry       | TLBR<br> 装载Index寄存器指定的TLB条目到EntryHi和EntryLo寄存器                             |
| Write Indexed TLB Entry      | TLBWI<br> 装载EntryHi和EntryLo寄存器到Index寄存器指定的TLB条目                            |
| Write Random TLB Entry       | TLBWR<br> 装载EntryHi和EntryLo寄存器到Random寄存器指定的TLB条目                           |
| Probe TLB for Matching Entry | TLBP<br> 装载和EntryHi和EntryLo匹配的TLB条目地址到Index寄存器，如果没有TLB条目匹配，设置Index寄存器的高顺序位 |
| Restore From Exception       | RFE<br> 恢复前一个中断掩码和状态寄存器的模式位到当前状态位，恢复旧的状态位到前一个状态位。                          |

### R3000A操作码编码

下面是MIPS结构的操作码编码

#### 操作码

| 位     | 28...26 |       |      |       |      |     |      |      |
| ----- | ------- | ----- | ---- | ----- | ---- | --- | ---- | ---- |
| 38…29 | 0       | 1     | 2    | 3     | 4    | 5   | 6    | 7    |
| 0     | SPECIAL | BCOND | J    | JAL   | BEQ  | BNE | BLEZ | BGTZ |
| 1     | ADDI    | ADDIU | SLTI | SLTIU | ANDI | ORI | XORI | LUI  |
| 2     | COP0    | COP1  | COP2 | COP3  | †    | †   | †    | †    |
| 3     | †       | †     | †    | †     | †    | †   | †    | †    |
| 4     | LB      | LH    | LWL  | LW    | LBU  | LHU | LWR  | †    |
| 5     | SB      | SH    | SWL  | SW    | †    | †   | SWR  | †    |
| 6     | LWC0    | LWC1  | LWC2 | LWC3  | †    | †   | †    | †    |
| 7     | SWC0    | SWC1  | SWC2 | SWC3  | †    | †   | †    | †    |

#### 特殊

| 位   | 2…0  |       |      |      |         |       |      |      |
| --- | ---- | ----- | ---- | ---- | ------- | ----- | ---- | ---- |
| 5…3 | 0    | 1     | 2    | 3    | 4       | 5     | 6    | 7    |
| 0   | SLL  | †     | SRL  | SRA  | SLLV    | †     | SRLV | SRAV |
| 1   | JR   | JALR  | †    | †    | SYSCALL | BREAK | †    | †    |
| 2   | MFHI | MTHI  | MFLO | MTLO | †       | †     | †    | †    |
| 3   | MULT | MULTU | DIV  | DIVU | †       | †     | †    | †    |
| 4   | ADD  | ADDU  | SUB  | SUBU | AND     | OR    | XOR  | NOR  |
| 5   | †    | †     | SLT  | SLTU | †       | †     | †    | †    |
| 6   | †    | †     | †    | †    | †       | †     | †    | †    |
| 7   | †    | †     | †    | †    | †       | †     | †    | †    |

#### 条件跳转

| 位     | 8…16   |        |     |     |     |     |     |     |
| ----- | ------ | ------ | --- | --- | --- | --- | --- | --- |
| 20…19 | 0      | 1      | 2   | 3   | 4   | 5   | 6   | 7   |
| 0     | BLTZ   | BGEZ   |     |     |     |     |     |     |
| 1     |        |        |     |     |     |     |     |     |
| 2     | BLTZAL | BGEZAL |     |     |     |     |     |     |

#### 协处理器z

| 位     | 23…21 |     |     |     |     |     |     |     |
| ----- | ----- | --- | --- | --- | --- | --- | --- | --- |
| 25…24 | 0     | 1   | 2   | 3   | 4   | 5   | 6   | 7   |
| 0     | MF    |     | CF  |     | MT  |     | CT  |     |
| 1     | BC    | †   | †   | †   | †   | †   | †   | †   |

协处理器特殊操作

#### 协处理器0（COP0）

| 位   | 2…0  |      |       |     |     |     |       |     |
| --- | ---- | ---- | ----- | --- | --- | --- | ----- | --- |
| 4…3 | 0    | 1    | 2     | 3   | 4   | 5   | 6     | 7   |
| 0   |      | TLBR | TLBWI |     |     |     | TLBWR |     |
| 1   | TLBP |      |       |     |     |     |       |     |
| 2   | RFE  |      |       |     |     |     |       |     |
| 3   |      |      |       |     |     |     |       |     |


