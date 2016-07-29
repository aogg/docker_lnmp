if (!${PSScriptRoot}) {
    ${PSScriptRoot} = Split-Path -Parent $MyInvocation.MyCommand.Definition
}
. ${PSScriptRoot}/start-machine.ps1;

if (-not $?){
    exit $?;
}

$backPwd = pwd;
cd "${rootPath}/../docker/";

dc @args;

cd $backPwd.Path;
