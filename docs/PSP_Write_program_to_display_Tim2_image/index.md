---
title: PSP 编写程序显示Tim2图片
date: 2026-09-28T00:53
last_update:
  date: 2026-09-28T00:53
---

import AuthorCard from '@site/src/components/AuthorCard';

<AuthorCard authors={['半个水果', 'zxp']} />

:::tip
原文档为 `txt` 格式，以下内容原样显示仅做必要调整
:::

编写程序显示Tim2图片 by zxp

现在ps2汉化比较流行，所以就写点，希望对你有帮助。

我用这张图片做讲解，来编写程序显示它。

这张图是8bpp,256色,512\*448的，显示方法就是在窗体上用点把这张图画出来，文件的最后1024字节是调色板，4个字节是1个颜色，格式是RGBA(红,绿,蓝,alpha),这么排列，共256色，文件的40H开始是图像数据，1个字节代表一个点，比如40H上7BH，10进制就是123，就是这个点用调色板的第123个颜色显示，知道了原理用什么语言写都是一样的。

先建了一个项目，把窗体拉大点，在放上一个pictureBox控件，我们要在画在这个空间上，也拉大点，在放个按钮，点击就显示图片，如下图

打开代码编辑器，开始写代码了

先建立一个空方法DrawShaper，这个方法就是把图片画到pictureBox控件

代码：

```csharp showLineNumbers
public void DrawShaper(Graphics g)
{

}
```

接着先打开文件，读取里边的调色板。

代码：

```csharp showLineNumbers
FileStream stream = new FileStream(Application.StartupPath+"\\"+"1.tm2", FileMode.Open, FileAccess.Read);
Byte[] Palette = new Byte[1024];
stream.Seek(-1024, SeekOrigin.End);
stream.Read(Palette, 0, Palette.Length);
```

1行是只读方式打开文件，变量stream就是这个打开的文件。

2行是创建一个字节数组，大小是1024，存储调色板

3行是把文件定位。

4行是把调色板读到字节数组里。

接着读取图像数据，图像数据大小不像调色板256色就是1024字节，它多少都有，但tim2文件头有定义，所以现要从文件头把大小读出来。

代码：

```csharp showLineNumbers
Byte[] BitmapDatadx1 = new Byte[3];
stream.Seek(24, SeekOrigin.Begin);
stream.Read(BitmapDatadx1, 0, BitmapDatadx1.Length);
string temp1 = BitmapDatadx1[2].ToString("x2") + BitmapDatadx1[1].ToString("x2") + BitmapDatadx1[0].ToString("x2");//高低位转换
string temp2 = int.Parse(temp1, System.Globalization.NumberStyles.HexNumber).ToString(); //把16进制转成10进制
int BitmapDatadx = int.Parse(temp2);
//读取图片数据
Byte[] BitmapData = new Byte[BitmapDatadx];
stream.Seek(64, SeekOrigin.Begin);
stream.Read(BitmapData, 0, BitmapData.Length);
```

都读完了该显示了，用pen语句定义调色板里的颜色，tim2里的调色板不是按顺序存放的，调色板开始的32个字节8个颜色，是对应颜色索引0-7，后面的32个字节8个颜色，是对应颜色索引16-23，在后面才是对应颜色索引8-15，依次类推24-31。要注意，pen语句的颜色格式是argb,在这里alpha都定义为255。

代码：

```csharp showLineNumbers
Pen[] p=new Pen[256];
int no = 0;//循环变量，每次+4，4个字节是1个颜色
int no1 = 0; //循环变量，够8次跳32个字节
int no2 = 0;
for (int i = 0; i < 256; ++i)//读取调色板单行颜色
{
    no1 += 1;
    no2 += 1;
    p = new Pen(Color.FromArgb(255, Palette[no], Palette[no + 1], Palette[no + 2 ]),1);
    no +=  4;
    if (no1 == 8)//读取1行16个颜色跳1行
    {
        no+=32;
        no1 = 0;
    }
    if (no2 == 16)
    {
        i += 16;
        no2 = 0;
    }
}
no = 32;
no1 = 0;
no2 = 0;
for (int i = 16; i < 256; ++i)
{
    no1 += 1;
    no2 += 1;
    p = new Pen(Color.FromArgb(255, Palette[no], Palette[no + 1], Palette[no + 2]), 1);
    no += 4;
    if (no1 == 8)
    {
        no += 32;
        no1 = 0;
    }
    if (no2 == 16)
    {
        i += 16;
        no2 = 0;
    }
}
```

估计不好理解，我写的也乱，来张调色板的图，可能好理解下。

到最后了，该真的画了

代码：

```csharp showLineNumbers
int x = 0;//x坐标
int y = 0;//y坐标
for (int ii = 0; ii < BitmapData.Length; ++ii)
{
    g.DrawRectangle(p[BitmapData[ii]], 0+x, 0+y, 1, 1);
    x += 1;
    if (x == 512) //够512就是1行了，把y坐标+1，在下1行在画
    {
            x = 0;
            y += 1;
    } 
}
```
`g.DrawRectangle` 是画方块的语句，c#里没有画点语句，就用它代替了。

已经都搞定了，还有个显示按钮，双击把下面代码写上就行了。

代码：

```csharp showLineNumbers
Graphics g = pictureBox1.CreateGraphics();
DrawShaper(g);
```

启动下看看效果吧，图片在一点一点的被画出来了。