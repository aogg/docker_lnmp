@echo off



cd /d %~dp0
cd powershell

set "PSExecutionPolicyPreference=RemoteSigned"
more bat.ps1 | PowerShell -noprofile -
Pause

echo '°Ý°Ý';