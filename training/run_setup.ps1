# Wrapper: clean venv, then run setup_env.ps1, capturing all output to file
$outFile = "C:\Users\Public\Documents\Circulens\training\setup_out_final.txt"
$venv = "C:\Users\Public\Documents\Circulens\training\venv"

# Start fresh output file
"=== run_setup.ps1 started: $(Get-Date) ===" | Out-File -FilePath $outFile -Encoding UTF8

# Step 1: Remove existing venv
if (Test-Path -LiteralPath $venv) {
    "Removing existing venv at $venv" | Out-File -FilePath $outFile -Append -Encoding UTF8
    Remove-Item -LiteralPath $venv -Recurse -Force
    "Removed OK" | Out-File -FilePath $outFile -Append -Encoding UTF8
} else {
    "No existing venv to remove" | Out-File -FilePath $outFile -Append -Encoding UTF8
}

# Step 2: Run setup_env.ps1 and capture output
"=== Running setup_env.ps1 ===" | Out-File -FilePath $outFile -Append -Encoding UTF8
$result = & "C:\Users\Public\Documents\Circulens\training\setup_env.ps1" 2>&1
$result | Out-File -FilePath $outFile -Append -Encoding UTF8

"=== run_setup.ps1 finished: $(Get-Date) ===" | Out-File -FilePath $outFile -Append -Encoding UTF8
