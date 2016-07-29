if (!${PSScriptRoot}) {
    ${PSScriptRoot} = Split-Path -Parent $MyInvocation.MyCommand.Definition
}

. ${PSScriptRoot}/common.ps1;


dm rm -f -y $hostName;
