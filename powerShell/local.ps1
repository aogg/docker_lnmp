
$hostName = 'yy';
$machineArgs['sharedFolder'] = @{
    'Users'='D:\PHP\phpStudy\WWW';
}

# Set-Alias vm 'E:\VirtualBox\VBoxManage.exe'

# 每个桥接网卡的名称都不一致，可打开virtualbox查看
$machineArgs['bridgeadapter'] = 'Realtek PCIe GBE 系列控制器';


# docker-compose 的变量，不支持powershell对象写法
# 临时变量
$env:compose_dir = '/Users/github/docker_lamp/docker/';
# 宿主机与容器的共享目录
$env:compose_volumes_base = '/Users/:/www/';
# nginx conf的共享目录
$env:compose_volumes_nginx = "${env:compose_dir}nginx/conf/:/usr/src/nginx/conf/";
# php的共享目录
$env:compose_volumes_php_conf = "${env:compose_dir}php/conf/conf:/usr/src/php/conf/";
$env:compose_volumes_php_etc = "${env:compose_dir}php/conf/etc/:/usr/src/php/etc/";



