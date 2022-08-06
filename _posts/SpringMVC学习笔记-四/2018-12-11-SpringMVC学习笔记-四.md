---
title: SpringMVC学习笔记-四
date: 2018-12-11 16:57:44
tags: [学习笔记]
---
# json数据交互
导入处理json的依赖包：
![处理json依赖包](https://raw.githubusercontent.com/homxuwang/homxuwang.github.io/jekyll/images/SpringMVC学习笔记-四/1.png)

## @RequestBody
作用：
@RequestBody注解用于读取http请求的内容(字符串)，通过springmvc提供的HttpMessageConverter接口将读到的内容（json数据）转换为java对象并绑定到Controller方法的参数上。
@RequestBody注解实现接收http请求的json数据，将json数据转换为java对象进行绑定
## @ResponseBody
作用：
@ResponseBody注解用于将Controller的方法返回的对象，通过springmvc提供的HttpMessageConverter接口转换为指定格式的数据如：json,xml等，通过Response响应给客户端

本例子应用：
@ResponseBody注解实现将Controller方法返回java对象转换为json响应给客户端。
## 编写程序
前端代码:
```js
<script src="${pageContext.request.contextPath }/js/jquery-3.2.1.min.js"></script>
<script >
var jsonString = '{"id": 1,"name": "测试商品","price": 99.9,"detail": "测试商品描述","pic": "123456.jpg"}';
$(function(){
	$.ajax({
		url : "${pageContext.request.contextPath }/json.action",
		data : jsonString,
		contentType : 'application/json;charset=UTF-8',
		type : 'post',
		dataType : 'json',
		success : function(data){
			alert(data.name + " " + data.price);
		}
	});
})
</script>
```
后台Controller:
```java
//json
	@RequestMapping(value = "/json.action" )
	public @ResponseBody Items jsonAction(@RequestBody Items items) {
		return items;
	}
```
![后台接收到数据](https://raw.githubusercontent.com/homxuwang/homxuwang.github.io/jekyll/images/SpringMVC学习笔记-四/2.png)
![前台打印数据](https://raw.githubusercontent.com/homxuwang/homxuwang.github.io/jekyll/images/SpringMVC学习笔记-四/3.png)
## 配置json转换器
如果不使用注解驱动`<mvc:annotation-driven />`，就需要给处理器适配器配置json转换器，参考之前学习的自定义参数绑定。

在springmvc.xml配置文件中，给处理器适配器加入json转换器：
```xml
<!--处理器适配器 -->
	<bean class="org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter">
		<property name="messageConverters">
		<list>
		<bean class="org.springframework.http.converter.json.MappingJacksonHttpMessageConverter"></bean>
		</list>
		</property>
	</bean>
```

# 拦截器
## 定义
Spring Web MVC 的处理器拦截器类似于Servlet 开发中的过滤器Filter，用于对处理器进行预处理和后处理。
实现HandlerInterceptor接口，如下：
```java
public class HandlerInterceptor1 implements HandlerInterceptor {
	// controller执行后且视图返回后调用此方法
	// 这里可得到执行controller时的异常信息
	// 这里可记录操作日志
	@Override
	public void afterCompletion(HttpServletRequest arg0, HttpServletResponse arg1, Object arg2, Exception arg3)
			throws Exception {
		System.out.println("HandlerInterceptor1....afterCompletion");
	}

	// controller执行后但未返回视图前调用此方法
	// 这里可在返回用户前对模型数据进行加工处理，比如这里加入公用信息以便页面显示
	@Override
	public void postHandle(HttpServletRequest arg0, HttpServletResponse arg1, Object arg2, ModelAndView arg3)
			throws Exception {
		System.out.println("HandlerInterceptor1....postHandle");
	}

	// Controller执行前调用此方法
	// 返回true表示继续执行，返回false中止执行
	// 这里可以加入登录校验、权限拦截等
	@Override
	public boolean preHandle(HttpServletRequest arg0, HttpServletResponse arg1, Object arg2) throws Exception {
		System.out.println("HandlerInterceptor1....preHandle");
		// 设置为true，测试使用
		return true;
	}
}
```
上面定义的拦截器再复制一份HandlerInterceptor2，注意新的拦截器修改代码：
System.out.println("HandlerInterceptor2....preHandle");

## 拦截器配置
在`springmvc.xml`中配置拦截器；
```xml
<!-- 配置拦截器 -->
<mvc:interceptors>
	<mvc:interceptor>
		<!-- 所有的请求都进入拦截器 -->
		<mvc:mapping path="/**" />
		<!-- 配置具体的拦截器 -->
		<bean class="my.study.springmvc.Interceptor.HandlerInterceptor1" />
	</mvc:interceptor>
	<mvc:interceptor>
		<!-- 所有的请求都进入拦截器 -->
		<mvc:mapping path="/**" />
		<!-- 配置具体的拦截器 -->
		<bean class="my.study.springmvc.Interceptor.HandlerInterceptor2" />
	</mvc:interceptor>
</mvc:interceptors>
```
## 测试
### 正常运行流程
控制台打印：
HandlerInterceptor1....preHandle
HandlerInterceptor2....preHandle
HandlerInterceptor2....postCompletion
HandlerInterceptor1....postCompletion
HandlerInterceptor2....afterCompletion
HandlerInterceptor1....afterCompletion
### 中断流程测试
HandlerInterceptor1的preHandler方法返回false，HandlerInterceptor2返回true，运行流程如下：

HandlerInterceptor1..preHandle..

从日志看出第一个拦截器的preHandler方法返回false后第一个拦截器只执行了preHandler方法，其它两个方法没有执行，第二个拦截器的所有方法不执行，且Controller也不执行了。


HandlerInterceptor1的preHandler方法返回true，HandlerInterceptor2返回false，运行流程如下：

HandlerInterceptor1..preHandle..
HandlerInterceptor2..preHandle..
HandlerInterceptor1..afterCompletion..

从日志看出第二个拦截器的preHandler方法返回false后第一个拦截器的postHandler没有执行，第二个拦截器的postHandler和afterCompletion没有执行，且controller也不执行了。

总结：
preHandle按拦截器定义顺序调用
postHandler按拦截器定义逆序调用
afterCompletion按拦截器定义逆序调用

postHandler在拦截器链内所有拦截器返成功调用
afterCompletion只有preHandle返回true才调用

## 拦截器应用
### 处理流程
1、有一个登录页面，需要写一个Controller访问登录页面
2、登录页面有一提交表单的动作。需要在Controller中处理。
	a)判断用户名密码是否正确（在控制台打印）
	b)如果正确,向session中写入用户信息（写入用户名username）
	c)跳转到商品列表
3、拦截器。
	a)拦截用户请求，判断用户是否登录（登录请求不能拦截）
	b)如果用户已经登录。放行
	c)如果用户未登录，跳转到登录页面。

### 编写jsp
见附录

### 用户登陆Controller
```java
package my.study.springmvc.controller;


import javax.servlet.http.HttpSession;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping(value = "/user")
public class UserController {

	/**
	 * 跳转到登录页面
	 * 
	 * @return
	 */
	@RequestMapping("toLogin")
	public String toLogin() {
		return "login";
	}
	/**
	 * 用户登录
	 * 
	 * @param username
	 * @param password
	 * @param session
	 * @return
	 */
	@RequestMapping("login")
	public String login(String username, String password, HttpSession session) {
		// 校验用户登录
		System.out.println(username);
		System.out.println(password);

		// 把用户名放到session中
		session.setAttribute("username", username);

		return "redirect:/item/itemList.action";
	}
}
```
### 编写拦截器
```java
package my.study.springmvc.Interceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

public class LoginHandlerInterceptor implements HandlerInterceptor {

  //...省略部分代码

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object arg2) throws Exception {
		// 从request中获取session
		HttpSession session = request.getSession();
		// 从session中获取username
		Object username = session.getAttribute("username");
		// 判断username是否为null
		if (username != null) {
			// 如果不为空则放行
			return true;
		} else {
			// 如果为空则跳转到登录页面
			response.sendRedirect(request.getContextPath() + "/user/toLogin.action");
		}

		return false;
	}
}
```
### 配置拦截器

```xml
<mvc:interceptor>
<!-- 用户登录配置 -->
	<mvc:mapping path="/item/**" />
	<!-- 配置具体的拦截器 -->
	<bean class="my.study.springmvc.Interceptor.LoginHandlerInterceptor" />
</mvc:interceptor>
```
未登录状态下访问`/item/**`下的请求都会跳转到登录页面
![跳转页面](https://raw.githubusercontent.com/homxuwang/homxuwang.github.io/jekyll/images/SpringMVC学习笔记-四/4.png)

# 附录

## longin.jsp
```jsp
<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Insert title here</title>
</head>
<body>

<form action="${pageContext.request.contextPath }/user/login.action">
<label>用户名：</label>
<br>
<input type="text" name="username">
<br>
<label>密码：</label>
<br>
<input type="password" name="password">
<br>
<input type="submit">

</form>

</body>
</html>
```