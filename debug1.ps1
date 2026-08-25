$base = "C:\Users\Public\Documents\Circulens\dataset\Mehedi2"
$path = Join-Path $base "train\cercospora"
Write-Output "Testing path: $path"
Write-Output "Exists: $(Test-Path $path)"
$files = Get-ChildItem -LiteralPath $path -File | Select-Object -First 5
Write-Output "File count sample: $($files.Count)"
foreach ($f in $files) {
    Write-Output "  FILE: $($f.Name)"
}
Write-Output "DONE"
