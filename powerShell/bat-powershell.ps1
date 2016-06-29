echo '启动容器...';

. ${PSScriptRoot}/start-machine.ps1

if (-not $?){
    exit $?;
}

$backPwd = pwd;
cd "${rootPath}/../docker/";

dc up -d --force-recreate;

cd $backPwd.Path
