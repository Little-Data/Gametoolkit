---
title: 3ds游戏解包工具
---
import AuthorCard from '@site/src/components/AuthorCard';

<AuthorCard authors={['半个水果','偷吃布丁的涅普缇努']} />

文件来自https://space.bilibili.com/210298091

感谢他的无私奉献！

[文件](https://github.com/Little-Data/Gametoolkit/releases/tag/V4.2)

## cia转换cci方法

```batch
makerom-x86_64.exe -ciatocci 文件名.cia
```

## 3ds游戏解包流程（白嫖党）

没有NS主机的3ds游戏解包流程：

## 准备工作：

准备3ds游戏rom，`cia`转换成`cci`，再手动改成3ds格式，有3ds格式的rom最好，准备好`3dstool`，把需要解包的游戏rom放到`3dstool`文件夹。缺少`xorpad`文件，输入的命令简化，此方法仅适合白嫖党。

## 第一步：提取cci

按住键盘上的`SHIFT`键，同时右击文件夹中空白处，点击在此处打开命令窗口，输`MD cci`创建文件夹cci，接着键入命令：

```batch
3dstool -xvt0f cci cci\0.cxi input.3ds --header cci\ncsdheader.bin
```

可以发现提取出了一个`cxi`和`ncsdheader.bin`文件。

在CMD中提示`INFO: partition 1（7） is not extract`的话指的是在`cci`文件中，还有第1分区的`1.cfa`和第7分区的`7.cfa`没有被提取出来，然后我们就需要改变命令中的参数重新提取这两个文件：

```batch
3dstool -xvt17f cci cci\1.cfa cci\7.cfa input.3ds
```

如果只有第1分区没提取出来，则输入：

```batch
3dstool -xvt1f cci cci\1.cfa input.3ds
```

## 第二步：提取cxi/cfa

输入该命令创建文件夹：`MD cci\cxi0`，接着键入以下命令：

```batch
3dstool -xvtf cxi cci\0.cxi --header cci\cxi0\ncchheader.bin --exh cci\cxi0\exh.bin --plain cci\cxi0\plain.bin --exefs cci\cxi0\exefs.bin --romfs cci\cxi0\romfs.bin
```

成功提取出5个bin文件，这样cxi0就提取完了。

创建文件夹`MD cci\cfa1`，键入命令：

```batch
3dstool -xvtf cfa cci\1.cfa --header cci\cfa1\ncchheader.bin --romfs cci\cfa1\romfs.bin
```

以实际分区为准，如果是分区7则输入`cfa7`，必须倒过来写，不能写`7.cfa`或`1.cfa`

## 第三步：提取提取bin

直接键入代码：

```batch
3dstool -xvtf romfs cci\cxi0\romfs.bin --romfs-dir cci\cxi0\romfs
```

接下来`exefs.bin`文件也是使用同样的方法进行提取，但是这里请注意，exefs提取时，可能需要把`-xvtf`改为`-xvtfu`，因为在部分游戏中，exefs文件是使用反向LZ77压缩的（具体是否需要添加`-u`，需要查看exh中的hex16进制信息，若是`exh.bin`的0000000d位的值为1时，需要加`-u`），所以需要将代码改为：

```batch
3dstool -xvtfu exefs cci\cxi0\exefs.bin --exefs-dir cci\cxi0\exefs
```

`cfa1`文件夹中的romfs.bin文件也使用相同的方法进行提取：

```batch
3dstool -xvtf romfs cci\cfa1\romfs.bin --romfs-dir cci\cfa1\romfs
```

好了，到此为止，所有的提取工作都完成了，我们得到了ROM中的资源文件。

# 3DSAudioRipper音频提取

软件界面

`save location`      设置输出路径
`open source file`  打开文件
`formats to dump`  导出文件类型
`process file`  点击执行

# 3DS_Multi_Decryptor破解加密3ds游戏

把ROM拖到`ctrKeyGen.py`上

# 3DS SoundArchiveTool音频提取

3ds游戏里打包格式为`bcsar`或者`bfsar`的文件拖到exe上即可解包，使用Foobar2000转换音乐。
