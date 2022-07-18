---
title: '@Import中使用ImportBeanDefinitionRegistrar的原理'
date: 2019-07-02 11:04:56
tags: [Spring]
---

使用@Import注解向容器中注入组件时,可以传入Configuration,ImportSelector, ImportBeanDefinitionRegistrar.
```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Import {

	/**
	 * {@link Configuration}, {@link ImportSelector}, {@link ImportBeanDefinitionRegistrar}
	 * or regular component classes to import.
	 */
	Class<?>[] value();

}
```
今天就讨论`ImportBeanDefinitionRegistrar`

看其源码:

```java
public interface ImportBeanDefinitionRegistrar {

	/**
	 * Register bean definitions as necessary based on the given annotation metadata of
	 * the importing {@code @Configuration} class.
	 * <p>Note that {@link BeanDefinitionRegistryPostProcessor} types may <em>not</em> be
	 * registered here, due to lifecycle constraints related to {@code @Configuration}
	 * class processing.
	 * @param importingClassMetadata annotation metadata of the importing class
	 * @param registry current bean definition registry
	 */
	public void registerBeanDefinitions(
			AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry);

}
```

其方法`registerBeanDefinitions`有两个传参:
* `AnnotationMetadata`是当前类的一些注解信息
* `BeanDefinitionRegistry`为bean定义的注册类，所有bean的定义都在这里进行注册。所以可以通过它来给容器中注册bean组件。

```java
public interface BeanDefinitionRegistry extends AliasRegistry {

	/**
	 * Register a new bean definition with this registry.
	 * Must support RootBeanDefinition and ChildBeanDefinition.
	 * @param beanName the name of the bean instance to register
	 * @param beanDefinition definition of the bean instance to register
	 * @throws BeanDefinitionStoreException if the BeanDefinition is invalid
	 * or if there is already a BeanDefinition for the specified bean name
	 * (and we are not allowed to override it)
	 * @see RootBeanDefinition
	 * @see ChildBeanDefinition
	 */

   // 关键 -> 往注册表中注册一个新的 BeanDefinition 实例 
	void registerBeanDefinition(String beanName, BeanDefinition beanDefinition)
			throws BeanDefinitionStoreException;

	/**
	 * Remove the BeanDefinition for the given name.
	 * @param beanName the name of the bean instance to register
	 * @throws NoSuchBeanDefinitionException if there is no such bean definition
	 */
   // 移除注册表中已注册的 BeanDefinition 实例
	void removeBeanDefinition(String beanName) throws NoSuchBeanDefinitionException;

	/**
	 * Return the BeanDefinition for the given bean name.
	 * @param beanName name of the bean to find a definition for
	 * @return the BeanDefinition for the given name (never {@code null})
	 * @throws NoSuchBeanDefinitionException if there is no such bean definition
	 */
   // 从注册中取得指定的 BeanDefinition 实例
	BeanDefinition getBeanDefinition(String beanName) throws NoSuchBeanDefinitionException;

	/**
	 * Check if this registry contains a bean definition with the given name.
	 * @param beanName the name of the bean to look for
	 * @return if this registry contains a bean definition with the given name
	 */
   // 判断 BeanDefinition 实例是否在注册表中（是否注册）
	boolean containsBeanDefinition(String beanName);

	/**
	 * Return the names of all beans defined in this registry.
	 * @return the names of all beans defined in this registry,
	 * or an empty array if none defined
	 */
   // 取得注册表中所有 BeanDefinition 实例的 beanName（标识）
	String[] getBeanDefinitionNames();

	/**
	 * Return the number of beans defined in the registry.
	 * @return the number of beans defined in the registry
	 */
   // 返回注册表中 BeanDefinition 实例的数量
	int getBeanDefinitionCount();

	/**
	 * Determine whether the given bean name is already in use within this registry,
	 * i.e. whether there is a local bean or alias registered under this name.
	 * @param beanName the name to check
	 * @return whether the given bean name is already in use
	 */
    // beanName（标识）是否被占用
	boolean isBeanNameInUse(String beanName);

}
```

BeanDefinitionRegistry 继承了 AliasRegistry 接口，其核心子类有三个：SimpleBeanDefinitionRegistry、DefaultListableBeanFactory、GenericApplicationContext。
![BeanDefinition](Import中使用ImportBeanDefinitionRegistrar的原理/3.png)

其`registerBeanDefinition(String beanName, BeanDefinition beanDefinition)`方法中的BeanDefinition参数(是一个接口)，有多个实现类:
![BeanDefinition](Import中使用ImportBeanDefinitionRegistrar的原理/1.png)

以`RootBeanDefinition`为例,注册一个bean时可以:
```java
//..省略部分代码

//新建一个BeanDefinition,其类型为RainBow.class
 RootBeanDefinition rainBowRootBeanDefinition = new RootBeanDefinition(RainBow.class);
//使用registerBeanDefinition方法将上面的bean注册到容器中
registry.registerBeanDefinition("rainBow",rainBowRootBeanDefinition);

```

Spring中还有很多地方用到了registerBeanDefinition，这里仅做简单的介绍。