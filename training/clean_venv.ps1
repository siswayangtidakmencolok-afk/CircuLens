$venv = "C:\Users\Public\Documents\Circulens\training\venv"
if (Test-Path -LiteralPath $venv) {
    Write-Output "Removing existing venv at $venv"
    Remove-Item -LiteralPath $venv -Recurse -Force
    Write-Output "Removed OK"
} else {
    Write-Output "No venv to remove"
}
