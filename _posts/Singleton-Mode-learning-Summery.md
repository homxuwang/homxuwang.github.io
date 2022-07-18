---
title: Singleton Mode learning Summery
date: 2019-08-19 20:21:34
tags: [设计模式]
---

单例模式可以说是最常见的设计模式之一。其实现方式有很多，在此做一些小结。

**推荐的实现方法一-静态构造函数**

最简单的实现方式，使用静态构造函数(饿汉式)：
```java
public class Singleton1{
  //在类加载的时候进行初始化
  private final static Singleton1 instance = new Singleton1();

  //构造器私有化
  private Singleton1(){}

  //提供公有的获取方法
  public static Singleton1 getInstance(){
    return instance;
  }

}
```

这种方式在类一开始被装载的时候进行初始化，使用final关键字进行修饰不用担心线程安全问题。但是缺点也很明显，就算不是用这个类它依然会占用内存空间。

**实现方法二-双重检查模式**

实现按需创建实例：
```java
public class Singleton2{
  
  // volatile声明作用即是内存变量共享的作用
  private static volatile Singleton2 instance;

  // 构造器私有化
  private Singleton2() {}

  public static Singleton2 getInstance() {
    if(instance == null) {
      sychronized (Singleton2.class){
        if(instance == null) {
          instance = new Singleton2();
        }
      }
    }

    return instance;
  }
}
```

>双重检查的写法其实是通过声明了 volatile和 **双重加锁**的方式实现了单例模式，有的人可能会问，为什么锁的内部还要再加一层判断，其实在考虑多线程同时进入了第一层 if判断中时，都在等待着锁的释放，但是释放之后其他线程已经进入了第一层，那么单例模式的结构就会被打乱了，其实锁也可以加在方法上，只不过锁的粒度问题，节省了一点内存。

如果只进行一次判断:
```java
 sychronized (Singleton2.class){
    if(instance == null) {
      instance = new Singleton2();
    }
  }
```
如果只进行一次同步判断操作，会导致效率很慢，因为在一个时刻只有一个线程能够获得同步锁，当地一个线程获取到锁时，第二个线程只能等待，第一个线程如果发现实例没有创建，它会进行创建实例的操作。接着第一个线程释放同步锁，第二个线程获取到锁，并且运行下面的代码，这时候看到实例已经被第一个线程创建出来了，那么第二个线程就能够获取到对应的单例。
每一次通过属性Instance获取单例时，都会视图加上一个同步锁，而加锁又是一个很耗时的操作，所以使用了**双重检查**的方法。

**实现方法三-静态内部类实现**

```java
public class Singleton3{
  //构造函数私有化
  private Singleton3() {}

  //静态内部类不会在一开始被装载，所以不会有方法一的内存消耗问题
  //JVM装载静态内部类是线程安全的 只有在使用内部类的时候才会去装载 所以线程是安全的
  private static class SingletonInstance{
    private static final Singleton3 singleton3 = new Singleton3();
  }

  //提供静态公有获取方法
  public static synchronized Singleton3 getInstance() {
    return SingletonInstance.singleton3;
  }
}
```

JVM装载内部类并不是程序启动就装载(静态内部类和非静态内部类一样，都是在被调用时才会被加载)，而且装载内部类是线程安全的，所以这个单例模式真正意义上实现了**懒加载**与**线程安全**且**节省了内存**.


关于**静态内部类**的一些补充：
* 外部类初次加载，会初始化静态变量、静态代码块、静态方法，但不会加载内部类和静态内部类。
* 实例化外部类，调用外部类的静态方法、静态变量，则外部类必须先进行加载，但只加载一次。
* 直接调用静态内部类时，外部类不会加载。
# 参考
https://mp.weixin.qq.com/s/OHVMyZJzKIjk3fA7FzDTvg
《剑指Offer》