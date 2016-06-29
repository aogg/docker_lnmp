param(
    [string]$containerName = $args['0'],
    [switch]$start
)

if  ($start){
    . ${PSScriptRoot}/start-machine.ps1

    if (-not $?){
        exit $?;
    }
}else{
    # 直接common.ps1即可
    . ${PSScriptRoot}/common.ps1
}



$backPwd = pwd;
cd "${rootPath}/../docker/";

if ($containerName) {
    # 做容器简称对应完整容器名称
    $containerString = dc ps $containerName;
    $fullContainerName = ((echo $containerString | findstr Up) -split '\s+')[0]

    if ($fullContainerName) {
        de exec $fullContainerName $args;
    }else{
        throw("未知或未启动的容器名称：${fullContainerName}");
    }
}else{
    throw("必须指定容器名称");
}


cd $backPwd.Path
