$sp = "C:\Users\Public\Documents\Circulens\training\venv\Lib\site-packages"

Write-Output "=== Fixing corrupted torch install ==="

# Rename ~orch -> torch
$src1 = Join-Path $sp "~orch"
$dst1 = Join-Path $sp "torch"
if (Test-Path $src1) {
    if (Test-Path $dst1) {
        Write-Output "WARNING: torch already exists, removing first..."
        Remove-Item $dst1 -Recurse -Force
    }
    Rename-Item -Path $src1 -NewName "torch" -Force
    Write-Output "Renamed ~orch to torch"
} else {
    Write-Output "~orch not found, skipping"
}

# Rename ~orchgen -> torchgen
$src2 = Join-Path $sp "~orchgen"
$dst2 = Join-Path $sp "torchgen"
if (Test-Path $src2) {
    if (Test-Path $dst2) {
        Write-Output "WARNING: torchgen already exists, removing first..."
        Remove-Item $dst2 -Recurse -Force
    }
    Rename-Item -Path $src2 -NewName "torchgen" -Force
    Write-Output "Renamed ~orchgen to torchgen"
} else {
    Write-Output "~orchgen not found, skipping"
}

# Check torch version.py
$versionFile = Join-Path $sp "torch" "version.py"
if (Test-Path $versionFile) {
    $ver = Get-Content $versionFile | Select-String "__version__" | Select-Object -First 1
    Write-Output "torch version.py says: $ver"
}

Write-Output "=== Rename complete ==="

# Verify
$torchDir = Join-Path $sp "torch"
if (Test-Path $torchDir) {
    Write-Output "VERIFY OK: torch directory exists"
} else {
    Write-Output "ERROR: torch directory NOT found after rename"
}
