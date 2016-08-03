if (!${PSScriptRoot}) {
    ${PSScriptRoot} = Split-Path -Parent $MyInvocation.MyCommand.Definition
}

. ${PSScriptRoot}/common.ps1;

if ((de -v) -match 'version [01]\.((0[0-9])|1[01])') { # 这是v1.12
    . ${rootPath}/create-machine.ps1;

    if (-not $?){
    exit $?;
    }

    $status = dm status $hostName;
    if ($status -eq 'Stopped') {
    # 开启虚拟机
    dm start $hostName;

    }

    dm env $hostName | Invoke-Expression;

    echo '虚拟机ip地址为：';
    dm ip $hostName;
}else { # v1.12后都为自带的vm
    
}

