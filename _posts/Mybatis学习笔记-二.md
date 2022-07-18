---
title: Mybatis学习笔记-二
date: 2018-11-21 19:56:31
tags: [学习笔记]
---
# parameterType(输入类型)

## 传递简单类型和传递pojo对象

简单类型：使用#{}占位符，或者${}进行sql拼接。

opjo对象：Mybatis使用ognl表达式解析对象字段的值，#{}或者${}括号中的值为pojo属性名称。

## 传递pojo包装对象
开发中通过可以使用pojo传递查询条件。
查询条件可能是综合的查询条件，不仅包括用户查询条件还包括其它的查询条件（比如查询用户信息的时候，将用户购买商品信息也作为查询条件），这时可以使用包装对象传递输入参数。

包装对象：Pojo类中的一个属性是另外一个pojo。

需求：根据用户名模糊查询用户信息，查询条件放到QueryVo的user属性中。

在`Mybatis学习笔记-一`的基础上，继续编写`QueryVo`类进行开发:

```java
package my.study.pojo;

public class QueryVo {
	//包含其他的pojo
	private User user;

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}
}
```

在`my.study.mapper`包下的`User.xml`中书写sql语句:
```xml
<!-- 使用包装类型查询用户 -->
	<select id="findUserByQueryVo" parameterType="my.study.pojo.QueryVo" resultType="my.study.pojo.User">
		select * from user where username like "%"#{user.username}"%"
	</select>
```

在`UserMapper.java`接口中添加方法:
```java
package my.study.mapper;

import java.util.List;

import my.study.pojo.QueryVo;
import my.study.pojo.User;

public interface UserMapper {
	public User findUserById(Integer id);
	//添加方法
	public List<User> findUserByQueryVo(QueryVo vo);
}
```
书写测试代码：
```java
	@Test
	public void testfindUserByQueryVo() throws Exception{
		//1.加载核心配置文件
		String resource = "sqlMapConfig.xml";
		InputStream in = Resources.getResourceAsStream(resource);
		//2.创建SqlSessionFactory
		SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(in);
		//3.创建SqlSession
		SqlSession sqlSession = sqlSessionFactory.openSession();
		//4.SqlSession根据接口生成一个实现类
		UserMapper mapper = sqlSession.getMapper(UserMapper.class);
		
		QueryVo vo =new QueryVo();
		User u = new User();
		u.setUsername("五");
		vo.setUser(u);
		List<User> us = mapper.findUserByQueryVo(vo);
		for(User user:us) {
			System.out.println(user);
		}		
	}
```
![结果](Mybatis学习笔记-二/1.png)

# resultType(输出类型)

## 输出简单类型
需求：查询user的数量

在`UserMapper.java`接口中添加方法:
```java
...
  //查询数据条数
	public Integer findUserCount();
...
```
Mapper.xml中添加查询语句:
```xml
<!-- 查询用户条数 -->
	<select id="findUserCount" resultType="Integer">
		select count(*) from user
	</select>
```

书写测试类：
```java
	//查询用户条数
	@Test
	public void testfindUserCount() throws Exception{
		//1.加载核心配置文件
		String resource = "sqlMapConfig.xml";
		InputStream in = Resources.getResourceAsStream(resource);
		//2.创建SqlSessionFactory
		SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(in);
		//3.创建SqlSession
		SqlSession sqlSession = sqlSessionFactory.openSession();
		//4.SqlSession根据接口生成一个实现类
		UserMapper mapper = sqlSession.getMapper(UserMapper.class);
		
		Integer count = mapper.findUserCount();
		System.out.println(count);
	}
```
![结果](Mybatis学习笔记-二/2.png)

## 输出pojo对象和对象列表
见 https://homxuwang.github.io/2018/11/19/Mybatis%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0-%E4%B8%80/

# resultMap
resultType可以指定将查询结果映射为pojo，但需要pojo的属性名和sql查询的列名一致方可映射成功。

如果sql查询字段名和pojo的属性名不一致，可以通过resultMap将字段名和属性名作一个对应关系 ，resultMap实质上还需要将查询结果映射到pojo对象中。

resultMap可以实现将查询结果映射为复杂类型的pojo，比如在查询结果映射对象中包括pojo和list实现一对一查询和一对多查询。

需求：查询订单表order的所有数据,订单表创建见:[Mybatis学习笔记-一](https://homxuwang.github.io/2018/11/19/Mybatis%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0-%E4%B8%80/)
sql：SELECT id, user_id, number, createtime, note FROM `order`

创建POJO类:
```java
package my.study.pojo;

import java.io.Serializable;
import java.util.Date;

public class Orders  implements Serializable{
   
	private static final long serialVersionUID = 1L;

	private Integer id;

  private Integer userId;

  private String number;

  private Date createtime;

  private String note;
  
  private User user;

  添加 get/set 方法

  @Override
  public String toString() {
    return "Orders [id=" + id + ", userId=" + userId + ", number=" + number + ", createtime=" + createtime
        + ", note=" + note + "]";
  }
}
```
可以看到类中`userId`字段和数据库表中的`user_id`字段名不一致
![user_id不同](Mybatis学习笔记-二/3.png)

在`my.study.mapper`包中添加`OrderMapper`接口:
```java
package my.study.mapper;

import java.util.List;

import my.study.pojo.Orders;
import my.study.pojo.User;

public interface OrderMapper {	
	//	查询订单表order的所有数据
	public List<Orders> selectOrdersList();	
}
```
定义`OrderMapper.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper
PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
"http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="my.study.mapper.OrderMapper">
	<!-- 查询所有的订单数据 -->
	<select id="selectOrdersList" resultType="my.study.pojo.Orders">
		SELECT id, user_id,
		number,
		createtime, note FROM orders
	</select>
</mapper>
```
记得在核心配置文件中引入`OrderMapper.xml`：
```xml
<mappers>
  <mapper resource="my/study/mapper/User.xml"/>
  <mapper resource="my/study/mapper/OrderMapper.xml"/>
</mappers>
```
书写测试类:
```java
//查询订单表的所有数据
	@Test
	public void testfindUserCount() throws Exception{
		//1.加载核心配置文件
		String resource = "sqlMapConfig.xml";
		InputStream in = Resources.getResourceAsStream(resource);
		//2.创建SqlSessionFactory
		SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(in);
		//3.创建SqlSession
		SqlSession sqlSession = sqlSessionFactory.openSession();
		//4.SqlSession根据接口生成一个实现类
		OrderMapper mapper =  sqlSession.getMapper(OrderMapper.class);
		
		List<Orders> orderlist = mapper.selectOrdersList();
		for(Orders order:orderlist) {
			System.out.println(order);
		}		
	}
```
![测试结果](Mybatis学习笔记-二/4.png)
可以看到，对于POJO类中和数据库表中字段不一致的，将会查询出null.
除了修改为一样的字段值外，可以使用`resultMap`:
![测试结果](Mybatis学习笔记-二/5.png)
其实，与数据库字段不一样的只有`user_id`和`userId`，没有必要都写出来，所以可以简写为:
```xml
<resultMap type="my.study.pojo.Orders" id="orders">		
  <result column="user_id" property="userId"/>
</resultMap>	
```
`column`对应数据库表字段;`property`对应POJO字段;`javaType`对应java类型(可以省略);`jdbcType`对应数据库中的类型(可以省略)

再次执行测试代码:
![测试结果](Mybatis学习笔记-二/6.png)

# 动态sql

通过mybatis提供的各种标签方法实现动态拼接sql
## if标签
需求：根据性别和名字查询用户
查询sql：
SELECT id, username, birthday, sex, address FROM `user` WHERE sex = 1 AND username LIKE '%张%'

在`UserMapper.java`接口中添加方法:
```java
...
//根据性别和名称查询用户
	public List<User> selectUserBySexAndUsername(User user);
...
```
在`User.xml`中书写sql语句:
```xml
<!-- 使用if和where标签 -->
	<select id="selectUserBySexAndUsername" parameterType="my.study.pojo.User" resultType="my.study.pojo.User">
		select * from user 
		where
		<if test="sex != null and sex != ''">
			sex = #{sex}
		</if>
		<if test="username != null and username != ''">
			and username = #{username}
		</if>
	</select>
```

书写测试类:
```java
//查询用户条数
	@Test
	public void testselectUserBySexAndUsername() throws Exception{
		//1.加载核心配置文件
		String resource = "sqlMapConfig.xml";
		InputStream in = Resources.getResourceAsStream(resource);
		//2.创建SqlSessionFactory
		SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(in);
		//3.创建SqlSession
		SqlSession sqlSession = sqlSessionFactory.openSession();
		//4.SqlSession根据接口生成一个实现类
		UserMapper mapper = sqlSession.getMapper(UserMapper.class);
		User u = new User();
		u.setSex("1");
		u.setUsername("张小明");
		List<User> users = mapper.selectUserBySexAndUsername(u);
		for(User user:users) {
			System.out.println(user);
		}
	}
```
查询结果：
![测试结果](Mybatis学习笔记-二/7.png)

因为通过user实例查询的sex和username字段都不为空，所以可以看到sql语句是正常的.

如果注释掉`u.setUsername("张小明");`再进行测试 :
![测试结果](Mybatis学习笔记-二/8.png)
可以看到查询出的是sex为1的所有数据，因为username=null，所以在if标签中没有添加后面的`and username = #{username}`

但是如果注释掉`u.setSex("1");`，将`u.setUsername("张小明");`还原，再次进行测试：
![测试结果](Mybatis学习笔记-二/9.png)
![测试结果](Mybatis学习笔记-二/10.png)
可以看到，查询错误，sql语句是拼接错误的.
这时候就需要用到`where`标签

## where标签

where标签可以自动添加where，同时处理sql语句中第一个`前`and关键字
对上面的查询语句做处理:
```xml
<select id="selectUserBySexAndUsername" parameterType="my.study.pojo.User" resultType="my.study.pojo.User">
	select * from user 
	<where>
		<if test="sex != null and sex != ''">
		sex = #{sex}
		</if>
		<if test="username != null and username != ''">
			and username = #{username}
		</if>
	</where>		
</select>
```
再次进行测试：
![测试结果](Mybatis学习笔记-二/11.png)
上面提到where标签可以处理sql语句中第一个`前`and关键字

## SQL片段
Sql中可将重复的sql提取出来，使用时用include引用即可，最终达到sql重用的目的。
先定义一个用于共用的sql片段,然后使用include进行引用:
```xml
<sql id="selectFromUser">
	select * from user
</sql>

<!--使用sql片段-->
<select id="selectUserBySexAndUsername" parameterType="my.study.pojo.User" resultType="my.study.pojo.User">
	<include refid="selectFromUser"></include>
	<where>
		<if test="sex != null and sex != ''">
		sex = #{sex}
		</if>
		<if test="username != null and username != ''">
			and username = #{username}
		</if>
	</where>		
</select>
```
## foreach标签
需求：根据多个id查询用户信息
在`UserMapper`接口中添加方法:
```java
	//根据多个id查询用户信息
	public List<User> selectUserByIds(QueryVo vo);
```
在`QueryVo`中改造：
```java
private List<Integer> idsList;
//添加get/set方法
```
书写sql：
```xml
<select id="selectUserByIds" parameterType="my.study.pojo.QueryVo" resultType="my.study.pojo.User">
	<include refid="selectFromUser"/>
	<where>
		id in
		<foreach collection="idsList" item="id" separator="," open="(" close=")">
			#{id}
		</foreach>
	</where>
</select>
```
collection：遍历的集合，这里是QueryVo的idsList属性
item：遍历的项目，可以随便写，但是和后面的#{}里面要一致
open：在前面添加的sql片段
close：在结尾处添加的sql片段
separator：指定遍历的元素之间使用的分隔符
`注意`:如果接口的方法参数处传递的是数组类型的参数，则需要将collection处值设置为`array`;同理，如果接口的方法参数处传递的是list类型的参数，则需要将collection处值设置为`list`
测试:
```java
//多个id
	@Test
	public void testselectUserByidsList() throws Exception{
		//1.加载核心配置文件
		String resource = "sqlMapConfig.xml";
		InputStream in = Resources.getResourceAsStream(resource);
		//2.创建SqlSessionFactory
		SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(in);
		//3.创建SqlSession
		SqlSession sqlSession = sqlSessionFactory.openSession();
		//4.SqlSession根据接口生成一个实现类
		UserMapper mapper = sqlSession.getMapper(UserMapper.class);
		List<Integer> ids = new ArrayList<>();
		ids.add(16);
		ids.add(22);
		ids.add(24);
		QueryVo vo = new QueryVo();
		vo.setIdsList(ids);
		List<User> users = mapper.selectUserByIds(vo);
		for(User user:users) {
			System.out.println(user);
		}
	}
```
测试结果:
![测试结果](Mybatis学习笔记-二/12.png)

# 关联查询
![测试结果](Mybatis学习笔记-二/13.png)
## 一对一关联查询

改造`UserMapper`,在接口中添加方法
```java
	//一对一关联 查询  以订单为中心 关联用户
	public List<Orders> selectOrders();
```

在`User.xml`中书写sql(需要用到嵌套映射):
```xml
<resultMap type="my.study.pojo.Orders" id="orderUserResultMap">
		<id column="id" property="id"/>
		<result column="user_id" property="userId"/>
		<result column="number" property="number"/>
		<result column="createtime" property="createtime"/>
		<result column="note"  property="note"/>
		<!-- association ：配置一对一属性 -->
		<!-- property:order里面的User属性名 -->
		<!-- javaType:属性类型 -->
		<association property="user" javaType="my.study.pojo.User">
			<!-- id:声明主键，表示user_id是关联查询对象的唯一标识-->
			<id column="user_id" property="id"/>
			<result column="username" property="username"/>
		</association>
	</resultMap>
	
	<select id="selectOrders" resultMap="orderUserResultMap">
		select 
		o.id,
		o.user_id,
		o.number,
		o.createtime,
		o.note,
		u.username 
		from orders o 
		LEFT JOIN user u 
		on o.user_id = u.id
	</select>
```
测试:
```java
//一对一
@Test
public void testselectOrders() throws Exception{
	//1.加载核心配置文件
	String resource = "sqlMapConfig.xml";
	InputStream in = Resources.getResourceAsStream(resource);
	//2.创建SqlSessionFactory
	SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(in);
	//3.创建SqlSession
	SqlSession sqlSession = sqlSessionFactory.openSession();
	//4.SqlSession根据接口生成一个实现类
	UserMapper mapper =  sqlSession.getMapper(UserMapper.class);
	
	List<Orders> orderlist = mapper.selectOrders();
	for(Orders order:orderlist) {
		System.out.println(order);
		System.out.println(order.getUser());
	}		
}
```

查询结果:
![测试结果](Mybatis学习笔记-二/15.png)
![测试结果](Mybatis学习笔记-二/14.png)


## 一对多关联查询
一个用户有可能对应多个订单，所以以user表作为左表进行查询，是一对多的关系。

![查询结果](Mybatis学习笔记-二/16.png)

在`User`类中添加订单列表属性字段,并添加get和set方法:
```java
...
private List<Orders> ordersList;
//get/set
...
```

`OrderMapper`接口中添加方法:
```java
	//一对多关联
	public List<User> selectUserList();
```
在`OrderMapper.xml`中书写sql代码:
```xml
<resultMap type="my.study.pojo.User" id="userResultMap">
		<id column="user_id" property="id"/>
		<result column="username" property="username"/>
		<!-- 配置一对多属性  
			ofType是指List中每个元素的类型
		-->
		<collection property="ordersList" ofType="my.study.pojo.Orders">
			<id column="id" property="id"/>
			<result column="user_id" property="userId"/>
			<result column="number" property="number"/>
			<result column="createtime" property="createtime"/>
			<result column="note" property="note"/>
		</collection>
	</resultMap>
	
	<select id="selectUserList" resultMap="userResultMap">
		select 
		o.id,
		o.user_id,
		o.number,
		o.createtime,
		o.note,
		u.username 
		from  user u 
		LEFT JOIN orders o
		on o.user_id = u.id
	</select>
```
测试代码：
```java
//一对多
@Test
public void testselectUserList() throws Exception{
	//1.加载核心配置文件
	String resource = "sqlMapConfig.xml";
	InputStream in = Resources.getResourceAsStream(resource);
	//2.创建SqlSessionFactory
	SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(in);
	//3.创建SqlSession
	SqlSession sqlSession = sqlSessionFactory.openSession();
	//4.SqlSession根据接口生成一个实现类
	OrderMapper mapper =  sqlSession.getMapper(OrderMapper.class);
	
	List<User> userlist = mapper.selectUserList();
	for(User user:userlist) {
		System.out.println(user);
		System.out.println(user.getOrdersList());
	}		
}
```
![测试结果](Mybatis学习笔记-二/17.png)