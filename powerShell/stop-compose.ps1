echo '停止容器...';

. ${PSScriptRoot}/common.ps1

if (-not $?){
    exit $?;
}

$backPwd = pwd;
cd "${rootPath}/../docker/";

dc stop;

cd $backPwd.Path
