$url  = "https://aka.ms/vs/17/release/vc_redist.x64.exe"
$dest = "C:\Users\Public\Documents\Circulens\training\vc_redist.x64.exe"

Write-Output "Downloading VC++ 2015-2022 Redistributable..."
Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
Write-Output "Downloaded: $((Get-Item $dest).Length) bytes"

Write-Output "Installing silently..."
$p = Start-Process -FilePath $dest -ArgumentList "/install","/quiet","/norestart" -Wait -PassThru
Write-Output "Exit code: $($p.ExitCode)"

if ($p.ExitCode -eq 0)    { Write-Output "INSTALLED OK — new installation" }
elseif ($p.ExitCode -eq 1638) { Write-Output "ALREADY UP TO DATE" }
else                      { Write-Output "WARNING: exit code $($p.ExitCode)" }
