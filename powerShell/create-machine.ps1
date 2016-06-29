. ${PSScriptRoot}/common.ps1


# 添加共享文件夹
function add-vmShareFolder($hostname, $name, $hostpath){
    vm sharedfolder add "$hostname" --name "$name" --hostpath "$hostpath"

    if (-not $?){
        echo "添加${hostName}的${name}共享目录失败";
        exit 11;
    }
}


# 精确匹配
$name = dm ls --filter "name=^${hostName}$" --format "{{.Name}}"


if ($name -ne $hostName) {
    echo "创建主机${hostName}";
    if ($machineArgs['noShare']) {
        $machineArgs['noShare']  = '--virtualbox-no-share'
    }else{
        $machineArgs['noShare']  = ''
    }

    dm create -d $machineArgs['driver'] --virtualbox-memory $machineArgs['memory'] $machineArgs['noShare'] $machineArgs['other'] $hostName

    if (-not $?) {
        echo "创建${hostName}失败";
        exit 1;
    }

    # 需要关闭才能添加
    dm stop $hostName;
    # 添加桥接网络
    if ($machineArgs['addBridged']) {
        echo '添加桥接网络';
        vm modifyvm "${hostName}" --nic3 bridged --bridgeadapter3 $machineArgs['bridgeadapter']
    }

    # 添加其他共享目录
    if ($machineArgs['sharedFolder'].count) {
        echo '添加共享目录';
        foreach ($sharedFolderKey in $machineArgs['sharedFolder'].Keys){
            add-vmShareFolder -hostname $hostName -name $sharedFolderKey -hostpath $machineArgs['sharedFolder'][$sharedFolderKey];
        }
    }
    

    # 处理虚拟机的cap
    if ($machineArgs['cap']) {
        vm modifyvm "${hostName}" --cpuexecutioncap $machineArgs['cap']
    }
}


