#!/usr/bin/env bash

# sudo rm -rf /etc/apt/sources.list.d/ /var/lib/apt/lists/partial/  && apt update
# set -e





# 安装函数
function install_so(){
    {
        local tag_dir=''

        if  ext_config_value_exists $EXT_DEPEND; then
            # 等待apt
            apt_get_fifo
        fi



        processes_get_fifo

        # 检测依赖扩展
        if [[ $install_json_bool > 0 ]];then
            check_not_installed "$EXT_SORT"
        fi

        echo -e "\e[1;1m ==========================${EXT_NAME}开始===================== \e[0m" 1>&2

    	if [[ -d $EXT_TGZ_DIR ]]; then
    		tag_dir=$EXT_TGZ_DIR
    	elif  ext_config_value_exists $EXT_URL; then 
    		tag_dir=$temp_dir/$EXT_NAME
            tar_file_path=${tag_dir}/${EXT_NAME}'.tgz'

            mkdir -p $tag_dir
    		# 定义下载回来默认文件名
            curl_s "$EXT_URL" "${tar_file_path}"
            
    		untar $EXT_URL_TYPE ${tar_file_path} $tag_dir

            if [[ $install_json_bool > 0 ]];then
                # 删除压缩包
                rm -rf "${tag_dir}.tgz"
            fi
    	fi


        ext_no_make=0
        if ext_config_value_exists $EXT_EVAL; then
            # 可通过ext_no_make跳过make阶段
            eval $EXT_EVAL
        fi


        if [[ $ext_no_make < 1 ]]; then
            cd $tag_dir
            # 进入编译目录，如果没有找到会跑到用户目录去
            cd `find ./ \( -iname 'config.m4' -o -iname 'config0.m4' \) -exec dirname {} \;`
            # config0.m4改为config.m4
            if [[ -f config0.m4 ]]; then
                mv config0.m4 config.m4
            fi

            phpize
            ./configure $EXT_ARG
            make && make install

            # 删除网络包，install.json安装时才删除
            if [[ (! -d $EXT_TGZ_DIR) && $install_json_bool > 0 ]]; then
                rm -fr $tag_dir
            else
                echo '==============================='$tag_dir'============================' 1>&2
            fi
        fi

        processes_write_fifo
    } 1> ${log_fd}
	# }

	# 生成的so文件复制到php.ini指定的目录下
	# cp $(php-config --extension-dir)/* $(php -r 'echo ini_get("extension_dir");')
	
	echo -e "\e[1;33m ==========================${EXT_NAME}完成===================== \e[0m"

    echo "$EXT_NAME" >> $installed_path
}



# 主方法
php_ext_main(){
    echo -e "\e[30;46m ==========================开始安装PHP扩展===================== \e[0m"
    # 保持目录
    cd $root_dir;
    config_path=$root_dir/config.json
    install_json_path=$root_dir/install.json
    # docker的共享目录无法执行编译操作和fifo
    temp_dir=/tmp/php-ext/temp
    fifo_tmp_dir='/tmp/php-ext/docker_fifo'
    fifo_path=$fifo_tmp_dir/fifo_apt_update
    installed_path=$fifo_tmp_dir/file_installed
    fifo_lock='ext_apt_update_lock'
    # 同步安装数量，使用环境变量
    processes_num=${PHP_PROCESSES_NUM:-15}
    processes_path=$fifo_tmp_dir/fifo_processes
    install_json_bool=1 # 是否通过install.json安装，默认是，否为通过指定扩展安装


    mkdir -p ${temp_dir} ${fifo_tmp_dir}
    touch $installed_path
    echo '' > $installed_path; # 清空

    # 判断文件是否存在
    if [[ -f ${config_path} ]]; then
        # config.json内容
        # @todo 待优化为(?<!:)，不支持url中包含#的，同时处理/usr/local/php，使用环境变量
        config_json_text=`grep -v -E "#|([^:]//)|(^//)" ${config_path} | sed "s#\/usr\/local\/php\/#${PHP_CONFIGURE_DIR}\/#g"`
        configNum=$(echo ${config_json_text} | jq '.|length')
        if [[ $1 ]]; then
            install_json_bool=0
            install_json_text=$1
        elif [[ -f ${install_json_path} ]]; then
            # install.json内容
            install_json_text=`grep -v -E "#|//" ${install_json_path}`
        fi

        # 在docker的数据卷中无法mkfifo
        trap "apt_end_fifo ${fifo_path};processes_end_fifo ${processes_path};exit;" 2
        mkfifo ${fifo_path}
        apt_exec_fifo ${fifo_path}
        apt_write_fifo $fifo_lock
        # 并发控制
        mkfifo ${processes_path}
        processes_exec_fifo ${processes_path}
        for (( i = 0; i < $processes_num; i++ )); do
            processes_write_fifo
        done


        install_ext_depend

        # 循环安装
        for (( i = 0; i < $configNum; i++ )); do
            # 保持目录
            cd $root_dir;
            #判断是否安装
            EXT_INSTALL=$(echo ${config_json_text} | jq ".[$i].EXT_INSTALL"|sed 's/\"//g');
            # 目录名，扩展名
            EXT_NAME=$(echo ${config_json_text} | jq -r ".[$i].EXT_NAME");

            if [[ ! -f ${install_json_path} && $EXT_INSTALL != 1 ]] || \
             # 已安装
             [[ $(grep "${EXT_NAME}" $installed_path | wc -l) < 0 ]] || \
             [[ -f ${install_json_path} && ! ( \
                $(echo ${install_json_text} | jq -r ".[0]") == 'all' || \
                $(echo ${install_json_text} | jq -r ".[]" | grep -e "^${EXT_NAME}$") \
              ) ]]; then
                # 不安装
                continue;
            fi



            # 下载文件地址
            EXT_URL=$(echo ${config_json_text} | jq -r ".[$i].EXT_URL");
            # 安装顺序
            EXT_SORT=$(echo ${config_json_text} | jq -r ".[$i][\"EXT_SORT\"]");
            # 编译参数
            EXT_ARG=$(echo ${config_json_text} | jq -r ".[$i].EXT_ARG"  | sed 's/^null$//i');
            # 已有的源码路径，用于安装如mysqli这类在php安装包里自带有源码扩展的扩展
            EXT_TGZ_DIR=$(echo ${config_json_text} | jq -r ".[$i].EXT_TGZ_DIR");
            # 扩展依赖（存在即安装），通过apt-get安装，可用apt-cache search来搜索对应名称
            EXT_DEPEND=$(echo $(echo ${config_json_text} | jq -r ".[$i].EXT_DEPEND"));
            # 执行自定义命令
            EXT_EVAL=$(echo $(echo ${config_json_text} | jq -r ".[$i].EXT_EVAL"));
            # 下载文件后解压命令类型
            EXT_URL_TYPE=$(echo $(echo ${config_json_text} | jq -r ".[$i].EXT_URL_TYPE"));

            install_so&
        done


        # 等待所有后台任务执行完毕
        wait
    else
        install_so
    fi

}



# 一次安装所有需要的扩展
install_ext_depend(){
    local num=$(echo ${config_json_text} | jq '.|length')
    local ext_depend=''
    local temp_ext_depend=''
    local ext_depend_num=0
    # [[ -f ${install_json_path} && ! ($(echo ${install_json_text} | jq -r ".[0]") == 'all' ||
    # $(echo ${install_json_text} | jq -r ".[]" | grep -e "^${EXT_NAME}$")) ]]
    if [[ -f ${install_json_path} && $(echo ${install_json_text} | jq -r ".[0]") == 'all' ]]; then
        # 安装所有
        ext_depend=`echo ${config_json_text} | jq -r '.[].EXT_DEPEND' | tr -s "\n" " "`
        ext_depend_num=`echo ${config_json_text} | jq -r '.[].EXT_DEPEND' | grep -v -e "^\s*$" | wc -l`
    else

        for (( i = 0; i < $num; i++ )); do
            temp_ext_depend=$(echo $(echo ${config_json_text} | jq -r ".[$i].EXT_DEPEND"))
    
            # 目录名，扩展名
            temp_ext_name=$(echo ${config_json_text} | jq -r ".[$i].EXT_NAME");
            if [[ ! -f ${install_json_path} && $(echo ${config_json_text} | jq -r ".[$i].EXT_INSTALL") != 1 ]] || ([[ -f ${install_json_path} && $(echo ${install_json_text} | jq -r ".[]" | grep -e "^${temp_ext_name}$") ]] && ext_config_value_exists $temp_ext_depend ); then
                ext_depend+=' '${temp_ext_depend}
                ((ext_depend_num++))
            fi
        done
    fi

    # 去除第一个空格
    ext_depend=`echo $ext_depend | sed 's/^\s+//g'`

    if ext_config_value_exists $ext_depend; then
        {
            apt_get_fifo
            # if [[ $fifo_val == $fifo_lock ]]; then
            # fi

            echo -e "\e[1;1m ==========================apt开始===================== \e[0m" 1>&2
            apt update

            # 不支持并发执行
            apt install -y --no-install-recommends $ext_depend

            echo -e "\e[1;33m ==========================apt完成===================== \e[0m" 1>&2

            # @todo 可改用信号
            for (( i = 0; i < $ext_depend_num; i++ )); do
                apt_write_fifo
            done
            
        } 1> ${log_fd} &
        # } &
        # 等待查找
        # sleep 2
    fi
}

# 检查是否存在值
ext_config_value_exists(){
    if [[ $1 > 0 && $1 != null ]]; then
        # 成功
        return 0
    else
        return 1
    fi
}

# $1 写入的内容
apt_write_fifo(){
    echo "$1">&33
}


apt_get_fifo(){
    local row=''
    read -u33 row
    echo $row
}

# $1 fifo地址
apt_exec_fifo(){
    exec 33<>$1
    rm -fr $1
}

apt_end_fifo(){
    rm -fr $1;
    exec 33>&-;
    exec 33<&-;
}

processes_end_fifo(){
    rm -fr $1;
    exec 32>&-;
    exec 32<&-;
}


# $1 写入的内容
processes_write_fifo(){
    echo "$1" >&32
}


processes_get_fifo(){
    local row=''
    read -u32 row
    echo $row
}

# $1 fifo地址
processes_exec_fifo(){
    exec 32<>$1
    rm -fr $1
}


# 控制curl是否显示进度条
curl_s(){
    # 多任务需要下载时有可能失败
    if [[ $log_fd = '/dev/null' ]]; then
        curl -L --retry 3 -fs "$1" -o "$2"
    else
        curl -L --retry 3 -f "$1" -o "$2"
    fi
}

# 多种解压方式
untar(){
    if [[ $1 == 'zip' ]]; then
        unzip -o $2 -d $3
    else
        tar -zxf "$2" -C $3
    fi
}



function check_not_installed(){
    local val;

    if ! ext_config_value_exists "$1"; then
        # 可以安装
        return 1
    fi

    local check_arr=$(echo $1|jq -r ".[]")

    for val in $check_arr; do
        if [[ `grep "${val}" ${installed_path} | wc -l` < 1 ]]; then
        cat $installed_path 1>&2;
        echo $val 1>&2;
            processes_reset_fifo "$EXT_NAME"
            check_not_installed "$1"
            return;
        fi
        echo 'success install'; 1>&2;
        echo $val 1>&2;
    done

    return 1
}



function processes_reset_fifo(){
    processes_write_fifo
    echo '重新构建'$1 1>&2;
    sleep 1
    processes_get_fifo
}




# 执行
start_time=`date "+%s"`
root_dir=$(cd $(dirname $0);pwd)
log_fd='/dev/null'
# 支持 ./php-ext.sh curl
if [[ $# > 0 ]]; then
    # 直接调用时显示输出
    log_fd='/proc/self/fd/1'

    opt_json_text=''
    for i in $*; do
        opt_json_text+='"'${i}'",'
    done
    opt_json_text='['${opt_json_text:0:-1}']'

    # 传参安装
    php_ext_main $opt_json_text
else
    # 用install安装
    php_ext_main;
fi


let end_time=`date "+%s"`-start_time

echo -e "\e[30;46m ---------------------------------Time : "${end_time}"--------------------------------------- \e[0m"
echo 