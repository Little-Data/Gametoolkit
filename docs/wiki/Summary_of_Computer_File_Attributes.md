# 计算机文件属性汇总Summary of Computer File Attributes

来自[阿斯特罗乔布斯-哔哩哔哩](https://space.bilibili.com/210298091)，有改动。

| 计算机文件格式              | 文件头                     | 文件头原始文本/标志 | 备注                           | 代表作/备注                | 解包方法                                        |
|:--------------------:|:-----------------------:|:----------:|:----------------------------:|:---------------------:|:-------------------------------------------:|
| cpk                  | 43 50 4B                | CPK        | 游戏打包格式                       | 虚空幻界、彼岸游境             | 使用garbro、CpkFileBuilder、Noesis等工具解包         |
| usm                  | 43 52 49 44             | CRID       | criware的视频格式                 | 原神、崩坏三等很常见的格式         | vgm工具箱                                      |
| acb                  | 40 55 54 46             | @UTF       | criware的视频格式                 | steam刀剑神域系列           | Foobar2000、vgm工具箱                           |
| awb                  | 41 46 53 32             | AFS2       | criware的视频格式                 | steam刀剑神域系列           | Foobar2000、vgm工具箱                           |
| hca                  | 48 43 41                | HCA        | criware的视频格式                 | vgm工具箱转换acb或者usm视频的格式 | foobar2000、格式工厂、ffmpeg                      |
| ckb                  | 63 6B 6D 6B             | ckmb       | 未知                           | 未记录                   | foobar2000                                  |
| unity游戏              | 55 6E 69 74 79 46 53    | UnityFS    | unity大多数游戏常见的文件头             | 王者荣耀、原神……             | assetstudio                                 |
| avi、wav、wem、bank     | 52 49 46 46             | RIFF       | 游戏中视频、音频文件常见的文件头             | 大多数unity游戏、虚幻引擎游戏     | foobar2000                                  |
| fsb                  | 46 53 42 35             | FSB5       | fmod引擎的音频打包格式                | 大多数unity游戏            | assetstudio、foobar2000                      |
| PFS                  | 70 66 38                | pf8        | 未知                           | 未记录                   | 使用garbro                                    |
| bnk                  | 42 4B 48 44             | BKHD       | wwise引擎的音频打包格式               | 大多数unity游戏            | foobar2000                                  |
| pam                  | 50 41 4D 46 30 30 34 31 | PAMF0041   | 未知                           | steam单机游戏的一种视频打包格式    | vgm工具箱可提取，没使用ffmpeg测试                       |
| bik                  | 42 49 4B 69             | BIKi       | bink视频，rad games tool开发的视频格式 | 逆战                    | 格式工厂、ffmpeg                                 |
| bk2                  | 4B 42 32 6A             | kb2j       | bink视频，rad games tool开发的视频格式 | 狂热传说、情热传说             | radvideo                                    |
| bk2                  | 4B 42 32 69             | kb2i       | bink视频，rad games tool开发的视频格式 | 白荆回廊                  | radvideo                                    |
| bk2                  | 4B 42 32 6E             | kb2n       | bink视频，rad games tool开发的视频格式 | 白荆回廊                  | radvideo                                    |
| bra                  | 50 44 41                | PDA        | 未知                           | 妖精剑士F                 | bra音频可尝试用dargon unpacker解包                  |
| xwb                  | 57 42 4E 44             | WBND       | 地雷社游戏中常见的音频文件打包格式            | 超次元游戏海王星、死亡终局轮回试炼     | unxwb、foobar2000                            |
| exe                  | 4D 5A                   | MZ         | windows应用程序执行文件              | 常见的文件格式               | 7z                                          |
| dll                  | 4D 5A                   | MZ         | windows应用程序扩展文件              | 常见的文件格式               | 7z                                          |
| xp3                  | 58 50 33                | XP3        | galgame游戏常见的打包格式             | KARAKARA2             | 可尝试用garbro解包                                |
| snd                  | 4F 67 67 53             | OggS       | 一种音频格式                       | 约战凛绪轮回                | foobar2000                                  |
| cab                  | 4D 53 43 46             | MSCF       | Windows的压缩格式                 | 装驱动，补丁的目录下面可能会有       | 7z                                          |
| mid                  | 4D 54 68 64             | MThd       | 主机掌机游戏的解包的一种音频格式             | 重装机兵2r、重装机兵3          | vgmtrans解包nds，使用foobar2000转换                |
| moflex               | 4C 32                   | L2         | 3DS游戏的一种视频格式                 | 重装机兵4                 | 使用ffmpeg转换                                  |
| pmf                  | 50 53 4D 46 30 30       | PSMF00     | PSP游戏的视频专用打包格式               | 刀剑神域无限时刻、英雄传说空之轨迹     | 使用ffmpeg转换                                  |
| bcsar                | 43 53 41 52             | CSAR       | 3DS游戏的一种音频打包格式               | 嘿！皮克敏                 | 使用3DS SoundArchiveTool解包                    |
| bcwav                | 43 57 41 56             | CWAV       | 3DS游戏bcsar文件的音频解包格式          | 嘿！皮克敏                 | foobar2000                                  |
| bcstm                | 43 53 54 4              | CSTM       | 3DS游戏的一种音频打包格式               | 嘿！皮克敏                 | foobar2000、ffmpeg                           |
| vag                  | 56 41 47 70             | VAGp       | psp游戏的一种音频格式                 | 英雄传说空之轨迹              | foobar2000、ffmpeg                           |
| pak（虚幻引擎）            | 不固定                     | 不固定        | 虚幻引擎的一种打包格式                  | 刀剑神域夺命凶弹、幻塔等游戏        | fmodel、umodel输入AES密钥解包                      |
| pck                  | 46 69 6C 65 6E 61 6D 65 | Filename   | steam单机游戏的一种pck文件            | 超女神信仰诺瓦露、约战凛绪轮回       | 除了音频还存储图片，使用dragon unpacker解包               |
| pck                  | 41 4B 50 4B             | AKPK       | unity游戏中使用wwise引擎打包的格式       | 原神、崩坏三                | dragon unpacker解包，改后缀为bnk或wem使用foobar2000转换 |
| zip、apk、xapk、obb、ipa | 50 4B                   | PK         | 不同平台的PK文件                    | 安卓应用安装包               | 7z、MT管理器打开                                  |
| iso                  | 不固定                     | 不固定        | psp游戏rom文件格式                 | 空之轨迹、我的妹妹不可能那么可爱      | 7z                                          |
| at3                  | 52 49 46 46             | RIFF       | PSP游戏的音频格式，实际上等同于wav、wem     | 我的妹妹不可能那么可爱           | foobar2000、ffmpeg                           |
| adx                  | 不固定                     | 不固定        | criware的音频格式                 | 未记录，usm视频解包的一种音频格式    | foobar2000                                  |
| ssw                  | 58 57 53 46 49 4C 45    | XWSFILE    | 3ds游戏的一种音频打包格式               | 死或生维度                 | 3DS Audio Ripper，提取出bgwav格式的音频              |
| ktx                  | AB 4B 54 58 20 31 31 BB |            | 手游中的一种图片格式                   | 海岛奇兵                  | TexturePackerGui                            |
| wmv                  | 30 26 B2 75 8E 66 CF 11 |            | 一种视频格式                       | 海王星U                  | ffmpeg、格式工厂等                                |
| ogv                  | 4F 67 67 53             | OggS       | theora编码，开放免费的视频压缩格式         | 冬日树下的回忆               | ffmpeg、格式工厂等                                |
| asar                 | 不固定                     | 不固定        | galgame游戏的一种打包格式             | 冬日树下的回忆               | winasar可以完全解包、dragon unpacker只能提取图片和音频      |
