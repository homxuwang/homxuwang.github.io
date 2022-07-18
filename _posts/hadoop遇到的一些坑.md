---
title: hadoop遇到的一些坑
date: 2018-07-24 19:38:35
tags: [大数据,hadoop]
---

最近开始了大数据的基础学习，刚开始就踩了一些坑。在这里做一下简要记录。

# WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform...

由于好久没有打开ubuntu系统使用hadoop，不知道是什么原因，今天运行hadoop的一些命令的时候有警告： `WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable`
百思不得其解，在开始安装好hadoop的时候是没有任何问题的，之后也没有动过。
搜索了一圈问题后，都说是电脑上的本地库和hadoop的需求不一致，但是我改了一圈也还是没有解决问题。后在这里找到方法并且尝试后解决了。https://blog.csdn.net/znb769525443/article/details/51507283

这里根据上面博客的内容简要摘录：
>增加调试信息，执行命令
```
export HADOOP_ROOT_LOGGER=DEBUG,console
hadoop fs -text est/data/origz/access.log.gz
```
>
>这样就能够看到报错的信息
>解决方法：
>修改`/HADOOP_HOME/etc/hadoop/中的hadoop_env.sh`在头部添加
```
export HADOOP_COMMON_LIB_NATIVE_DIR="/usr/local/hadoop/lib/native/"
export HADOOP_OPTS="$HADOOP_OPTS -Djava.library.path=/usr/local/hadoop/lib/native/"
```
>再次执行./start-dfs.sh 

问题解决。

当然每个人的错误虽然相似，但是错误原因可能不同，这里学会了一招看报错的log信息
hadoop开启关闭调试信息：

开启：`export HADOOP_ROOT_LOGGER=DEBUG,console` 

关闭：`export HADOOP_ROOT_LOGGER=INFO,console`

# hadoop集群启动之后dataNode节点没有启动

今天遇到的另一个问题是，在hadoop操作的时候，向某个文件夹复制文件的时候报错：`ARN hdfs.DataStreamer: DataStreamer Exception org.apache.hadoop.ipc.RemoteException`
然后锁定问题是dataNode节点没有启动，使用了命令`stop-all.sh start-all.sh`重启后仍然没有用。

使用了https://blog.csdn.net/qq_20124743/article/details/78668130 的方法得到了解决。

>启动Hadoop集群之后slave机器的dataNode节点没有启动 master机器的nameNode节点启动了

>1、在集群/usr/local/src/hadoop/bin目录下./stop-all.sh暂停所有服务

>2、将/usr/local/src/hadoop/目录下的 logs、tmp文件夹删除(DataNode存放数据块的位置) 然后重新建立tmp  logs文件夹

>3、重新格式化: （同样是在bin目录下）./hadoop namenode -format

>4、重新启动集群：./start-all.sh

>5、通过jps查看进程 就好了 
