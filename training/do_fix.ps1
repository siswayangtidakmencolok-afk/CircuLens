# Step 1: Check VC++ registry
"=== VC++ Check ===" | Out-File "C:\Users\Public\Documents\Circulens\training\fix_log.txt" -Encoding UTF8

$k1 = "HKLM:\SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64"
$k2 = "HKLM:\SOFTWARE\WOW6432Node\Microsoft\VisualStudio\14.0\VC\Runtimes\x64"

foreach ($k in @($k1, $k2)) {
    if (Test-Path $k) {
        $p = Get-ItemProperty $k -ErrorAction SilentlyContinue
        "Found: $k  Version=$($p.Version) Installed=$($p.Installed)" | Add-Content "C:\Users\Public\Documents\Circulens\training\fix_log.txt"
    } else {
        "NOT found: $k" | Add-Content "C:\Users\Public\Documents\Circulens\training\fix_log.txt"
    }
}

$pkgs = @()
$pkgs += Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*" -EA SilentlyContinue | Where-Object {$_.DisplayName -like "*Visual C++*"} | Select-Object DisplayName, DisplayVersion
$pkgs += Get-ItemProperty "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*" -EA SilentlyContinue | Where-Object {$_.DisplayName -like "*Visual C++*"} | Select-Object DisplayName, DisplayVersion

"Installed VC++ packages:" | Add-Content "C:\Users\Public\Documents\Circulens\training\fix_log.txt"
$pkgs | ForEach-Object { "$($_.DisplayName) $($_.DisplayVersion)" | Add-Content "C:\Users\Public\Documents\Circulens\training\fix_log.txt" }

# Step 2: Download and install VC++ Redistributable
"=== Downloading VC++ Redistributable ===" | Add-Content "C:\Users\Public\Documents\Circulens\training\fix_log.txt"
$url = "https://aka.ms/vs/17/release/vc_redist.x64.exe"
$dest = "C:\Users\Public\Documents\Circulens\training\vc_redist.x64.exe"
try {
    Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
    $size = (Get-Item $dest).Length
    "Downloaded: $size bytes" | Add-Content "C:\Users\Public\Documents\Circulens\training\fix_log.txt"
} catch {
    "ERROR downloading: $_" | Add-Content "C:\Users\Public\Documents\Circulens\training\fix_log.txt"
    exit 1
}

"Installing VC++ Redistributable..." | Add-Content "C:\Users\Public\Documents\Circulens\training\fix_log.txt"
$proc = Start-Process -FilePath $dest -ArgumentList "/install", "/quiet", "/norestart" -Wait -PassThru
"Exit code: $($proc.ExitCode)" | Add-Content "C:\Users\Public\Documents\Circulens\training\fix_log.txt"

"=== DONE ===" | Add-Content "C:\Users\Public\Documents\Circulens\training\fix_log.txt"
