// docker容器配置
const Path = require('path');
const commonFunc = require('../core/commonFunc');
const nodeStorage = require('../core/nodeStorage');
const configCommand = require('../config/config.command');
let symbolTemp = {};
// const configCommand = require('./config.command');

let dockerRoot = Path.join(config.rootPath, '../docker'); // todo 待改成自动获取


let dockerConfig = {
    execCwd: Path.normalize(Path.join(dockerRoot, '..')), // 执行命令的目录
    dockerRoot : dockerRoot, // docker目录
    bashCommandPath: 'bash', // git的bash路径
    hostName:'default',
    get composeYml(){
        return Path.join(dockerRoot, 'docker-compose-powershell.yml');
    },
    get dockerExe(){
        return configCommand.whereCommand('docker', 'config-exe.docker', null, true);
    },
    get dockerComposeExe(){
        return configCommand.whereCommand('docker-compose', 'config-exe.docker-compose', null, true);
    },
    get dockerMachineExe(){
        return configCommand.whereCommand('docker-machine', 'config-exe.docker-machine', null, true);
    },
    machineArgs: {
        driver: 'virtualbox',
        cap: '80', // cpu运行峰值
        memory: '666', // 内存大小
        noShare: true, // 不分享桌面
        addBridged: false, // 添加一个桥接网络
        bridgeadapter: 'Realtek PCIe GBE 系列控制器', // 界面名称
        sharedFolder: { // 共享目录，key为共享名，value为共享本地的路径
            'Users':'F:/code/www',
        },
        other: '', // 其他更多参数
    },
    get execOption(){ // 执行命令时的参数，todo 待整理
        return {
            cwd: this.execCwd,
            env: this.execEnv,
        };
    },
    get execEnv(){ // 执行exec时的env
        let temp = {};
        // 转多层数据为一层
        for (let k in this.env){
            Object.assign(temp, typeof this.env[k] !== 'object'?{[k]: this.env[k]}:this.env[k]);
        }

        return Object.assign(temp, this.env)
    },
    get configEnv(){ // 不获取process.env
        // 如出现getter的问题，可通过JSON.stringify
        return this.env;
    },
    get env(){ // 用于环境变量设置
        let key =  'containerConfig';
        symbolTemp[key] || (symbolTemp[key] = {});
        if (!nodeStorage.isUpdate(symbolTemp[key]['symbol'], key)){ // 数据是否更新，否则直接返回结果
            return symbolTemp[key]['data'];
        }
        symbolTemp[key]['symbol'] = nodeStorage.getUpdate(key);


        let e = {
            // php的--build-arg
            php:{
                compose_build_php_version:'5.6.24', // php版本号
                compose_build_php_configure_dir:'/usr/local/php', // php编译目录
                compose_build_php_dir:'/usr/src/php', // php安装目录
                // php验证用
                compose_build_php_sha256:'e1bbe33d6b4da66b15c483131520a9fc505eeb6629fa70c5cfba79590a1d0801',
                compose_build_php_gpg_keys:'0B96609E270F565C13292B24C13C70B87267B52D 0BD78B5F97500D450838F95DFE857D9A90D90EC1 F38252826ACD957EF380D39F2F7956BC5DA04B5D',
                compose_build_php_configure_args:'--enable-fpm', // php的编译参数
                compose_build_php_processes_num:15, // 并发安装扩展的数量
                // php的共享目录
                get compose_volumes_php_conf(){
                    return `${e.compose_dir}/php/conf/conf:/usr/src/php/conf/`;
                },
                get compose_volumes_php_etc(){
                    return `${e.compose_dir}/php/conf/etc/:/usr/src/php/etc/`;
                },
            },


            // nginx的--build-arg
            nginx: {
                compose_build_nginx_version:'1.10.1',
                compose_build_nginx_dir:'/usr/src/nginx',
                compose_build_nginx_args:`
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
                `,
                
                get compose_volumes_nginx(){ // nginx conf的共享目录
                    return `${e.compose_dir}/nginx/conf/:/usr/src/nginx/conf/`;
                },
            },

            // bash的--build-arg
            base:{
                compose_build_base_zone:'PRC',
            },


            // 特殊处理
            // vmOrVirtualBox:'', // todo


            // 其他
            host_volumes_www:'f:/code/www/', // 宿主机与容器的共享目录
            get compose_volumes_base(){ // 必须要匿名函数才能用this
                return `${e.host_volumes_www}:/www/`;
            },
            get compose_dir(){ // docker_lnmp下的docker在虚拟机的路径
                return `${e.host_volumes_www}github/docker_lnmp/docker`;
            },



            // todo docker-machine，待处理为自动识别
            // DOCKER_TLS_VERIFY: 1,
            // DOCKER_HOST: "tcp://192.168.99.100:2376",
            // DOCKER_CERT_PATH: "D:/PHP/box_list/Docker Toolbox/machines/default",
        };

        return symbolTemp[key]['data'] = commonFunc.objectMergeRecursive(e, nodeStorage.getItem(key));
    },

    'dockerProcessName': 'nodeDocker',
};


module.exports = new Proxy(dockerConfig, {
    get:(target, key) => {
        return Reflect.has(target, key) ? target[key] : false;
    },

    // set: () => {
    //     //
    // },
});

