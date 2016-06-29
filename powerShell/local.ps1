
$hostName = 'default';
$machineArgs['sharedFolder'] = @{
    'Users'='E:\WWW';
}

# Set-Alias vm 'E:\VirtualBox\VBoxManage.exe'




# docker-compose 的变量，不支持powershell对象写法
$env:compose_dir = '/Users/github/docker/docker/';
$env:compose_volumes_base = '/Users/:/www/';
$env:compose_volumes_nginx = "${env:compose_dir}nginx/conf/:/usr/src/nginx/conf/";
$env:compose_volumes_php_conf = "${env:compose_dir}php/conf/conf:/usr/src/php/conf/";
$env:compose_volumes_php_etc = "${env:compose_dir}php/conf/etc/:/usr/src/php/etc/";



