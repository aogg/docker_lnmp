echo '执行NGINX容器内命令...';
if (!${PSScriptRoot}) {
    ${PSScriptRoot} = Split-Path -Parent $MyInvocation.MyCommand.Definition
}

. ${PSScriptRoot}/../exec-container.ps1 -containerName nginx @args

