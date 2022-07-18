---
title: cesium加载大数据量geojson优化&踩坑记
date: 2021-03-01 20:33:39
tags: [cesium,gis]
---
# 背景

在做一个新的Cesium项目时，要在Cesium中添加多个矢量图层（包括点、面），并要对矢量数据进行编辑（包括属性编辑和图形编辑）。点图层数据数据量较小，而其中一个面数据较大，大概有15000个feature，在正式上线时，面数据大概有测试数据的3-4倍，因此要找到一个高效率加载大量矢量数据的方案。

# 将feature加载形式从entity改为primitive

## primitive简介

primitive更接近cesium渲染引擎的底层。
>使用Geometry和Appearance 具有以下优势：
>（1）性能：绘制大量Primitive时，可以将其合并为单个Geometry以减轻CPU负担、更好的使用GPU。合并Primitive由web worker线程执行，UI保持响应性
>（2）灵活性：Geometry与Appearance解耦，两者可以分别进行修改
>（3）低级别访问：易于编写GLSL顶点、片段着色器、使用自定义的渲染状态

>同时，具有以下劣势：
（1）需要编写更多地代码
（2）需要对图形编程有更多的理解，特别是OpenGL的知识

下面代码是entity与primitive方式对比：
```javascript
//entity方式
viewer.entities.add({
    rectangle: {
        coordinates: Cesium.Rectangle.fromDegrees(110.20, 34.55, 111.20, 35.55),
        material: new Cesium.StripeMaterialProperty({
            evenColor: Cesium.Color.WHITE,
            oddColor: Cesium.Color.BLUE,
            repeat:5
        })
    }
});

//primitive方式
var instance = new Cesium.GeometryInstance({
    geometry: new Cesium.RectangleGeometry({
        rectangle: Cesium.Rectangle.fromDegrees(105.20, 30.55, 106.20, 31.55),
        vertexFormat:Cesium.EllipsoidSurfaceAppearance.VERTEXT_FORMAT
    })
});
viewer.scene.primitives.add(new Cesium.Primitive({
    geometryInstances: instance,
    appearance: new Cesium.EllipsoidSurfaceAppearance({
        material:Cesium.Material.fromType('Stripe')
    })
}));
```

## 存在的问题

改用primitive渲染feature后，仍然在数据加载阶段会有卡顿，因此猜测显示和加载feature事件过长的瓶颈不在于渲染方式上，而在于异步从服务器获取json数据方面。
因此考虑将数据切片，然后加载切片WMTS服务，缩短每次HTTP请求时的数据量，进而加快请求速度。

# 将shp数据存入PostgreSQL，通过GeoServer发布为WFS服务

该方式虽然将shp数据入库，但是通过GeoServer发布，数据依然在加载阶段有卡顿。因为数据虽然入库，但是在请求数据时，并没有对数据进行筛选，而仍请求全部的数据，这与直接加载json文本文件没什么区别。

# 将图层使用GeoServer发布为WMTS服务

经过上述尝试，发现必须对数据进行分片加载，减小加载数据时的压力，切片是一个很好的方式。

## 在GeoServer对数据进行切片

使用GeoServer+Vector-tile-plugin插件生成WMTS切片。Cesium调用WMTS服务时，数据以分片方式加载，加载速度很快。
但该方式也有缺点：
1. 发布的数据风格统一，且需要在发布前定义好；
2. 数据为图片形式，无法在z轴方向拉伸；

# 使用mvt矢量切片

## 切片制作与发布

首先使用idesktop对数据源进行矢量切片（如果需要制作专题图，建议先在idesktop中制作好，然后对该数据进行切片）
在单任务生成底图瓦片界面中，勾选所需切片的比例尺级别，输出设置中，存储类型选原始。其他保持不变。

**注意**
在idesktop制作mvt切片时，浏览工作空间时，注意要将工作区的*整幅地图*放在工作窗口内，否则在切片后数据会存在不能显示和浏览的问题。（这是超图需要改进的一个地方，而且这个问题官方也没提醒需要注意，只能踩坑才能发现）

使用iserver发布制作好的矢量切片，步骤：
1. 在iserver中选择发布服务，在弹出对话框数据中选择`UGCV5(MVT)切片`
2. 选择瓦片配置文件。选择制作好的矢量切片文件夹，找到后缀为`.sci`的配置文件并选择。
3. 选择发布的服务类型。选择`REST-矢量瓦片服务`。点击下一步，并点击完成。

服务发布后，可以在iserver中浏览数据。

## 加载和显示切片

在SuperMap的WebGL应用中，调用和添加切片数据：
```javascript
scene.addVectorTilesMap({  //scene是Cesium.viewer.scene
    url: url, //服务地址
    canvasWidth: 512,
    name: 'testMVT',
    viewer: viewer //Cesium.viewer
});
```
## 缺点及改进方案

-- 2021.3.8更新 --

矢量切片有两个很明显的缺点：
1. 不能以entity或primitive形式加载feature，因此不能对每个要素进行单独的渲染，只能以2d形式平铺在平面。
2. 虽然能够读取属性信息，但是无法对属性信息进行修改。

针对第一种缺点的解决方案，可以在idesktop中先将要素进行拉伸，渲染，然后发布为`.s3m`的切片；针对第二个问题的解决方案，我采用的方法是，单独写一个后台服务，用来修改和读取要素的属性信息，即在数据库中针对要素的属性单独挂接一张表，读取和修改时通过后台服务进行操作。

# 参考

1. https://www.jianshu.com/p/5a74c607a591
2. http://support.supermap.com.cn:8090/webgl/web/apis/3dwebgl.html
3. 官方加载MVT的示例 http://support.supermap.com.cn:8090/webgl/examples/webgl/editor.html#MVT