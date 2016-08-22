echo '启动容器...';
if (!${PSScriptRoot}) {
    ${PSScriptRoot} = Split-Path -Parent $MyInvocation.MyCommand.Definition
}

. ${PSScriptRoot}/start-machine.ps1;

if (-not $?){
    exit $?;
}

$backPwd = pwd;
cd "${rootPath}/../";

if (dc ps -q){
    dc restart;
}else{
    dc up -d --build;
}


cd $backPwd.Path;
