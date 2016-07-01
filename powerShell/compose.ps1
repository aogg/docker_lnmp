. ${PSScriptRoot}/start-machine.ps1

if (-not $?){
    exit $?;
}

$backPwd = pwd;
cd "${rootPath}/../docker/";

dc @args;

cd $backPwd.Path
