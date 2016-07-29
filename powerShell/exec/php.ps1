echo '执行PHP容器内命令...';
if (!${PSScriptRoot}) {
    ${PSScriptRoot} = Split-Path -Parent $MyInvocation.MyCommand.Definition
}

. ${PSScriptRoot}/../exec-container.ps1 -containerName php @args

