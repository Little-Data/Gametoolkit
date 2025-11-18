---
title: 一些批处理脚本
---
import AuthorCard from '@site/src/components/AuthorCard';

<AuthorCard authors={['半个水果','偷吃布丁的涅普缇努']} />

有些需要`ffmpeg`，请下载后并添加到系统环境变量！

请自行复制然后改后缀为`.bat`

文件来自https://space.bilibili.com/210298091

## bin改hca

```batch
ren *.bin *.hca
```

## bytes改成bank

```batch
ren *.bytes *.bank
```

## mp3压缩成aac

```batch
for %%i in ("*.mp3") do ffmpeg -i %%i -c:a aac -b:a 32k "%%~ni.aac
pause
```

## srt批量转换ass软字幕

```batch
for %%i in ("*.srt") do ffmpeg -i %%i "%%~ni.ass
pause
```

## vp9编码usm视频批量转换webm

```batch
for %%i in ("*.usm") do ffmpeg -i %%i -c:v libvpx-vp9 -preset fast -b:v 20M -r 60 -crf 16 -vf scale=2048:1080 "%%~ni.webm
pause
```

## wav改wem

```batch
ren *.wav *.wem
```

## 给文件加后缀

```batch
ren *. *.ab
```

## 批量去视频软字幕

```batch
for %%i in ("*.mkv") do ffmpeg -i %%i -c:v copy -c:a copy -sn "%%~ni.mp4
pause
```

## 批量删除后32位字符

```batch
@echo off
::Deep Lee
setlocal enabledelayedexpansion
for %%f in (*.usm) do ( 
echo %%f
set name=%%f
ren !name! !name:~0,-36%!.usm
)
pause
```

## 批量删除前N个字符

```batch
@echo off
setlocal enabledelayedexpansion

::批量去掉文件名前N个字符，如果有文件夹会搜索文件夹下的每个文件进行修改
set /p format=请输入需要操作的文件格式：wav
set /p deletenum=请输入需要删除文件名前多少个字符：
for /r %%i in (.) do (
    for /f "delims=" %%a in (' dir /b "%%i\*.%format%" 2^>nul ') do (
        set "t=%%~na"
        ren "%%i\%%a" "!t:~%deletenum%!%%~xa"
    )
)

pause
```

## 删除bak字符

```batch
@echo off
Setlocal Enabledelayedexpansion
set "str=.bak"
for /f "delims=" %%i in ('dir /b *.*') do (
set "var=%%i" & ren "%%i" "!var:%str%=!")
```

## 删除bik视频字符

```batch
@echo off
Setlocal Enabledelayedexpansion
set "str=_0000FFFF.video"
for /f "delims=" %%i in ('dir /b *.*') do (
set "var=%%i" & ren "%%i" "!var:%str%=!")
```

## 删除bik音频字符

```batch
@echo off
Setlocal Enabledelayedexpansion
set "str=_00000000.audio.multi"
for /f "delims=" %%i in ('dir /b *.*') do (
set "var=%%i" & ren "%%i" "!var:%str%=!")
```

## 删除pam视频264字符

```batch
@echo off
Setlocal Enabledelayedexpansion
set "str=_000001E0"
for /f "delims=" %%i in ('dir /b *.*') do (
set "var=%%i" & ren "%%i" "!var:%str%=!")
```

## 删除pam音频aa3字符

```batch
@echo off
Setlocal Enabledelayedexpansion
set "str=_000001BD"
for /f "delims=" %%i in ('dir /b *.*') do (
set "var=%%i" & ren "%%i" "!var:%str%=!")
```

## 删除usm视频字符

```batch
@echo off
Setlocal Enabledelayedexpansion
set "str=_40534656"
for /f "delims=" %%i in ('dir /b *.*') do (
set "var=%%i" & ren "%%i" "!var:%str%=!")
```

## 删除usm音频字符

```batch
@echo off
Setlocal Enabledelayedexpansion
set "str=_40534641"
for /f "delims=" %%i in ('dir /b *.*') do (
set "var=%%i" & ren "%%i" "!var:%str%=!")
```

## 删除wem字符

```batch
@echo off
Setlocal Enabledelayedexpansion
set "str=.wem"
for /f "delims=" %%i in ('dir /b *.*') do (
set "var=%%i" & ren "%%i" "!var:%str%=!")
```

## 删除括号

```batch
@Echo Off&SetLocal ENABLEDELAYEDEXPANSION

FOR %%a in (*) do (

set "name=%%a"

set "name=!name: (=!"

set "name=!name:)=!"

ren "%%a" "!name!"

)

exit
```

## 替换文字

```batch
@echo off
set /p str1= 请输入要替换的文件(文件夹)名字符串（可替换空格）：
set /p str2= 请输入替换后的文件(文件夹)名字符串（若删除直接回车）：
echo.
echo 正在操作中，请稍候……
for /f "delims=" %%a in ('dir /s /b ^|sort /+65535') do (
if "%%~nxa" neq "%~nx0" (
set "file=%%a"
set "name=%%~na"
set "extension=%%~xa"
call set "name=%%name:%str1%=%str2%%%"
setlocal enabledelayedexpansion
ren "!file!" "!name!!extension!" 2>nul
endlocal
)
)
exit
```

## 转换高质量视频

```batch
for %%i in ("*.mkv") do ffmpeg -i %%i -c:v libx265 -r 60 -crf 16 -preset fast -vf scale=2048:1080 -c:a aac -b:a 1536k "%%~ni.mp4
pause
```
