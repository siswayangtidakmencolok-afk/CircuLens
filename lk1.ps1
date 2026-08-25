$base = "C:\Users\Public\Documents\Circulens\dataset\Mehedi2"
$splits = @("train","val","test")
$classes = @("cercospora","healthy","mites_and_trips","nutritional","powdery mildew")
$allFiles = @{}
foreach ($split in $splits) { foreach ($cls in $classes) { $path = Join-Path $base "$split\$cls"; if (Test-Path $path) { $files = Get-ChildItem -LiteralPath $path -File; foreach ($f in $files) { $key = $f.Name; if (-not $allFiles.ContainsKey($key)) { $allFiles[$key] = [System.Collections.Generic.List[string]]::new() }; $allFiles[$key].Add("$split/$cls") } } } }
$leaks = $allFiles.GetEnumerator() | Where-Object { $_.Value.Count -gt 1 }
Write-Output "=== FILENAME LEAKAGE CHECK ==="
Write-Output "Total unique filenames: $($allFiles.Count)"
Write-Output "Filenames appearing in multiple splits: $($leaks.Count)"
foreach ($leak in $leaks | Select-Object -First 30) { Write-Output "  LEAK: $($leak.Key) -> $($leak.Value -join "","")"}
