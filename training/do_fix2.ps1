# Retry VC++ Redistributable download with multiple attempts and resume support
$logFile = "C:\Users\Public\Documents\Circulens\training\fix_log2.txt"
$url = "https://aka.ms/vs/17/release/vc_redist.x64.exe"
$dest = "C:\Users\Public\Documents\Circulens\training\vc_redist.x64.exe"

"=== VC++ Redistributable Download (Retry) ===" | Out-File $logFile -Encoding UTF8

# Remove any partial download
if (Test-Path $dest) {
    $existSize = (Get-Item $dest).Length
    "Removing partial download ($existSize bytes)" | Add-Content $logFile
    Remove-Item $dest -Force
}

$maxRetries = 3
$success = $false
for ($i = 1; $i -le $maxRetries; $i++) {
    "Attempt $i of $maxRetries..." | Add-Content $logFile
    try {
        # Use .NET WebClient which handles large files better than Invoke-WebRequest
        $wc = New-Object System.Net.WebClient
        $wc.Headers.Add("User-Agent", "Mozilla/5.0")
        $wc.DownloadFile($url, $dest)
        if (Test-Path $dest) {
            $size = (Get-Item $dest).Length
            "Downloaded $size bytes" | Add-Content $logFile
            if ($size -gt 1000000) {
                "Download successful!" | Add-Content $logFile
                $success = $true
                break
            } else {
                "File too small, retrying..." | Add-Content $logFile
                Remove-Item $dest -Force -ErrorAction SilentlyContinue
            }
        }
    } catch {
        $errMsg = $_.ToString()
        "Error on attempt $i`: $errMsg" | Add-Content $logFile
        Start-Sleep -Seconds 5
    }
}

if (-not $success) {
    "All download attempts failed" | Add-Content $logFile
    exit 1
}

"Installing VC++ Redistributable..." | Add-Content $logFile
$proc = Start-Process -FilePath $dest -ArgumentList "/install", "/quiet", "/norestart" -Wait -PassThru
"Exit code: $($proc.ExitCode)" | Add-Content $logFile
if ($proc.ExitCode -eq 0 -or $proc.ExitCode -eq 1638) {
    "VC++ Redistributable installed successfully" | Add-Content $logFile
} else {
    "WARNING: Unexpected exit code $($proc.ExitCode)" | Add-Content $logFile
}

"=== DONE ===" | Add-Content $logFile
