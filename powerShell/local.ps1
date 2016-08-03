
$hostName = 'default';
# 本机和虚拟机的共享目录
$machineArgs['sharedFolder'] = @{
    'Users'='D:\www';
}

# 设置VBoxManage执行文件的别名
# Set-Alias vm 'E:\VirtualBox\VBoxManage.exe'


# 开启第三张网卡，用于解决局域网桥接
$machineArgs['addBridged'] = $false;
# 第三张网卡描述，每个桥接网卡的名称都不一致，可打开virtualbox查看
$machineArgs['bridgeadapter'] = 'Realtek PCIe GBE 系列控制器';


# 在windows中，如果是自带vm（v1.12以上），则C盘对应写法为/c/
# docker-compose 的变量，不支持powershell对象写法
# docker_lamp下的docker在虚拟机的路径
$env:compose_dir = '/Users/github/docker_lamp/docker/';
# 宿主机与容器的共享目录
$env:compose_volumes_base = '/Users/:/www/';
# nginx conf的共享目录
$env:compose_volumes_nginx = "${env:compose_dir}nginx/conf/:/usr/src/nginx/conf/";
# php的共享目录
$env:compose_volumes_php_conf = "${env:compose_dir}php/conf/conf:/usr/src/php/conf/";
$env:compose_volumes_php_etc = "${env:compose_dir}php/conf/etc/:/usr/src/php/etc/";



