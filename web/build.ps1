$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
Set-Location "C:\Users\Public\Documents\Circulens\web"
& "C:\Program Files\nodejs\npm.cmd" run build
Write-Output "BUILD_EXIT_CODE:$LASTEXITCODE"
