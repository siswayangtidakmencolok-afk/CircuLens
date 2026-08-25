$outFile = "C:\Users\Public\Documents\Circulens\pydetect_out.txt"
$out = @()

$candidates = @(
    "C:\Users\User\AppData\Local\Microsoft\WindowsApps\python.exe",
    "C:\Users\User\AppData\Local\Programs\Python\Python312\python.exe",
    "C:\Users\User\AppData\Local\Programs\Python\Python311\python.exe",
    "C:\Users\User\AppData\Local\Programs\Python\Python310\python.exe",
    "C:\Users\User\AppData\Local\Programs\Python\Python39\python.exe",
    "C:\Python312\python.exe",
    "C:\Python311\python.exe",
    "C:\Python310\python.exe"
)

foreach ($c in $candidates) {
    if (Test-Path -LiteralPath $c) {
        $out += "FOUND: $c"
        try {
            $ver = & $c --version 2>&1
            $out += "  VERSION: $ver"
        } catch {
            $out += "  VERSION: ERROR - $_"
        }
    } else {
        $out += "NOT FOUND: $c"
    }
}

$envPy = Get-Command python -ErrorAction SilentlyContinue
if ($envPy) { 
    $out += "PATH python: $($envPy.Source)"
    try {
        $ver = & python --version 2>&1
        $out += "  VERSION: $ver"
    } catch {}
} else {
    $out += "PATH python: NOT IN PATH"
}

$envPy3 = Get-Command python3 -ErrorAction SilentlyContinue
if ($envPy3) { $out += "PATH python3: $($envPy3.Source)" } else { $out += "PATH python3: NOT IN PATH" }

$envPy2 = Get-Command py -ErrorAction SilentlyContinue
if ($envPy2) { 
    $out += "PATH py launcher: $($envPy2.Source)"
    try {
        $ver = & py --version 2>&1
        $out += "  VERSION: $ver"
    } catch {}
} else { 
    $out += "PATH py launcher: NOT IN PATH"
}

$out | Set-Content -Path $outFile -Encoding UTF8
Write-Host "Detection complete. Results at $outFile"
