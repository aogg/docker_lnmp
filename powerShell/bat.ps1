
$tmpError = $ErrorActionPreference
$ErrorActionPreference = 'SilentlyContinue'

# 待优化
if  ((Get-ExecutionPolicy) -eq 'Restricted' ){
    
    Set-ExecutionPolicy RemoteSigned

    if (-not $?) {
        echo '第一次请右键以管理员身份运行，之后就不用';
        exit;
    }


    echo '成功修改执行策略！请再次以 非管理员 身份运行！';
    exit;
}
$ErrorActionPreference = $tmpError



./bat-powershell.ps1
