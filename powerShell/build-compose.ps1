echo '编译容器...';

. ${PSScriptRoot}/start-machine.ps1;

if (-not $?){
    exit $?;
}

$backPwd = pwd;
cd "${rootPath}/../docker/";
dc build;


cd $backPwd.Path;