// docker容器配置
const Path = require('path');
const commonFunc = require('../core/commonFunc');
const nodeStorage = require('../core/nodeStorage');
const configCommand = require('../config/config.command');
let symbolTemp = {};
// const configCommand = require('./config.command');

let dockerRoot = config.dockerPath;


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

        return Object.assign(temp, process.env);
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
        let envP = process.env;


        let e = {
            // php的--build-arg
            php:{
                compose_build_php_version: envP.compose_build_php_version, // php版本号
                compose_build_php_configure_dir: envP.compose_build_php_configure_dir, // php编译目录
                compose_build_php_dir: envP.compose_build_php_dir, // php安装目录
                // php验证用
                compose_build_php_sha256: envP.compose_build_php_sha256,
                compose_build_php_gpg_keys: envP.compose_build_php_gpg_keys,
                compose_build_php_configure_args: envP.compose_build_php_configure_args, // php的编译参数
                compose_build_php_processes_num: envP.compose_build_php_processes_num, // 并发安装扩展的数量
                compose_build_php_apt_install: envP.compose_build_php_apt_install, // php的apt install
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
                compose_build_nginx_version: envP.compose_build_nginx_version,
                compose_build_nginx_dir: envP.compose_build_nginx_dir,
                compose_build_nginx_args: envP.compose_build_nginx_args,
                
                get compose_volumes_nginx(){ // nginx conf的共享目录
                    return `${e.compose_dir}/nginx/conf/:/usr/src/nginx/conf/`;
                },
            },

            // bash的--build-arg
            base:{
                compose_build_base_zone: envP.compose_build_base_zone,
            },


            // 特殊处理
            // vmOrVirtualBox:'', // todo


            // 其他
            // host_volumes_www:'E:/code/www/', // 宿主机与容器的共享目录
            get compose_volumes_base(){ // 必须要匿名函数才能用this
                return `${e.host_volumes_www}:/www/`;
            },
            get compose_dir(){ // docker_lnmp下的docker在虚拟机的路径
                return `${e.host_volumes_www}github/docker_lnmp/docker`;
            },



            // todo docker-machine，待处理为自动识别
            host_volumes_www:'/www/', // 宿主机与容器的共享目录
            // DOCKER_TLS_VERIFY: "1",
            // DOCKER_HOST: "tcp://192.168.99.100:2376",
            // DOCKER_CERT_PATH: "C:/Users/code/.docker/machine/machines/default",
            // COMPOSE_CONVERT_WINDOWS_PATHS: 'true', // 会导致在window中执行会将composer.yml的volumes里本地路径改为\，这样就无法启动了
            DOCKER_MACHINE_NAME: 'default',
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

