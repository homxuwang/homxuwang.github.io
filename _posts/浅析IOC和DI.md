---
title: 浅析IOC和DI
date: 2019-06-06 11:20:48
tags: [Spring]
---

# 概念

* IOC(Inversion of Control): 其思想是**反转资源获取的方向**.传统的资源查找方式要求组件向容器发起请求查找资源.作为回应，容器适时的返回资源。而应用了IOC之后，则是**容器主动地将资源推送给它所管理的组件，组件所要做的仅是选择一种合适的方式来接受资源**.这种形式也被称为查找的被动形式。

  * 控制什么？
    控制对象的创建及销毁（生命周期）
  * 反转什么？
    对象的控制权被反转了，将对象的控制权交给IOC容器

* DI(Dependency Injection)——IOC的另一种表述方式：即**组件以一些预先定义好的方式(如:setter方法)接受来自肉容器的资源注入**.相对于IOC而言，这种表述更直接.

为何是反转，哪些方面反转了：有反转就有正转，传统应用程序是由我们自己在对象中主动控制去直接获取依赖对象，也就是正转；而反转则是由容器来帮忙创建及注入依赖对象；为何是反转？因为由容器帮我们查找及注入依赖对象，对象只是被动的接受依赖对象，所以是反转；哪些方面反转了？依赖对象的获取被反转了。

IoC不是一种技术，只是一种思想，一个重要的面向对象编程的法则，它能指导我们如何设计出松耦合、更优良的程序。传统应用程序都是由我们在类内部主动创建依赖对象，从而导致类与类之间高耦合，难于测试；有了IoC容器后，把创建和查找依赖对象的控制权交给了容器，由容器进行注入组合对象，所以对象与对象之间是松散耦合，这样也方便测试，利于功能复用，更重要的是使得程序的整个体系结构变得非常灵活。

* 依赖注入：是组件之间依赖关系由容器在运行期决定，形象的说，即由容器动态的将某个依赖关系注入到组件之中。依赖注入的目的并非为软件系统带来更多功能，而是为了提升组件重用的频率，并为系统搭建一个灵活、可扩展的平台。通过依赖注入机制，我们只需要通过简单的配置，而无需任何代码就可指定目标需要的资源，完成自身的业务逻辑，而不需要关心具体的资源来自何处，由谁实现。

* 理解DI的关键是：“谁依赖谁，为什么需要依赖，谁注入谁，注入了什么”，那我们来深入分析一下：
  * 谁依赖于谁：当然是某个容器管理对象依赖于IoC容器；“被注入对象的对象”依赖于“依赖对象”；

  * 为什么需要依赖：容器管理对象需要IoC容器来提供对象需要的外部资源；

  * 谁注入谁：很明显是IoC容器注入某个对象，也就是注入“依赖对象”；

  * 注入了什么：就是注入某个对象所需要的外部资源（包括对象、资源、常量数据）。

IoC和DI由什么关系呢？其实它们是同一个概念的不同角度描述，由于控制反转概念比较含糊（可能只是理解为容器控制对象这一个层面，很难让人想到谁来维护对象关系），所以2004年大师级人物Martin Fowler又给出了一个新的名字：“依赖注入”，相对IoC 而言，“依赖注入”明确描述了“被注入对象依赖IoC容器配置依赖对象”。

# 分析实际

假设有个人叫张三，他有一辆奥迪车。张三下班的时候要开车回家，那么他对奥迪便产生了一种依赖关系。

Audi和ZhangSan的实现类：
```java
package com.iocstudy;

public class Audi {
    
    public void start() {
        System.out.println("Audi.start");
    }
    
    public void turnLeft() {
        System.out.println("Audi.turnLeft");
    }
    
    public void turnRight() {
        System.out.println("Audi.turnRight");
    }
    
    public void stop() {
        System.out.println("Audi.stop");
    }   
}
```

```java
package com.iocstudy;

public class ZhangSan {
    
    public void goHome(){
        Audi audi = new Audi();
        
        audi.start();
        audi.turnLeft();
        audi.turnRight();
        audi.turnRight();
        audi.stop();
    }
}
```

所以，张三要回家的话，需要
* 创建一辆车
  ```java
   Audi audi = new Audi();
  ```
* 控制车辆启动、直行、左右转
  ```java
  audi.start();
  audi.turnLeft();
  audi.turnRight();
  audi.turnRight();
  audi.stop();
  ```

那么，张三用车肯定不只是用来回家。还可以买东西、约会、飙车等等。
这时候，代码就该修改为:
```java
package com.iocstudy;

public class ZhangSan {
    
    public void goHome(){
        Audi audi = new Audi();
        
        audi.start();
        audi.turnLeft();
        audi.turnRight();
        audi.turnRight();
        audi.stop();
    }

     public void goShop(){
        Audi audi = new Audi();
        
        audi.start();
        audi.turnLeft();
        audi.turnRight();
        audi.turnRight();
        audi.stop();
    }
}
```

这时候，张三换车了，换成一辆BMW
```java
package com.iocstudy;

public class BMW {
    
    public void start() {
        System.out.println("Audi.start");
    }
    
    public void turnLeft() {
        System.out.println("Audi.turnLeft");
    }
    
    public void turnRight() {
        System.out.println("Audi.turnRight");
    }
    
    public void stop() {
        System.out.println("Audi.stop");
    }
}
```

那么这时候要把所有`ZhangSan`类中的引用Audi的代码都改为BMW。
这体现出来了车和张三之间的高耦合性。其次，这在设计时有一些问题：
* 张三所有的行为都需要自己主动创建一辆车。
* 更换车辆的代价是巨大的。要把所有奥迪车的引用都换为BMW。

这时候可以在张三类中进行一些改进，把他的车提到张三的属性域中，这样只需修改属性域中的车辆就可以了:
```java
package com.iocstudy;

public class ZhangSan {
    
    private BMW bmw = new BMW();
    
    public void goHome(){
        audi.start();
        audi.turnLeft();
        audi.turnRight();
        audi.turnRight();
        audi.stop();
    }
    
    public void goShop(){
      audi.start();
      audi.turnLeft();
      audi.turnRight();
      audi.turnRight();
      audi.stop();
    }
}
```

那么接着思考：
* 张三需要的事一辆奥迪车？还是一辆宝马车？还是只是一辆车？
  张三只需要回家和买东西，只是需要一辆车而已。
* 张三会制造（创建）车辆吗？
  不会。车辆不应该由张三进行创建。

解决方法：抽象出一个车的接口,并且车辆不由张三创建，而是在构造函数中以参数的形式传入。

定义接口：
```java
package com.iocstudy;

public interface Car {
    
    public void start();
    
    public void turnLeft();
    
    public void turnRight();
    
    public void stop();
}
```

让奥迪和宝马实现接口：
```java
package com.iocstudy;

public class Audi implements Car{
    
    public void start() {
        System.out.println("Audi.start");
    }
    
    public void turnLeft() {
        System.out.println("Audi.turnLeft");
    }
    
    public void turnRight() {
        System.out.println("Audi.turnRight");
    }
    
    public void stop() {
        System.out.println("Audi.stop");
    }
    
}
```

```java
package com.iocstudy;

public class BMW implements Car{
    
    public void start() {
        System.out.println("Audi.start");
    }
    
    public void turnLeft() {
        System.out.println("Audi.turnLeft");
    }
    
    public void turnRight() {
        System.out.println("Audi.turnRight");
    }
    
    public void stop() {
        System.out.println("Audi.stop");
    }
}
```

接着回到张三这个类，张三只是需要一辆车，车不应该由张三创建。
```java
package com.iocstudy;

public class ZhangSan {
    
    private Car car;
    
    ZhangSan(Car car){
        this.car = car;
    }
    
    public void goHome(){
        audi.start();
        audi.turnLeft();
        audi.turnRight();
        audi.turnRight();
        audi.stop();
    }
    
     public void goShop(){
        audi.start();
        audi.turnLeft();
        audi.turnRight();
        audi.turnRight();
        audi.stop();
    }
}
```

那么接着思考一下：既然车不应该由张三创建，那么应该由谁创建呢？
那就是今天的主角：<font color='red'>**IOC容器**</font>

# 实现一个自己的IOC容器

## 场景模拟

延续上一节中场景的例子，新增一个Human接口，和HumanWithCar类(有车一族类)，张三和李四继承自有车一族类。如下图：

<div class="mxgraph" style="max-width:100%;border:1px solid transparent;" data-mxgraph="{&quot;highlight&quot;:&quot;#0000ff&quot;,&quot;nav&quot;:true,&quot;resize&quot;:true,&quot;toolbar&quot;:&quot;zoom layers lightbox&quot;,&quot;edit&quot;:&quot;_blank&quot;,&quot;xml&quot;:&quot;&lt;mxfile modified=\&quot;2019-06-07T11:55:43.873Z\&quot; host=\&quot;www.draw.io\&quot; agent=\&quot;Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36\&quot; etag=\&quot;cMJ_EGGJR-Qaq343x0gh\&quot; version=\&quot;10.7.5\&quot;&gt;&lt;diagram id=\&quot;ivcPhOSlkpp--JMVBmTc\&quot; name=\&quot;第 1 页\&quot;&gt;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&lt;/diagram&gt;&lt;/mxfile&gt;&quot;}"></div>

在使用IOC管理这个场景之前，进行一些约定,以便简化IOC的业务逻辑：

* 所有的Bean的声明周期交给IOC容器管理
* 所有被依赖的Bean通过构造方法进行注入。(其实除了构造方法注入，还有setter方法注入)
* 被依赖的Bean需要优先创建。（比如要创建张三，那么张三依赖的奥迪需要先创建了并且交由IOC容器管理了）

这是新的场景模拟的代码：
Car接口
```java
package com.iocstudy.car;

public interface Car {

    public void start();

    public void turnLeft();

    public void turnRight();

    public void stop();
}
```

奥迪实现类：
```java
package com.iocstudy.car;

public class Audi implements Car{

    public void start() {
        System.out.println("Audi.start");
    }

    public void turnLeft() {
        System.out.println("Audi.turnLeft");
    }

    public void turnRight() {
        System.out.println("Audi.turnRight");
    }

    public void stop() {
        System.out.println("Audi.stop");
    }
}
```

宝马实现类：

```java
package com.iocstudy.car;

public class BMW implements Car{

    public void start() {
        System.out.println("Audi.start");
    }

    public void turnLeft() {
        System.out.println("Audi.turnLeft");
    }

    public void turnRight() {
        System.out.println("Audi.turnRight");
    }

    public void stop() {
        System.out.println("Audi.stop");
    }
}
```

Human接口:
```java
package com.iocstudy.Human;

public interface Human {
    public void goHome();
    public void goShop();
}
```

HumanWithCar类，它要实现接口中的goHome方法和goShop方法，但是有车一族是一个笼统的概念，张三和李四都是有车一族，他们回家和购物的路线和方式肯定不是一样的，要执行的方法的具体内容不一样。所以,这两个方法应该被声明为虚方法，HumanWithCar类也应是抽象类。
```java
package com.iocstudy.Human;

import com.iocstudy.car.Car;

public abstract class HumanWithCar implements Human {

    protected Car car;

    HumanWithCar(Car car){
        this.car = car;
    }

    public abstract void goHome();

    public abstract void goShop();
}
```

张三和李四:

```java
package com.iocstudy.Human;

import com.iocstudy.car.Car;

public class ZhangSan extends HumanWithCar {
    public ZhangSan(Car car) {
        super(car);
    }

    @Override
    public void goHome() {
        car.start();
        car.turnLeft();
        car.turnRight();
        car.stop();
    }

    @Override
    public void goShop() {
        car.start();
        car.turnRight();
        car.stop();
    }
}
```

```java
package com.iocstudy.Human;

import com.iocstudy.car.Car;

public class LiSi extends HumanWithCar {
    public LiSi(Car car) {
        super(car);
    }

    @Override
    public void goHome() {
        car.start();
        car.turnLeft();
        car.stop();
    }

    @Override
    public void goShop() {
        car.start();
        car.turnRight();
        car.turnLeft();
        car.stop();
    }
}
```

然后要书写IoC容器，按照约定，
* 所有的Bean的声明周期交给IOC容器管理
* 所有被依赖的Bean通过构造方法进行注入。
* 被依赖的Bean需要优先创建。

所以，
* 容器要能实例化bean
* 实例化后要保存bean
* 要能够提供bean
* 每个bean要产生一个id与之相对应


那么，
* 保存bean：要有私有域来存储IoC创建好的bean(使用Map存储)
* 提供bean:提供一个getBean()方法
* 实例化bean：提供一个setBean()方法，向Map中增加bean

创建容器类:
```java
package com.iocstudy;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class IoCContainer {
    private Map<String,Object> beans = new ConcurrentHashMap<String, Object>();

    /**
     * 根据beanId获取一个bean
     * @param beanId beanId
     * @return 返回bean
     */
    public Object getBean(String beanId){
        return beans.get(beanId);
    }

    /**
     * 委托ioc容器创建一个bean
     * @param clazz 要创建的bean的class
     * @param beanId beanId
     * @param paramBeanIds 要创建的bean的class的构造方法所需要的参数的beanId(即要创建的bean所需要的依赖bean)
     */
    public void setBeans(Class<?> clazz,String beanId,String... paramBeanIds){

    }
}
```

接下来就是实现setBeans方法：
* 因为是根据构造方法创建一个bean,构造方法是需要参数值的，所以要组装构造方法所需要的参数值
* 调用构造方法，实例化bean
* 将实例化的bean放到Map中

```java
 public void setBeans(Class<?> clazz,String beanId,String... paramBeanIds){
        // 1 组装构造方法所需要的参数值
        Object[] paramValues = new Object[paramBeanIds.length];
           //因为约定中所有的被依赖的bean需要被优先创建,所以需要的bean从beans中取就可以了
        for (int i = 0; i < paramBeanIds.length; i++) {
            paramValues[i] = beans.get(paramBeanIds[i]);
        }
        // 2 调用构造方法，实例化bean
        Object bean = null; //先定义好最重要实例化的bean
            //循环使用要创建的bean的构造方法
        for (Constructor<?> constructor : clazz.getConstructors()) {
            try {
                bean = constructor.newInstance(paramValues);
                //这里不处理异常。如果最终所有的构造方法都不能完成实例化，则bean为null
            } catch (InstantiationException e) {
            } catch (IllegalAccessException e) {
            } catch (InvocationTargetException e) {
            }
        }
        //如果最终没有实例化，则抛出错误
        if(bean == null){
            throw new RuntimeException("找不到合适的构造方法实例化bean");
        }
        // 3 将实例化的bean放到Map中
        beans.put(beanId,bean);
    }
```

使用单元测试类进行测试:
```java
package com.iocstudy;

import com.iocstudy.Human.Human;
import com.iocstudy.Human.LiSi;
import com.iocstudy.Human.ZhangSan;
import com.iocstudy.car.Audi;
import com.iocstudy.car.BMW;
import org.junit.Before;
import org.junit.Test;

public class springIocTest {
    private IoCContainer ioCContainer = new IoCContainer();

    @Before
    //向容器中注册bean
    public void before(){
        ioCContainer.setBeans(Audi.class,"audi");
        ioCContainer.setBeans(BMW.class,"BMW");
        ioCContainer.setBeans(ZhangSan.class,"zhangsan","audi");
        ioCContainer.setBeans(LiSi.class,"lisi","BMW");
    }

    @Test
    public void test()  {
        Human zhangsan  = (Human) ioCContainer.getBean("zhangsan");
        zhangsan.goHome();
        Human lisi  = (Human) ioCContainer.getBean("lisi");
        lisi.goHome();
    }
}
```

打印结果:
```
Audi.start
Audi.turnLeft
Audi.turnRight
Audi.stop
Audi.start
Audi.turnLeft
Audi.stop
```

这样就实现了一个最简单的IoC容器。

这样做的好处:
* 所有的依赖关系被集中统一的管理起来，清晰明了。在Before中将所有的依赖关系先集中管理起来。
* 每个类只需要关注于自己的业务逻辑。例如在张三的代码中，张三只需要关注goHome()的方法，而不需要关心他的车是什么，只需要IoC容器提供一辆就可以了。
* 修改依赖关系是很简单的事情。例如，张三现在依赖的是奥迪车，那么在setBean中只需修改为BMW，他就依赖于宝马了。

那么再回过头来看看IOC和DI的理解：

> 在没有使用Spring的时候，每个对象在需要使用他的合作对象时，自己均要使用像new object() 这样的语法来将合作对象创建出来，这个合作对象是由自己主动创建出来的，创建合作对象的主动权在自己手上，自己需要哪个合作对象，就主动去创建，创建合作对象的主动权和创建时机是由自己把控的，而这样就会使得对象间的耦合度高了，A对象需要使用合作对象B来共同完成一件事，A要使用B，那么A就对B产生了依赖，也就是A和B之间存在一种耦合关系，并且是紧密耦合在一起，而使用了Spring之后就不一样了，创建合作对象B的工作是由Spring来做的，Spring创建好B对象，然后存储到一个容器里面，当A对象需要使用B对象时，Spring就从存放对象的那个容器里面取出A要使用的那个B对象，然后交给A对象使用，至于Spring是如何创建那个对象，以及什么时候创建好对象的，A对象不需要关心这些细节问题(你是什么时候生的，怎么生出来的我可不关心，能帮我干活就行)，A得到Spring给我们的对象之后，两个人一起协作完成要完成的工作即可。
>所以控制反转IoC(Inversion of Control)是说创建对象的控制权进行转移，以前创建对象的主动权和创建时机是由自己把控的，而现在这种权力转移到第三方，比如转移交给了IoC容器，它就是一个专门用来创建对象的工厂，你要什么对象，它就给你什么对象，有了 IoC容器，依赖关系就变了，原先的依赖关系就没了，它们都依赖IoC容器了，通过IoC容器来建立它们之间的关系。
>这是我对Spring的IoC(控制反转)的理解。DI(依赖注入)其实就是IOC的另外一种说法，DI是由Martin Fowler 在2004年初的一篇论文中首次提出的。他总结：控制的什么被反转了？就是：获得依赖对象的方式反转了。



# 参考

* https://www.imooc.com/video/19046

* https://blog.csdn.net/bestone0213/article/details/47424255

* http://sishuok.com/forum/blogPost/list/2427.html

* https://blog.csdn.net/yqj2065/article/details/80450929



<script type="text/javascript" src="https://www.draw.io/js/viewer.min.js"></script>