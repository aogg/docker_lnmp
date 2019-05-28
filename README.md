# 基于docker的LNMP环境
[![npm](https://img.shields.io/badge/npm-passing-brightgreen.svg)](https://www.npmjs.com/) [![npm](https://img.shields.io/badge/electron-passing-brightgreen.svg)](https://electron.atom.io/) [![npm](https://img.shields.io/badge/docker-passing-brightgreen.svg)](https://www.docker.com/) [![npm](https://img.shields.io/badge/vue-passing-brightgreen.svg)](https://cn.vuejs.org/) [![npm](https://img.shields.io/badge/node-passing-brightgreen.svg)]()
[![npm](https://img.shields.io/badge/webpack-passing-brightgreen.svg)]() [![npm](https://img.shields.io/badge/babel-passing-brightgreen.svg)]()


## 说明
一个基于[docker](https://www.docker.com/)的LNMP环境，并利用[electron](https://electron.atom.io/) + [vue](https://cn.vuejs.org/) 提供gui管理（目前只处理了window环境和mac环境，后续支持linux）

<br />其中gui界面通过[electron](https://electron.atom.io/)+[webpack](http://webpack.github.io/)+[vue](https://cn.vuejs.org/)+[babel](http://babeljs.cn/)实现。


## 使用
- npm打开
```bash
git clone https://github.com/aogg/docker_lnmp.git
cd electron
npm install --registry=https://registry.npm.taobao.org
npm start
```

- 首次点击构建，构建docker容器  
![github](https://raw.githubusercontent.com/aogg/image_repository/master/docker_lnmp/首次点击构建.png "首次打开点击构建")

- 再点击启动按钮，启动php环境  
- 其中xdebug需要额外配置127.0.0.1 host_localhost的hosts配置

## 容器配置  
各容器放在[docker](docker)文件夹内，对应配置也在容器文件夹的conf文件夹  
其中php、nginx的conf文件夹实现共享目录，可本地修改并在容器内及时体现出
如：  
1、[docker/php/conf/conf/php.ini](docker/php/conf/conf/php.ini)  
2、[docker/php/conf/etc/php-fpm.conf](docker/php/conf/etc/php-fpm.conf)  
3、[docker/nginx/conf/nginx.conf](docker/nginx/conf/nginx.conf)  

其中sources.list是通过COPY过去，所以如要修改必须重新构建所有容器


<br>

## 多进程安装扩展  
- 1、PHP扩展安装相关目录为[docker/php/src/](docker/php/src)，对应容器内路径为/usr/local/php-ext/。

- 2、[config.json](docker/php/src/config.json)为所有扩展的配置文件  
可配置参数：
```json
{
	"EXT_INSTALL" : "是否安装",
	"EXT_NAME"    : "扩展名称",
	"EXT_URL"     : "扩展下载地址",
	"EXT_TGZ_DIR" : "不下载直接用本地目录",
	"EXT_DEPEND"  : "扩展对应依赖",
	"EXT_ARG"     : "扩展编译时参数",
	"EXT_EVAL"    : "扩展下载完成后执行的代码",
	"EXT_DESC"    : "扩展描述"
},
```
- 3、[install.json](docker/php/src/install.json)为本次构建（build）时需要安装的扩展
- 4、[php-ext.sh](docker/php/src/php-ext.sh)为安装PHP扩展的核心多线程shell脚本。平时在容器内可通过下面方式直接安装指定的多个扩展<br />
```shell 
bash /usr/local/php-ext.sh memcached-2.2.0 xdebug-2.4.0
```
- 5、最大并发安装PHP扩展的数量，默认值为15。




<br>

## 打包
放在electron/app/dist目录下
```
npm run pack
```


<br>

## 各截图

> 主界面截图  
![github](https://raw.githubusercontent.com/aogg/image_repository/master/docker_lnmp/%e8%bd%af%e4%bb%b6%e4%b8%bb%e7%95%8c%e9%9d%a2%e6%88%aa%e5%9b%be.png "主界面截图")


> mini安装[多个扩展](https://github.com/aogg/docker_lnmp/blob/a716e496d59bf408804cda1e10b970af387a62bf/docker/php/src/install.json)时间  
![github](https://raw.githubusercontent.com/aogg/image_repository/master/docker_lnmp/mini%E5%AE%89%E8%A3%85%E6%89%A9%E5%B1%95%E6%97%B6%E9%97%B4.png "mini安装扩展时间")
  

