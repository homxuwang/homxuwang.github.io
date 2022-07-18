---
title: SpringBoot打包为JAR包后访问不到Resources下的文件问题
date: 2019-12-26 10:47:36
tags: [系统开发记录]
---

最近使用SpringBoot进行开发时，需要读取一个本地的文件，所以将文件放到了SpringBoot项目的`Resources/static`目录下，在使用IDEA运行且访问时，没有问题，但是当发布为JAR包后，却报错，无法找到文件。

在网上找了相关解决方案，说在SpringBoot项目中，为了获取相对路径并且保证程序在打包为JAR后仍然能够读取到对应的文件，要用`ClassPathResource`类进行读取
但是我用了之后仍然不行。

控制台错误打印如下：
```
 "message": "class path resource [static/satellite.txt] cannot be resolved to absolute file path because it does not reside in the file system: jar:file:/D:/satellite/satellite/target/satellite-0.0.1-SNAPSHOT.jar!/BOOT-INF/classes!/static/satellite.txt",
```

后来找到原因，在代码中使用File对象创建和读取文件，导致无法获取到对应的文件对象：

```java
ClassPathResource classPathResource = new ClassPathResource("static/satellite.txt");
File file = classPathResource.getFile();
```

猜想原因可能是在打包为JAR后，JAR是一个压缩包，不能直接获取文件对象，要改为用流进行读取和创建，除非真的需要创建文件对象，否则即使获取到文件对象，可能后面也要转为用流进行下一步操作，所以不妨直接用`ClassPathResource`对象的`getInputStream()`方法，一步到位获取到。
```java
ClassPathResource classPathResource = new ClassPathResource("static/satellite.txt");
//打包成jar无法读取文件,要用流读取
//File file = classPathResource.getFile();
InputStream inputStream = classPathResource.getInputStream();
```
修改后可以正常运行了。