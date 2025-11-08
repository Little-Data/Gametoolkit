---
title: 一些Python脚本
---
import AuthorCard from '@site/src/components/AuthorCard';

<AuthorCard authors={['半个水果']} />

在使用这些脚本之前，请确认已经安装了Python
如果没有，请到官网下载。由于为外网，网页可能打不开[Download Python](https://www.python.org/downloads)

自行复制代码，再粘贴到一个文本文件内，然后把`.txt`后缀改为`.py`

## 批量以数字重命名

````Python showLineNumbers
# -*- coding: utf-8 -*-

import os

# 对所有文件以数字递增的方式重命名
def file_rename(path):
    try:
        filelist = os.listdir(path)  # 获取指定路径下的所有文件和文件夹
        i = 0
        total_files_processed = 0  # 处理的文件数量

        # 遍历所有文件
        for files in filelist:
            Olddir = os.path.join(path, files)  # 原来的文件路径
            if os.path.isdir(Olddir):  # 如果是文件夹则跳过
                continue
            
            i += 1
            # 文件扩展名
            filetype = os.path.splitext(files)[1]  # 如果你不想改变文件类型的话，使用原始扩展名
            Newdir = os.path.join(path, f"{i}{filetype}")  # 新的文件路径
            
            os.rename(Olddir, Newdir)  # 重命名文件
            total_files_processed += 1  # 增加处理的文件数量

        print(f"处理了 {total_files_processed} 个文件.")
        return True
    
    except Exception as e:
        print(f"错误: {e}")
        return False

if __name__ == '__main__':
    # 用户输入要处理的文件夹路径
    directory_path = input("请输入要处理的文件夹路径: ").strip()
    file_rename(directory_path)
````

## 文件分类

````Python showLineNumbers
import os
import shutil

def move_files_to_directories(input_directory):
    # 获取当前工作目录
    current_directory = os.getcwd()
    # 设置目标目录
    target_directory = os.path.join(current_directory, 'moved_files')
    
    # 创建目标目录，如果不存在
    if not os.path.exists(target_directory):
        os.makedirs(target_directory)

    # 遍历输入目录及其所有子目录中的所有文件
    for root, dirs, files in os.walk(input_directory):
        for filename in files:
            # 取得当前脚本的名字
            py_name = os.path.basename(__file__)

            # 如果此文件是当前执行的py脚本，则跳过
            if filename == py_name:
                continue
            
            # 获取文件的完整路径
            file_path = os.path.join(root, filename)
            
            # 确保它是一个文件
            if os.path.isfile(file_path):
                # 分离文件名和扩展名
                file_base, file_extension = os.path.splitext(filename)
                
                # 创建以扩展名命名的目录
                extension_dir = os.path.join(target_directory, file_extension[1:])
                if not os.path.exists(extension_dir):
                    os.makedirs(extension_dir)
                
                # 移动文件到新的目录
                shutil.move(file_path, os.path.join(extension_dir, filename))
                print(f"文件 {filename} 已移动到 {file_extension[1:]} 目录。")

# 用户输入要处理的文件夹路径
input_directory = input("请输入要处理的文件夹路径: ")

if not os.path.isdir(input_directory):
    print(f"错误: {input_directory} 不是一个有效的目录。")
else:
    move_files_to_directories(input_directory)
````