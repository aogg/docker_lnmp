# 基于docker的LAMP环境

## 说明
这是一个基于docker的LAMP环境，并利用PowerShell提供在windows下的个性配置集中管理（其中根目录下的"开始.bat"可一步构建docker环境，并可重启所有容器。）


### 结构说明

** 开始.bat **<br />
首次已管理员身份打开，然后以后就直接双击即可（这里管理员和当前用户对于docker-machine是有区别的）


** 容器配置 **<br />
各容器放在docker文件夹内，对应配置也在容器文件夹的conf文件夹