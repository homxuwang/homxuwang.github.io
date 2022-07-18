---
title: git笔记
date: 2018-07-18 09:14:03
tags: [git,学习笔记]
---

因为hexo博客之前出过一些问题，导致之前做的git笔记被覆盖掉丢失了。所以这次再一次整理一下git的一些常用操作并记录下来。

# 创建仓库

进入到要创建仓库的文件夹,输入命令
* `git init`
这时候会有提示 ![创建仓库](git笔记/1.png)
然后目录下会多一个`.git`的隐藏文件夹。

另外一种方式
* `git init demo` 初始化到一个叫demo的自定义文件夹

另外可以从远程仓库初始化
* `git clone https://github.com/xxxxxxxxx.git` 克隆项目

* `git clone https://github.com/xxxxxxxxx.git demo` 克隆项目到一个叫demo的自定义文件夹

# 基本用法

* `git status` 查看仓库状态
![创建仓库](git笔记/2.png)

No commits yet 是指没有提交记录
Untracked files 是指未跟踪到的文件，指有文件更改了但是没有commit

* `git add .` 将所有修改添加至暂存区

* `git commit -m "描述"`  提交版本(即在这个历史节点下修改和做了什么)

* `git add . && git commit -m "描述"` 同时执行两次操作
这时候再查看仓库状态，可以看到nothing to commit

![提交至缓存区并提交版本](git笔记/3.png)

* `git log` 查看版本记录
黄色的一串字母数字组合表示唯一标识

下面则是描述说明的内容

![查看版本记录](git笔记/4.png)

* `git log -p`可以看到修改的具体信息

* `git log --oneline` 一行显示

* `git checkout xxx` 穿越到指定的历史节点,xxx表示上面的唯一标识,可以不用输入全部()

* `git checkout -` 回到原来的节点

# 三种状态

* `modefied` 已修改
* `staged` 已暂存(缓冲阶段)
* `commited` 已提交
* `git diff` 比对当前内容和暂存区内容。
* `git diff HEAD` 比对当前内容和最近一次提交。
* `git diff HEAD^` 比对当前内容和倒数第二次提交。
* `git diff HEAD^ HEAD` 比对最近两次提交。
# 标签tag

项目开发中，在版本提交时会有很多小版本，但是其中有一些节点很重要，比如完成某些重要的功能，可以在这个重要的节点使用标签做标记。

* `git tag -a 标签名 -m "备注"` 添加tag (a=annotated有注释的) 默认加在最近的节点上面

* `git tag -a 标签名 -m "备注" 版本号` 在历史节点添加标签，最后加上历史版本号

* `git tag`  罗列所有tag

![tag](git笔记/5.png)

* command1 && command2 ：组合命令
* 添加 -a 属性，才可以后接-m属性
* `git show 标签名` 显示tag信息
* `git checkout 标签名` 回到tag所在的提交

# 分支branch

* `git branch $branchName`  在当前节点创建分支
* `git checkout $branchName` 切换到分支(可以跳转到不同分支)
* `git log --all --graph` 图形化显示

分支的作用主要是利用分支进行当前问题的处理（比如在某个版本分支出来进行调试bug，但是在master继续版本的推进，在bug修复后合并分支，这样bug得到了解决版本也进行了推进）。

## 合并分支

* `git checkout -b $branchName` 创建并切换至分支
* `git merge $branchName` 合并分支

合并一个文件要用人工进行处理orz

# 远程仓库

* `git remote add $remoteName $giturl`添加远程仓库
* `git push -u $remoteName $branchName`push到远程分支
![push](git笔记/7.png)
输入github的用户名密码就自动开始push了
* `git remote -v` 打印远程仓库信息

![remote](git笔记/6.png)
fetch是下载地址，push是上传地址

* `git clone $giturl` 克隆

* `git pull` = `git fetch && git merge`


![总结](git笔记/8.png)

根据`表严肃`老师的视频进行整理 http://biaoyansu.com/i/6593023230131