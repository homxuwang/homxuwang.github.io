---
title: Spring常用注解
date: 2019-07-01 09:45:45
tags: [Spring]
---
# 组件注册

## @Configuration

@Configuration 放在对应类的上面,告诉spring这是一个配置类。

配置类 == 配置文件

## @ComponentScan

@ComponentScan 按照一定规则自动扫描指定包中的组件，加入到IOC容器中。
几个常用的值：

### value

@ComponentScan(value = "com.study")  设置要扫描的包路径

### excludeFilters

excludeFilters : Filter[] excludeFilters() default {}; 

其核心是设置Filter数组，即过滤规则数组，所以在介绍`excludeFilters`之前，要介绍`@ComponentScan.Filter`：

#### @ComponentScan.Filter

指定扫描时按照什么规则排除组件,是一个Filter数组，其中Filter数组中可以设置排除规则type:

* FilterType.ANNOTATION : 按照注解进行过滤
* FilterType.ASSIGNABLE_TYPE: 按照指定类型进行过滤
* FilterType.ASPECTJ : ASPECTJ表达式(基本不用
* FilterType.REGEX : 使用正则表达式
* FilterType.CUSTOM : 使用自定义规则

如：

按照注解进行过滤，排除用`@Service`进行注解的类：
```java
@ComponentScan(
   value = "com.study",
   excludeFilters = {
      @ComponentScan.Filter(type = FilterType.ANNOTATION , value = {Service.class})
    }
)
```

按照指定类进行过滤,如排除`BookService`类：
```java
@ComponentScan(
   value = "com.study",
   excludeFilters = {
      @ComponentScan.Filter(type = FilterType.ANNOTATION , value = {Service.class})
    }
)
```

按照自定义规则进行过滤,这时候要自己定义过滤规则(一个继承了`org.springframework.core.type.filter.TypeFilter`接口的类):
```java
@ComponentScan(
   value = "com.study",
   excludeFilters = {
       @ComponentScan.Filter(type = FilterType.CUSTOM,classes = {MyTypeFilter.class})
    }
)
```
如`MyTypeFilter.java`,可以获取到类名中含有`er`的类:
```java
package com.study.config;

import org.springframework.core.io.Resource;
import org.springframework.core.type.AnnotationMetadata;
import org.springframework.core.type.ClassMetadata;
import org.springframework.core.type.classreading.MetadataReader;
import org.springframework.core.type.classreading.MetadataReaderFactory;
import org.springframework.core.type.filter.TypeFilter;

import java.io.IOException;

public class MyTypeFilter implements TypeFilter {

    /**
     *
     * @param metadataReader 读取到的当前正在扫描的类的信息
     * @param metadataReaderFactory 可以获取到其他任何类的信息
     * @return
     * @throws IOException
     */
    public boolean match(MetadataReader metadataReader, MetadataReaderFactory metadataReaderFactory) throws IOException {
        //获取当前正在扫描的类注解的信息
        AnnotationMetadata annotationMetadata = metadataReader.getAnnotationMetadata();
        //获取当前正在扫描的类的信息
        ClassMetadata classMetadata = metadataReader.getClassMetadata();
        //获取当前类的路径信息(如：类的路径)
        Resource resource = metadataReader.getResource();

            //比如获取类名
        String className = classMetadata.getClassName();
        System.out.println("---->" +className);
        if (className.contains("er")){
            return true;
        }
        return false;
    }
}
```

### includeFilters

includeFilters的使用方法和excludeFilters相似,指定扫描时按照什么规则加载组件。只不过要将`useDefaultFilters`设置为`false`(默认为true)。这和用配置文件配置也相似,在xml中设置use-default-filters为false:
```xml
<context:component-scan base-package="com.study" use-default-filters="false"></context:component-scan>
```

includeFilters的设置方法如下,
```java
@ComponentScan(
                value = "com.study",
//                excludeFilters = {
//                    @ComponentScan.Filter(type = FilterType.ANNOTATION , value = {Service.class})
//                },
                includeFilters = {
//                        @ComponentScan.Filter(type = FilterType.ANNOTATION,classes = {Controller.class}),
//                        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE,classes = {BookService.class},
                        @ComponentScan.Filter(type = FilterType.CUSTOM,classes = {MyTypeFilter.class})
                },
                useDefaultFilters = false
)
```

## @ComponentScans

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Documented
public @interface ComponentScans {

	ComponentScan[] value();

}
```
看其源码可以知道，它的value是一个ComponentScan数组，即我们可以配置多个ComponentScan。

它的写法如下:
```java
@ComponentScans(value = {
        @ComponentScan(
                value = "com.study",
               excludeFilters = {
                   @ComponentScan.Filter(type = FilterType.ANNOTATION , value = {Service.class})
               },
        ),
        @ComponentScan(
                value = "com.study",
                includeFilters = {
                        @ComponentScan.Filter(type = FilterType.CUSTOM,classes = {MyTypeFilter.class})
                },
                useDefaultFilters = false
        )
})
```

## @Scope

@Scope注解和在配置文件中配置scope属性类似，即设置是单实例还是多实例。

可取值:
 * ConfigurableBeanFactory#SCOPE_PROTOTYPE    prototype ---- 多实例的  多实例情况下，ioc容器启动时不会调用方法去创建对象，而是在获取时才会调用方法创建对象
 * ConfigurableBeanFactory#SCOPE_SINGLETON    singleton ---- 单实例的  单实例情况下，ioc容器启动时即调用方法创建对象放到容器中，以后获取就从Ioc容器中拿就可以了
 * org.springframework.web.context.WebApplicationContext#SCOPE_REQUEST    request ---- 同一个请求创建一个实例
  * org.springframework.web.context.WebApplicationContext#SCOPE_SESSION    session ---- 同一个session创建一个实例

最后两个并不常用，所以了解即可。

使用方法，如在要注入的类上面写上对应的值即可:
```java
 @Bean("person02")
 @Scope("prototype") //多实例的
  public Person person(){
      System.out.println("创建了person02 Bean");
      return new Person("李四",22);
  }
```

## @Lazy

懒加载，一般对@Scope("singleton") 的组件使用。
一般情况下，使用@Scope("singleton")标注的组件，在容器加载前就已经创建好了实例，但是使用@Lazy注解标注的话，在第一次使用该组件时才创建组件到IOC容器中。

## @Conditional

@Conditional - 按照条件注册bean，since 4.0 ，4.0版本才引入的这个注解

从其源码
```java
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Conditional {
	Class<? extends Condition>[] value();
 }
```

可以看出，它可以标注在类上面，也可以标注在方法上面.并且其参数是实现Condition接口的数组，Condition接口有个matches方法，如果匹配了规则则返回true，否则返回false

即@Conditional({Condition})

例,使用规则，如果是windows系统，给容器注册("bill"),如果是linux系统，给容器注册("linus"):
```java
@Bean(name = "bill")
@Conditional({WindowsCondition.class})
public Person person03(){
    return new Person("Bill Gates",60);
}

@Bean(name = "linus")
@Conditional({LinuxCondition.class})
public Person person04(){
    return new Person("Linus",48);
}
```

```java
package com.study.condition;

import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.beans.factory.support.BeanDefinitionRegistry;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.env.Environment;
import org.springframework.core.type.AnnotatedTypeMetadata;

//判断是否是linux系统
public class LinuxCondition implements Condition {
    /**
     *
     * @param context 判断条件能使用的上下文环境
     * @param metadata 标注了Condition注解的注释信息
     * @return
     */
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        //1.获取到ioc当前使用的beanfactory
        ConfigurableListableBeanFactory beanFactory = context.getBeanFactory();
        //2.获取到类加载器
        ClassLoader classLoader = context.getClassLoader();
        //3.获取运行环境信息
        Environment environment = context.getEnvironment();
        //4.获取到bean定义的注册类,从其源码可以看出，它可以注册一个bean的定义，也能移除一个bean的定义，也可以查看是否含有一个bean，也能查询bean
        //所以可以根据容器中bean的注册情况，给容器中注册、删除组件等
        BeanDefinitionRegistry registry = context.getRegistry();

        String osName = environment.getProperty("os.name");
        if(osName.contains("linux")){
            return true;
        }
        return false;
    }
}
```

...省略WindowsCondition.java

## @Import

给容器快速导入一个组件

如:
```java
@Import({Color.class, Red.class})
public class MainConfig2 {
    ...
}
```

@import的源码:
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
可看出，它除了可以传入要导入的Class之外，也可以传入实现了 ImportSelector和ImportBeanDefinitionRegistrar接口的类。

### ImportSelector

自定义逻辑，返回需要导入的组件。
从其源码可以看出，返回的是一个String数组，这是定义了要导入的组件的全类名的String数组。
```java
public interface ImportSelector {

	/**
	 * Select and return the names of which class(es) should be imported based on
	 * the {@link AnnotationMetadata} of the importing @{@link Configuration} class.
	 */
	String[] selectImports(AnnotationMetadata importingClassMetadata);

}
```

如，下面将导入对应包下的Blue类和Yellow类：
```java
package com.study.condition;

import org.springframework.context.annotation.ImportSelector;
import org.springframework.core.type.AnnotationMetadata;

//自定义逻辑，返回需要导入的组件
public class MyImportSelector implements ImportSelector {

    //返回值就是要导入到容器中的组件全类名
    //AnnotationMetadata: 当前标注@import 注解的类的所有注解信息(即除了@import 可以获取这个被标注的类的其他的注解)
    public String[] selectImports(AnnotationMetadata importingClassMetadata) {

        //返回要注册的组件的全类名数组
        return new String[]{"com.study.bean.Blue","com.study.bean.Yellow"};
    }
}
```

### ImportBeanDefinitionRegistrar

这是官方的解释:
>Register bean definitions as necessary based on the given annotation metadata of the importing {@code @Configuration} class.

使用ImportBeanDefinitionRegistrar接口实现的类,可以自由发挥，动态的生成一些Bean。

例如,动态添加一个RainBow组件:
```java
public class MyImportBeanDefinitionRegistrar implements ImportBeanDefinitionRegistrar {

    /**
     *
     * @param importingClassMetadata 当前类的注解信息
     * @param registry BeanDefinition注册类，可以把所有需要添加到容器中的类，调用BeanDefinitionRegistry.registerBeanDefinition 方法手动注册
     */
    public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry) {

        //看容器中是否已有蓝色和红色组件
        boolean blue = registry.containsBeanDefinition("com.study.bean.Blue");
        boolean red = registry.containsBeanDefinition("com.study.bean.Red");

        if(blue && red){
            //第一个参数指定bean的名字
            // 第二个参数是BeanDefinition接口，使用 RootBeanDefinition 实现,即指定bean的定义信息(哪个类，scope等。。。。)
            RootBeanDefinition rainBowRootBeanDefinition = new RootBeanDefinition(RainBow.class);
            registry.registerBeanDefinition("rainBow",rainBowRootBeanDefinition);
        }
    }
}
```

## 给容器中注册组件小节

给容器中注册组件：

* 1.包扫描+组件标注注解(@Controller/@Service/@Repository/@Component) [有局限性，自己写的类很方便引入，但是第三方包不方便引入]
* 2. @Bean[ 导入第三方包里面的组件,使用无参构造器创建一个组件]
* 3. @Import [快速给容器中注册一个组件]
    * 1) @Import 要导入到容器中的组件，容器中就会自动注册这个组件，Id默认是全类名
    * 2）ImportSelector:是一个接口，返回selectImports的String[]数组,这个数组即为要导入的类的全类名数组{@link com.study.condition.MyImportSelector}
    * 3) ImportBeanDefinitionRegistrar: 也是一个接口，有个方法registerBeanDefinitions
* 4. 使用Spring提供的FactoryBean(工厂Bean),一般的Bean，容器会调用一般的Bean的无参构造器，默认创建一个对象注册到容器中。它是一个接口{@link org.springframework.beans.factory.FactoryBean}

### 使用Spring提供的FactoryBean

这里补充一下上面提到的使用Spring提供的FactoryBean(工厂Bean)

让要添加到容器中的类实现FactoryBean<T> 接口。

如:
```java
public class ColorFactoryBean implements FactoryBean<Color> {
    //
    public Color getObject() throws Exception {
        return new Color();
    }

    public Class<?> getObjectType() {
        return Color.class;
    }

    //可以设置是否是单实例
    //true为单实例 false为多实例
    public boolean isSingleton() {
        return true;
    }
}
```
使用时,直接返回这个类的对象:
```java
 @Bean
    public ColorFactoryBean colorFactoryBean(){
        return new ColorFactoryBean();
    }
```

* 注意:虽然下面的 colorFactoryBean 注册到了容器中，但是对它进行获取，得到的是Color实例，即获取的是调用getObject创建的对象，
* 若就是要获取工厂Bean本身的话,要在id前面加一个&标识，如下面的:getBean("&colorFactoryBean") 源码:{@link org.springframework.beans.factory.BeanFactory}

# Bean生命周期

bean的生命周期是指bean创建---初始化---销毁的过程

一般都遵循下面的流程：

 构造(对象创建)
     单实例:在容器启动时创建对象
     多实例:在每次获取的时候创建对象

 初始化之前调用BeanPostProcessor.postProcessBeforeInitialization()
 初始化：
     对象创建完成并赋值好后，调用初始化方法
 初始化之后调用BeanPostProcessor.postProcessAfterInitialization()

 销毁：
     单实例：bean容器关闭的时候销毁
     多实例：容器不关闭时不销毁

## 使用Bean定义初始化和销毁方法
让容器管理bean的生命周期，我们可以自定义初始化和销毁方法,在bean进行到当前生命周期的时候,容器调用对应方法。

1).使用以前的xml配置: init-method=""   destory-method=""

2).看@Bean的源码,含有两个值initMethod 和destoryMethond.用它们来制定对应的init和destory方法
如:
```java
@Bean(initMethod = "init",destroyMethod = "destory")
    public Car car(){
        return new Car();
    }
```
```java
public class Car {

    public Car() {
        System.out.println("Car...Constructor");
    }

    public void init(){
        System.out.println("Car...init...");
    }

    public void destory(){
        System.out.println("Car...destory...");
    }
}
```

## 实现接口InitializingBean/DisposableBean

还有一种方式是让要注册的bean实现接口:
* {@link org.springframework.beans.factory.InitializingBean} 它的afterPropertiesSet()方法定义初始化逻辑（在其bean的属性都赋值完成后）

* {@link org.springframework.beans.factory.DisposableBean}  它的destroy()方法定义销毁逻辑

如:
```java
@Component
public class Cat implements InitializingBean, DisposableBean {
    public Cat() {
        System.out.println("Cat ... constructor...");
    }

    public void destroy() throws Exception {
        System.out.println("Cat  .... destory...");
    }

    public void afterPropertiesSet() throws Exception {
        System.out.println("cat ...afterPropertiesSet...");
    }
}
```

## 使用JSR250规范中定义的两个注解 @PostConstruct/@PreDestroy 

从字面意思就很好理解这两个注解的意思。

*  @PostConstruct : 在bean创建完成并且属性赋值完成后执行一些初始化方法.(@Target(METHOD)标注在方法上）

*  @PreDestroy : 在bean被移除之前进行回调通知.（@Target(METHOD)标注在方法上）

从这两个的源码可以看出,他们是标注在方法上的注解:
```java
@Documented
@Retention (RUNTIME)
@Target(METHOD)
public @interface PostConstruct {
}
```

如:
```java
@Component
public class Dog {

    public Dog() {
        System.out.println("dog....constructor...");
    }

    //对象创建完成后调用
    @PostConstruct
    public void init(){
        System.out.println("dog....@PostConstruct...");
    }

    //容器移除对象之前
    @PreDestroy
    public void destory(){
        System.out.println("dog....@PreDestroy...");
    }
}
```

## BeanPostProcessor

看官方注释的解释:
>Apply this BeanPostProcessor to the given new bean instance <i>before</i> any bean initialization callbacks (like InitializingBean's {@code afterPropertiesSet} or a custom init-method). The bean will already be populated with property values.

BeanPostProcessor 接口定义了一个你可以自己实现的回调方法，来实现你自己的实例化逻辑、依赖解决逻辑等，如果你想要在Spring完成对象实例化、配置、初始化之后实现自己的业务逻辑，你可以补充实现一个或多个BeanPostProcessor的实现。

即在bean初始化前后进行一些处理工作 。它是一个接口。
其中有两个要实现的方法:
* postProcessBeforeInitialization() : 初始化之前进行一些后置处理工作 (详情见源码介绍
*  postProcessAfterInitialization()  : 初始化之后进行一些后置处理工作 (详情见源码介绍

我们可以看到注释postProcessBeforeInitialization方法是在所有的bean的InitializingBean的afterPropertiesSet方法之前执行而postProcessAfterInitialization方法则是在所有的bean的InitializingBean的afterPropertiesSet方法之后执行的。——[摘自](https://www.jianshu.com/p/fb39f568cd5e)

如:
```java
/**
 * 后置处理器：初始化前后进行处理工作
 */
@Component
public class MyBeanPostProcessor implements BeanPostProcessor {
    public MyBeanPostProcessor() {
        System.out.println("MyBeanPostProcessor...constructor");
    }

    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        System.out.println("postProcessBeforeInitialization:" + beanName + " ---> " + bean);
        return bean;
    }

    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        System.out.println("postProcessAfterInitialization:" + beanName + " ---> " + bean);
        return bean;
    }
}
```

BeanPostProcessor在Spring底层还有很多应用，要多加学习。

# 属性赋值

## @Value赋值
在要注入的属性域上面用@Value().

* 1.基本数值
* 2.可以写SpEL:#{}
* 3.取出配置文件(properties文件)中的值（在运行的环境变量中的值）: ${}

3的使用见下一小节

如:
```java
public class Person {

    @Value("张三")
    private String name;
    @Value("#{20-2}")
    private Integer age;
    @Value("${person.nickName}")
    private String nickName;

    getters/setters..
}
```

## @PropertySource加载外部配置文件

使用@PropertySource读取外部配置文件中的k/v 保存到运行的环境变量中,使用${}取出配置文件中的值。配置文件的值可以在上下文环境获取到

PropertySource的有 @Repeatable(PropertySources.class)标注, 可以标注
多个PropertySource.可以使用PropertySources 传入多个PropertySource

如:
```java
@Configuration //表名是配置文件
@PropertySource(value = {"classpath:person.properties"},encoding = "UTF-8")
public class MainConfigOfPropertyValue {
   @Bean
    public Person person(){
        return new Person();
    }
}
```
见上一小节，在Person中就可以用@Value取出配置文件中的值了

## 自动装配:@Autowried&@Qualifier&@Primary
自动装配： Spring使用依赖注入(DI),完成对IOC容器中各个组件的依赖关系赋值

* 1.) @Autowired
   * 1.当一个类中需要另一个组件时，标注了@Autowried，默认优先按照类型去容器中找对应的组件,类似于applicationContext.getBean(Bean.class);
   * 2.如果按照类型找到多个相同类型的组件，再将属性的名称作为组件的id去容器中查找
* 2.) @Qualifier
   * 使用@Qualifier("") 指定要装配的组件的id，而不是使用属性名
* 3.) @Primary
   * 没有明确指定的情况下,让容器自动装配时默认使用首选的bean.
* 4.) 使用自动装配默认一定要将属性赋值好；没有的话就会报错。
   * 可以使用@Autowired(required=false) 使其变为非必须的(如果没有要的组件的话就为 null,而不是报错

## 自动装配:@Resource&@Inject
Spring还支持使用@Resource(JSR250)和@Inject(JSR330)【这两个是java规范注解】进行自动装配

* @Resource: 可以和@Autowried一样实现自动装配功能，默认按照属性名称装配。也可以使用name设置要装配的组件的Id:@Resource(name=""), 没有支持@Primary功能和@Autowried(required=false)功能
* @Inject: 使用时需要先导入依赖:{@url https://mvnrepository.com/artifact/javax.inject/javax.inject/1}  功能与@Autowried一样，默认支持Primary的特性,但不支持@Autowried(required=false)功能

## 自动装配:方法、构造器位置的自动装配
@Autuwried 能标注的位置不只是在组件上面，还可以在构造器，方法，参数，属性  
```java
@Target({ElementType.CONSTRUCTOR, ElementType.METHOD, 
ElementType.PARAMETER, ElementType.FIELD, ElementType.ANNOTATION_TYPE})
```

1.)如果`标注在方法`上，Spring创建当前对象，就会调用方法，完成赋值。其中，方法使用的参数，自定义类型的值从IOC容器中获取
2.)如果`标注在有参构造器`上,那么Spring在启动时就会调用有参构造器，如果构造器要用到组件，那么也会从容器中获取。如果只有一个有参构造器，那么其@Autowried可以省略
3.)如果`标注在方法位置`:标注的方法创建对象的时候，方法参数的值从容器中获取，所以默认不写@Autowried是一样的，都能自动装配
如:
```java
@Configuration
public class MainConfigOfAutowired {
    @Bean
    public Color color(@Autowried Car car){ //或者省略@Autowried
        Color color = new Color();
        return color;
    }
}
```

注:默认加载IOC容器中的组件，会启动调用无参构造器创建对象，然后再进行初始化赋值等操作。

## 自动装配:Aware注入Spring底层组件
自定义组件想要使用Spring容器底层的一些组件(如ApplicationContex  BeanFactor xxx等)，即:把Spring底层的一些组件注入到自定义的bean中进行使用.那么让自定义组件实现 xxxAware 接口.从{@link org.springframework.beans.factory.Aware} 介绍
>Marker superinterface indicating that a bean is eligible to be notified by the Spring container of a particular framework object through a callback-style method.

可以看出,它提供了一些可以使用Spring 容器底层对象的功能。类似于回调函数的风格，Aware接口规定的方法在对象创建的时候就会被调用，注入相关组件。

如,实现三个Aware接口:
```java
@Component
public class Red implements ApplicationContextAware, BeanNameAware, EmbeddedValueResolverAware {
    private ApplicationContext applicationContext;

    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        System.out.println("传入的ioc" + applicationContext);
        this.applicationContext = applicationContext; //在后面也可以使用
    }

    public void setBeanName(String name) {
        System.out.println("当前bean的名字: " + name);
    }

    //能够解析字符串的值
    public void setEmbeddedValueResolver(StringValueResolver resolver) {
        String s = resolver.resolveStringValue("你好 ${os.name} 我是 #{20*18}");
        System.out.println("解析的字符串:" + s);
    }
}
```

ApplicationContextAware接口是用来获取applicationContext上下文:
>Interface to be implemented by any object that wishes to be notified of the {@link ApplicationContext} that it runs in.

BeanNameAware的介绍:
>Interface to be implemented by beans that want to be aware of their bean name in a bean factory.

EmbeddedValueResolverAware的介绍:
>Interface to be implemented by any object that wishes to be notified of a <b>StringValueResolver</b> for the <b> resolution of embedded definition values.

EmbeddedValueResolverAware的方法中的参数StringValueResolver可以解析字符串中的值,即将`#{}`或者`${}`的值解析

xxxAware的功能是使用xxxProcessor来处理的，每个都有对应的xxxProcessor.如ApplicationContextAware ---> ApplicationContextAwareProcessor.

## 自动装配:@Profile

@Profile的功能:Spring提供的可以根据当前环境，动态的激活和切换一系列组件的功能。如开发环境、测试环境、生产环境用的数据库不一样，但是不同的环境不用修改代码。@Profile就是指定组件在哪个环境下才能被注册到容器中。如果不指定，则任何环境下都能注册这个组件。

如@Profile("test") @Profile("dev") @Profile("prod")

* 1.加了环境标识的bean，只有这个环境被激活的时候才能注册到容器中。默认是default环境
  使用:
  * 1.使用命令行动态参数:在虚拟机参数位置加载-DSpring.profiles.active
  * 使用代码: ①使用AnnotationConfigApplicationContext的无参构造器创建一个applicationContext对象, ②设置需要激活的环境 ③注册主配置类 ④启动刷新容器
  如:

  ```java
  @Test
    public void Test01(){
        //1.调用AnnotationConfigApplicationContext的无参构造器
        AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext();
        //2.设置要激活的环境
        applicationContext.getEnvironment().setActiveProfiles("test");
        //3.注册主配置类
        applicationContext.register(MainConfigOfProfile.class);
        //4启动刷新容器
        applicationContext.refresh();

        applicationContext.close();
    }
  ```

* 2.如果写在配置类上，那么只有是指定环境的时候，整个配置类里面的所有配置才能开始生效
* 3.没有标注环境标识的bean，在任何环境下都是加载的