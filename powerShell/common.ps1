
$rootPath = $PSScriptRoot;

. ${rootPath}/command-alias.ps1;


# 虚拟主机名称
$hostName = 'default';
$machineArgs = @{
    driver = 'virtualbox';
    cap = '80'; # cpu运行峰值
    memory = '666'; # 内存大小
    noShare = $true; # 不分享桌面
    addBridged = $false; # 添加一个桥接网络
    bridgeadapter = 'Realtek PCIe GBE 系列控制器'; # 界面名称
    sharedFolder = @{}; # 共享目录，key为共享名，value为共享本地的路径
    other = ''; # 其他更多参数
};

# 使用哪个compose.yml文件
$composeYml = 'docker-compose-powershell.yml';



# php的--build-arg
# php版本号
$env:compose_build_php_version = '5.5.36';
# php编译目录
$env:compose_build_php_configure_dir = '/usr/local/php';
# php安装目录
$env:compose_build_php_dir = '/usr/src/php123a';
# php验证用
$env:compose_build_php_sha256 = 'e1bbe33d6b4da66b15c483131520a9fc505eeb6629fa70c5cfba79590a1d0801';
$env:compose_build_php_gpg_keys = '0B96609E270F565C13292B24C13C70B87267B52D 0BD78B5F97500D450838F95DFE857D9A90D90EC1 F38252826ACD957EF380D39F2F7956BC5DA04B5D';
# php的编译参数
$env:compose_build_php_configure_args = '--enable-fpm';
# 并发安装扩展的数量
$env:compose_build_php_processes_num = 15;


# nginx的--build-arg
# nginx版本号
$env:compose_build_nginx_version = '1.10.1';
# 安装nginx的目录
$env:compose_build_nginx_dir = '/usr/src/nginx';
# nginx的编译参数
$env:compose_build_nginx_args = '
    --with-http_addition_module
    --with-http_auth_request_module
    --with-http_dav_module
    --with-http_geoip_module
    --with-http_gzip_static_module
    --with-http_image_filter_module
    --with-http_perl_module
    --with-http_realip_module
    --with-http_ssl_module
    --with-http_stub_status_module
    --with-http_sub_module
    --with-http_xslt_module
    --with-ipv6
    --with-mail
    --with-mail_ssl_module
';


# bash的--build-arg
$env:base_zone = 'PRC';





$errorCode = ${
    1 = '创建容器失败';
    11 = '添加共享目录失败'; 
};






# 自定义配置
if (Test-Path ${rootPath}/local.ps1) {
    . ${rootPath}/local.ps1;
}


# 特殊处理
$env:compose_build_nginx_args = $env:compose_build_nginx_args -replace '\s+', ' ';
