. ${PSScriptRoot}/create-machine.ps1

if (-not $?){
  exit $?;
}

$status = dm status $hostName
if ($status -eq 'Stopped') {
  # 开启虚拟机
  dm start $hostName

}

dm env $hostName | Invoke-Expression

echo '虚拟机ip地址为：';
dm ip