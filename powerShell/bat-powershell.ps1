echo '启动容器...';

. ${PSScriptRoot}/start-machine.ps1;

if (-not $?){
    exit $?;
}

$backPwd = pwd;
cd "${rootPath}/../docker/";

if (dc ps -q){
    dc restart;
}else{
    dc up -d --build;
}


cd $backPwd.Path;
