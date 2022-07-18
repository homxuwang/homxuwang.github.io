---
title: webpack5版本，使用webpack-dev-server报错
date: 2021-01-15 08:58:24
tags: [webpack]
---
在学习Webpack时，需要通过server方式运行，开始使用`--save-dev`的方式进行安装，无奈报错；搜索相关博客，有的解释使用`global`方式安装，但是用这种方式安装后，运行依然报错。

# package.json
```json
{
  "name": "02configuration",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "webpack-dev-server --open --hot"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "webpack": "^5.14.0",
    "webpack-cli": "^4.3.1",
    "webpack-dev-server": "^3.11.2"
  }
}
```
# 报错信息
使用以下命令报错
```
npm run dev
```


```js
D:\study\Webpack\webpack-lagou\02configuration>npm run dev

> 02configuration@1.0.0 dev D:\study\Webpack\webpack-lagou\02configuration
> webpack-dev-server --open --hot

internal/modules/cjs/loader.js:968
  throw err;
  ^

Error: Cannot find module 'webpack-cli/bin/config-yargs'
Require stack:
- D:\study\Webpack\webpack-lagou\02configuration\node_modules\webpack-dev-server\bin\webpack-dev-server.js
    at Function.Module._resolveFilename (internal/modules/cjs/loader.js:965:15)
    at Function.Module._load (internal/modules/cjs/loader.js:841:27)
    at Module.require (internal/modules/cjs/loader.js:1025:19)
    at require (internal/modules/cjs/helpers.js:72:18)
    at Object.<anonymous> (D:\study\Webpack\webpack-lagou\02configuration\node_modules\webpack-dev-server\bin\webpack-dev-server.js:65:1)
    at Module._compile (internal/modules/cjs/loader.js:1137:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1157:10)
    at Module.load (internal/modules/cjs/loader.js:985:32)
    at Function.Module._load (internal/modules/cjs/loader.js:878:14)
    at Function.executeUserEntryPoint [as runMain] (internal/modules/run_main.js:71:12) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [
    'D:\\study\\Webpack\\webpack-lagou\\02configuration\\node_modules\\webpack-dev-server\\bin\\webpack-dev-server.js'
  ]
}
npm ERR! code ELIFECYCLE
npm ERR! errno 1
npm ERR! 02configuration@1.0.0 dev: `webpack-dev-server --open --hot`
npm ERR! Exit status 1
npm ERR!
npm ERR! Failed at the 02configuration@1.0.0 dev script.
npm ERR! This is probably not a problem with npm. There is likely additional logging output above.

npm ERR! A complete log of this run can be found in:
npm ERR!     C:\Users\Administrator\AppData\Roaming\npm-cache\_logs\2021-01-14T09_42_44_662Z-debug.log
```

主要错误是找不到`webpack-dev-server`的module.
由于安装webpack时使用了默认的`npm install webpack`,并未指定版本，因此默认安装了新版——webpack5.所以有可能是版本的问题



# 解决方法

后来在 https://blog.csdn.net/peter_hzq/article/details/109683913 找到了类似的问题

我采用第二种方式，使用
```
npx webpack serve
```
运行，可以顺利启动

博客中第一种方法：`webpack-cli`的版本降为`3.3.12`，该方式未验证是否有效