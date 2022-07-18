---
title: Spring学习笔记-二
date: 2018-11-10 09:13:56
tags: [JavaWeb,Spring,学习笔记]
---

# 使用注解配置Spring

## 导入新的命名空间和依赖包
导入方法参见`Spring学习笔记-一`，与导入`beans`命名空间类似。先导入`spring-context-4.2.xsd`，然后进行配置,还要在`xml`的`Dsign`视图下进行配置，在`Prefix`中填写`context`.
同时需要导入依赖包`spring-aop-4.2.4.RELEASE.jar`.
## 使用注解代理配置文件
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.springframework.org/schema/beans" xmlns:context="http://www.springframework.org/schema/context" xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.2.xsd http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-4.2.xsd ">
	<!-- 扫描指定包名及其子包下的所有注解 -->
	<context:component-scan base-package="my.study.bean2"></context:component-scan>
</beans>
```
## 在类中使用注解进行配置

```java
package my.study.bean2;

import org.springframework.stereotype.Component;

@Component("user")
public class User {	
	private String name;
	private Integer age;
	private Car car;
  public User(){
  System.out.println("User 的空参构造方法被调用");
  }
	public Car getCar() {
		return car;
	}
	public void setCar(Car car) {
		this.car = car;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public Integer getAge() {
		return age;
	}
	public void setAge(Integer age) {
		this.age = age;
	}
	@Override
	public String toString() {
		return "User [name=" + name + ", age=" + age + ", car=" + car + "]";
	}	
}
```
注解`@Component("user")`相当于在配置文件中添加了`<bean name="user" class="my.study.bean2.User"></bean>`
书写测试类，可以打印出：
```java
User 的空参构造方法被调用
```

除了`@Component`注解，还有`@Serviece`,`@Controller`,`@Repository`注解，它们和`@Component`没有什么区别，只是为了区分注解的对象是在哪一层，便于解读。
`@Serviece`---Service层
`@Controller`---Web层
`@Repository`---DAO层

## 其他注解关键字
`@Scope(scopeName="singleton|prototype")`---与`<bean>`中的`scope`关键字一样，默认为`singleton`.

`@Value()`---值类型注入
 1.---放在属性前面，里面填写要注入的值，表示要注入的属性的值
例如:
```java
@Component("user")
@Scope(scopeName="prototype")
public class User {	
	@Value("test1")
	private String name;
	@Value("11")
	private Integer age;
	private Car car;	
  .....
}
```
就等于
```
<bean name="User" class="my.study.bean2.User" scope="prototype">
  <property name="name" value="test1"></property>
  <property name="age" value="11"></property>
</bean>
```
可以看打印结果：
```java
User 的空参构造方法被调用
User [name=test1, age=11, car=null]
```
这种方式是通过反射的Field对属性赋值,破坏了封装性

 2.---放在`set`方法前面，里面填写要注入的值，表示要注入的属性的值
如：
```java
@Component("user")
@Scope(scopeName="prototype")
public class User {	
  ...
  @Value("test1")
    public void setName(String name) {
      this.name = name;
    }
  ...
  @Value(value="11")
	public void setAge(Integer age) {
		this.age = age;
	}
  ...
}
```
这种方式通过set方法赋值,没有破坏封装性.

`@Autowired`---自动装配引用类型注入

先将要注入的对象注册到容器中，可以在这个对象中先注入各种类型，然后使用`@Autowired`注入到当前类。
缺点：如果是匹配到多个类型一致的对象，无法选择注入哪一个

`@Qualifier()`---指定要注入的对象的名称(即`name=""`)

`@Resource(name="")`---手动注入，指定注入哪个名称的对象

`@PostContruct`---在初始化方法前添加此注解,对象被创建后调用,类似于`init-method`

`@PreDestory`---在销毁前调用,相当于`destory-method`

# Spring中的AOP

## 手动实现AOP
简要概括AOP思想就是`面向切面编程,横向重复,纵向抽取`.

首先Spring能够为容器中管理的对象生成动态代理对象。以前要使用`Proxy.newProxyInstance(xx,xx,xx)`生成代理对象.而现在Spring只需通过配置就可以生成代理对象。通过这个功能，就可以使用AOP思想进行开发。

Srping实现AOP的原理：
1.`动态代理`---但是，被代理对象必须要实现接口，才能产生代理对象.没有接口不能实现动态代理.如果有接口，优先使用动态代理

2.`cglib代理`---cglib代理属于第三方代理技术.可以对任何类生成代理.代理的原理是对目标对象进行继承代理. 如果目标对象被final修饰.那么该类无法被cglib代理.如果没有接口，实现此代理

手动实现AOP:
1.创建一个`UserService`接口，定义`UserServiceImpl`类要实现这个接口的方法.创建UserService代理工厂`UserServiceProxyFactory`,提供一个工厂方法，返回`UserService`对象.在方法中生成代理并返回UserService对象.

现在需要在调用`UserServiceImpl`的每一个方法(`save`,`delete`,`update`,`find`)之前都进行一个操作(比如打开事务),之后都进行另一个操作(比如提交事务).
```java
package my.study.service;

public interface UserService {
	void save();
	void delete();
	void update();
	void find();
}
```
```java
package my.study.service;

public class UserServiceImpl implements UserService {
	@Override
	public void save() {
		System.out.println("保存用户!");
	}
	@Override
	public void delete() {
		System.out.println("删除用户!");
	}
	@Override
	public void update() {
		System.out.println("更新用户!");
	}
	@Override
	public void find() {
		System.out.println("查找用户!");
	}
}
```

```java
package my.study.proxy;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

import cn.itcast.service.UserService;
import cn.itcast.service.UserServiceImpl;
public class UserServiceProxyFactory  implements InvocationHandler{
  //定义构造方法，必须传入当前代理对象的实例
  public UserServiceProxyFactory(UserService us) {
      super();
      this.us = us;
  }
  //定义传入当前代理对象的实例
	private UserService us;
  //返回代理对象
  // 编写工具方法：生成动态代理
  public UserService getUserServiceProxy(){
  //第一个参数传入类加载器,第二个参数传入被代理对象所实现的接口,第三个参数要说明这次代理要怎么增强，即增强的内容，要传入一个InvocationHandler
  UserService usProxy = (UserService) Proxy.newProxyInstance(UserServiceProxyFactory.class.getClassLoader(),
                UserServiceImpl.class.getInterfaces(), 
                this);
  //返回
  return usProxy;
	}
  //实现接口
  @Override
  //第一个参数是当前代理对象的实例,第二个参数是当前调用的方法,第三个参数是当前方法执行时的参数
	public Object invoke(Object arg0, Method method, Object[] arg2) throws Throwable {
    //业务方法执行前需要进行的操作，这里是打开事务
		System.out.println("打开事务!");
    //传入当前代理对象的实例us作为运行所在类
    //业务方法的执行
		Object invoke = method.invoke(us, arg2);
    //业务方法执行后要执行的操作，这里是提交事务
		System.out.println("提交事务!");
		return invoke;
	}
}
```

书写测试代码：
```java
...
@Test
	//动态代理
	public void test1(){
    //创建被代理对象
		UserService us = new UserServiceImpl();
		//创建Factory,传入被代理对象
		UserServiceProxyFactory factory = new UserServiceProxyFactory(us);
		//调用getUserServiceProxy()方法，返回代理对象
		UserService usProxy = factory.getUserServiceProxy();
		//调用代理对象的增加方法
		usProxy.save();
		
		//代理对象与被代理对象实现了相同的接口
		//代理对象 与 被代理对象没有继承关系
		System.out.println(usProxy instanceof UserServiceImpl );//false
	}
```

打印结果:
```
打开事务！
保存用户！
提交事务！
false
```

2.使用cglib方式实现AOP

```java
package my.study.proxy;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

import org.springframework.cglib.proxy.Callback;
import org.springframework.cglib.proxy.Enhancer;
import org.springframework.cglib.proxy.MethodInterceptor;
import org.springframework.cglib.proxy.MethodProxy;

import cn.itcast.service.UserService;
import cn.itcast.service.UserServiceImpl;

//cglib代理
public class UserServiceProxyFactory2 implements MethodInterceptor {

	public UserService getUserServiceProxy(){
		// 创建 Cglib 的核心类:
		Enhancer en = new Enhancer();//帮我们生成代理对象
		// 设置父类:
		en.setSuperclass(UserServiceImpl.class);//设置对谁进行代理
		// 设置父类:
		en.setCallback(this);//代理要做什么
		// 生成代理：
		UserService us = (UserService) en.create();//创建代理对象
		
		return us;
	}

	@Override
	public Object intercept(Object prxoyobj, Method method, Object[] arg, MethodProxy methodProxy) throws Throwable {
		//打开事务
		System.out.println("打开事务!");
		//调用原有方法
		Object returnValue = methodProxy.invokeSuper(prxoyobj, arg);
		//提交事务
		System.out.println("提交事务!");
		
		return returnValue;
	}
}
```


书写测试代码：
```java
...
@Test
public void test2(){
  
  UserServiceProxyFactory2 factory = new UserServiceProxyFactory2();
  
  UserService usProxy = factory.getUserServiceProxy();
  
  usProxy.save();
  
  //判断代理对象是否属于被代理对象类型
  //代理对象继承了被代理对象=>true
  System.out.println(usProxy instanceof UserServiceImpl );//true
}
...
```

打印结果:
```java
打开事务！
保存用户！
提交事务！
true
```

## AOP相关术语

`Joinpoint`(连接点):所谓连接点是指那些被拦截到的点。在 spring 中,这些点指的是方法,因为 spring 只支持方法类型的连接点.即目标对象中，所有可以增强的方法。

`Pointcut`(切入点):所谓切入点是指我们要对哪些 Joinpoint 进行拦截的定义.即目标对象，已经增强的方法(已经增强了的连接点)。

`Advice`(通知/增强):所谓通知是指拦截到 Joinpoint 之后所要做的事情就是通知.通知分为前置通知,后置通知,异常通知,最终通知,环绕通知(切面要完成的功能)。即增强的代码,也就是上面的例子中的`System.out.println("打开事务!");`和`System.out.println("提交事务!");`

`Introduction`(引介):引介是一种特殊的通知在不修改类代码的前提下, Introduction 可以在运行期为类动态地添加一些方法或 Field.

`Target`(目标对象):代理的目标对象.即被代理对象

`Weaving`(织入):是指把增强应用到目标对象来创建新的代理对象的过程.spring 采用动态代理织入，而 AspectJ 采用编译期织入和类装在期织入.指的是将通知应用到连接点，形成切入点的过程(成形代理过程).

`Proxy`（代理）:一个类被 AOP 织入增强后，就产生一个结果代理类.(将通知织入到目标对象后，形成代理对象)

`Aspect`(切面): 是切入点和通知（引介）的结合,即切入点+通知

## Spring中AOP的使用(xml配置)
Spring中封装了动态代理的代码，所以不需要自己手写动态代理代码来实现AOP了。

需要第三方依赖包`com.springsource.org.aopalliance-1.0.0.jar`、`com.springsource.org.aspectj.weaver-1.6.8.RELEASE.jar`(具体版本可自己选择其他的)

### 准备目标对象

使用上一节中的`UserServiceImpl`类.

### 准备通知
通知类
```java
package my.study.e_springaop;

import org.aspectj.lang.ProceedingJoinPoint;

public class MyAdvice {	
	//前置通知  目标方法运行之前调用
	public void before() {
		System.out.println("前置通知");
	}
	//后置通知(如果出现异常不调用) 目标方法运行之后调用
	public void afterNoExc() {
		System.out.println("后置通知(如果出现异常不调用)");
	}
	//环绕通知 目标方法之前和之后都调用
	public Object around(ProceedingJoinPoint pjp) throws Throwable {
		System.out.println("环绕通知,前置部分");
		Object proceed = pjp.proceed();
		System.out.println("环绕通知,后置部分");
		return proceed;
	}
	//异常拦截通知  如果出现异常则调用
	public void exc() {
		System.out.println("异常拦截通知");
	}
	//后置通知(无论是否出现异常都会调用)
	public void afterWithExc() {
		System.out.println("后置通知(无论是否出现异常都会调用)");
	}
}
```
### 配置进行织入,将通知织入目标对象中

首先导入aop的xml约束（命名空间），方法和之前的类似。

在`my.study.e_springaop`包内书写配置文件:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:p="http://www.springframework.org/schema/p" xmlns="http://www.springframework.org/schema/beans" xmlns:aop="http://www.springframework.org/schema/aop" xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.2.xsd http://www.springframework.org/schema/aop http://www.springframework.org/schema/aop/spring-aop-4.2.xsd ">

<!-- 配置目标对象 -->
	<bean name="userServiceTarget" class="my.study.service.UserServiceImpl"></bean>
<!-- 配置通知对象 -->
	<bean name="myAdvice" class="my.study.e_springaop.MyAdvice"></bean>
<!-- 配置将通知织入目标对象 -->
	<aop:config>
		<!-- 配置切入点 -->
		<!-- id可以自定义
			 expression="execute()"为固定格式，传参为：
			 	public void my.study.service.UserServiceImpl.save()
			 	默认为public:
			 	void my.study.service.UserServiceImpl.save()
			 	返回值为任意的函数:
			 	* my.study.service.UserServiceImpl.save()
			 	UserServiceImpl类下的所有方法:
			 	* my.study.service.UserServiceImpl.*()
			 	
			 	参数为任意:
			 	* my.study.service.*ServiceImpl.*(..)
			 	my.study.service包下及其子包下的所有以ServiceImpl为结尾的类的所有方法:
			 	* my.study.service..*ServiceImpl.*()
		 -->
		<aop:pointcut expression="execution(* my.study.service.*ServiceImpl.*(..))" id="demo"/>
		<aop:aspect ref="myAdvice">
			<!-- 指定myAdvice中的before方法切入到demo这个切入点中 -->
			<aop:before method="before" pointcut-ref="demo"/>
			<!-- 其他几个类似 -->
			<aop:after-returning method="afterNoexc" pointcut-ref="demo"/>
			<aop:around method="around" pointcut-ref="demo"/>
			<aop:after-throwing method="exc" pointcut-ref="demo"/>
			<aop:after method="afterWithExc" pointcut-ref="demo" />
		</aop:aspect>
	</aop:config>
</beans>
```
书写测试类:
使用了spring与junit整合测试:
```java
package my.study.e_springaop;

import javax.annotation.Resource;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import my.study.service.UserService;
//创建容器
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("classpath:my/study/e_springaop/applicationContext.xml")
public class Demo {
	@Resource(name="userServiceTarget")
	private UserService us;
	
	@Test
	public void test1(){
		us.save();
	}
}
```
打印结果:
```
前置通知
环绕通知,前置部分
保存用户!
后置通知(无论是否出现异常都会调用)
环绕通知,后置部分
后置通知(如果出现异常不调用)
```

## Spring中AOP的使用(注解配置)

注解配置的步骤和使用xml配置的步骤类似，只是在配置文件中不需要使用`<aop:config />`标签进行配置，而是在配置文件中开启注解，继续接下来的配置。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:p="http://www.springframework.org/schema/p" xmlns="http://www.springframework.org/schema/beans" xmlns:aop="http://www.springframework.org/schema/aop" xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.2.xsd http://www.springframework.org/schema/aop http://www.springframework.org/schema/aop/spring-aop-4.2.xsd ">

<!-- 配置目标对象 -->
	<bean name="userServiceTarget" class="my.study.service.UserServiceImpl"></bean>
<!-- 配置通知对象 -->
	<bean name="myAdvice" class="my.study.f_springannotionaop.MyAdvice"></bean>
<!-- 开启使用注解完成织入 -->
	<aop:aspectj-autoproxy></aop:aspectj-autoproxy>
</beans>
```

在`my.study.f_springannotionaop`包下的`MyAdvice`类中，添加注解：
```java
package my.study.f_springannotionaop;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.After;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;

@Aspect
public class MyAdvice {
	
	@Pointcut("execution(* my.study.service.*ServiceImpl.*(..))")
	public void cut() {}
	
	//前置通知  目标方法运行之前调用
	@Before("MyAdvice.cut()")
	public void before() {
		System.out.println("前置通知");
	}
	//后置通知(如果出现异常不调用) 目标方法运行之后调用
	@AfterReturning("execution(* my.study.service.*ServiceImpl.*(..))")
	public void afterNoExc() {
		System.out.println("后置通知(如果出现异常不调用)");
	}
	//环绕通知 目标方法之前和之后都调用
	@Around("execution(* my.study.service.*ServiceImpl.*(..))")
	public Object around(ProceedingJoinPoint pjp) throws Throwable {
		System.out.println("环绕通知,前置部分");
		Object proceed = pjp.proceed();
		System.out.println("环绕通知,后置部分");
		return proceed;
	}
	//异常拦截通知  如果出现异常则调用
	@AfterThrowing("execution(* my.study.service.*ServiceImpl.*(..))")
	public void exc() {
		System.out.println("异常拦截通知");
	}
	//后置通知(无论是否出现异常都会调用)
	@After("execution(* my.study.service.*ServiceImpl.*(..))")
	public void afterWithExc() {
		System.out.println("后置通知(无论是否出现异常都会调用)");
	}
}
```

`@Aspect`表示该类是一个通知类
`@Before("execution(* my.study.service.*ServiceImpl.*(..))")`表示该通知是一个前置通知，参数为`execution(* my.study.service.*ServiceImpl.*(..))")`进行指定切入点.
`@AfterReturning("execution(* my.study.service.*ServiceImpl.*(..))")`表示该通知是一个后置通知.
`@Around("execution(* my.study.service.*ServiceImpl.*(..))")`表示该通知是一个环绕通知
`@AfterThrowing("execution(* my.study.service.*ServiceImpl.*(..))")`表示该通知是一个异常拦截通知
`@After("execution(* my.study.service.*ServiceImpl.*(..))")`表示该通知是一个后置通知
```java
@Pointcut("execution(* my.study.service.*ServiceImpl.*(..))")
	public void cut() {}

	@Before("MyAdvice.cut()")
	public void before() {
		System.out.println("前置通知");
	}
```
其中	`@Before("MyAdvice.cut()")`就等于`@Before("execution(* my.study.service.*ServiceImpl.*(..))")`，这样方便管理切入点

书写测试类，并打印结果:
```
环绕通知,前置部分
前置通知
保存用户!
环绕通知,后置部分
后置通知(无论是否出现异常都会调用)
后置通知(如果出现异常不调用)
```