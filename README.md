# 基于docker的LAMP环境

## 说明
这是一个基于docker的LAMP环境，并利用PowerShell提供在windows下的个性配置集中管理（其中根目录下的"[开始.bat](%E5%BC%80%E5%A7%8B.bat)"可一步构建docker环境，并可重启所有容器。）



## 使用
- 1、修改[/powerShell/local.ps1](powerShell/local.ps1)文件，
更多配置设置可在[/powerShell/common.ps1](powerShell/common.ps1)中
- 2、配置执行文件的环境变量，可查看[/powerShell/command-alias.ps1](powerShell/command-alias.ps1)文件，其中VBoxManage在virtualbox的bin目录下
- 3、双击"[开始.bat](%E5%BC%80%E5%A7%8B.bat)"


**注意**
- 1、如果首次运行"[开始.bat](%E5%BC%80%E5%A7%8B.bat)"并在创建容器时报错，继续双击运行即可。


## 结构说明

**开始.bat**  
首次已管理员身份打开，然后以后就直接双击即可（这里管理员和当前用户对于docker-machine是有区别的）


**容器配置**  
各容器放在docker文件夹内，对应配置也在容器文件夹的conf文件夹  
其中php、nginx的conf文件夹已实现共享，可本地修改并在容器内及时体现出
如：  
1、[docker/php/conf/conf/php.ini](docker/php/conf/conf/php.ini)  
2、[docker/php/conf/etc/php-fpm.conf](docker/php/conf/etc/php-fpm.conf)  
3、[docker/nginx/conf/nginx.conf](docker/nginx/conf/nginx.conf)  

其中sources.list是通过COPY过去，所以如要修改必须重新构建所有容器



**多进程安装扩展**  
- 1、PHP扩展安装相关目录为[docker/php/src/](https://github.com/aogg/docker_lamp/tree/master/docker/php/src)，对应容器内路径为/usr/local/php-ext/。

  
在windows中可通过在[/powerShell/local.ps1](powerShell/local.ps1)文件中指定
```powershell
$env:compose_build_php_configure_dir = '/usr/local/php';
```
- 2、[config.json](https://github.com/aogg/docker_lamp/tree/master/docker/php/src/config.json)为所有扩展的配置文件  
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
- 3、[install.json](https://github.com/aogg/docker_lamp/tree/master/docker/php/src/install.json)为本次构建（build）时需要安装的扩展
- 4、[php-ext.sh](https://github.com/aogg/docker_lamp/tree/master/docker/php/src/php-ext.sh)为安装PHP扩展的核心多线程shell脚本。平时在容器内可通过下面方式直接安装指定的多个扩展<br />
```shell 
bash /usr/local/php-ext.sh memcached-2.2.0 xdebug-2.4.0
```
- 5、最大并发安装PHP扩展的数量，默认值为15。

  
在windows中可修改[/powerShell/local.ps1](powerShell/local.ps1)文件
```powershell
$env:compose_build_php_processes_num = 15;
```





## 各截图

mini安装[多个扩展](https://github.com/aogg/docker_lamp/blob/a716e496d59bf408804cda1e10b970af387a62bf/docker/php/src/install.json)时间<br />
![github](https://raw.githubusercontent.com/aogg/image_repository/master/docker_lamp/mini%E5%AE%89%E8%A3%85%E6%89%A9%E5%B1%95%E6%97%B6%E9%97%B4.png "mini安装扩展时间")
  

