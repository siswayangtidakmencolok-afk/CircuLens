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
        $ver = & $c --version 2>&1
        $out += "  VERSION: $ver"
    }
}
$envPy = Get-Command python -ErrorAction SilentlyContinue
if ($envPy) { $out += "PATH python: $($envPy.Source)" }
$envPy3 = Get-Command python3 -ErrorAction SilentlyContinue
if ($envPy3) { $out += "PATH python3: $($envPy3.Source)" }
$envPy2 = Get-Command py -ErrorAction SilentlyContinue
if ($envPy2) { $out += "PATH py launcher: $($envPy2.Source)" }
if ($out.Count -eq 0) { $out += "NO PYTHON FOUND" }
$out | ForEach-Object { Write-Output $_ }
