# 最好配置完整路径
Set-Alias dm "docker-machine.exe";
Set-Alias de "docker.exe";
Set-Alias vm "VBoxManage.exe";



function dc(){
    docker-compose.exe -f "${composeYml}" $args;
}
