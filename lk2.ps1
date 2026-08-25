$base = "C:\Users\Public\Documents\Circulens\dataset\Mehedi2"
$splits = @("train","val","test")
$classes = @("cercospora","healthy","mites_and_trips","nutritional","powdery mildew")
$hashMap = @{}
$count = 0
foreach ($split in $splits) { foreach ($cls in $classes) { $path = Join-Path $base "$split\$cls"; if (Test-Path $path) { $files = Get-ChildItem -LiteralPath $path -File; foreach ($f in $files) { $hash = (Get-FileHash -LiteralPath $f.FullName -Algorithm MD5).Hash; $entry = "$split/$cls/$($f.Name)"; if (-not $hashMap.ContainsKey($hash)) { $hashMap[$hash] = [System.Collections.Generic.List[string]]::new() }; $hashMap[$hash].Add($entry); $count++; if ($count % 1000 -eq 0) { Write-Output "Hashed $count files..." } } } } }
$dups = $hashMap.GetEnumerator() | Where-Object { $_.Value.Count -gt 1 }
Write-Output "=== HASH DUPLICATE CHECK ==="
Write-Output "Total files hashed: $count"
Write-Output "Duplicate file groups (same content): $($dups.Count)"
$crossSplit = $dups | Where-Object { $splits_found = $_.Value | ForEach-Object { ($_ -split "/")[0] } | Select-Object -Unique; ($splits_found | Measure-Object).Count -gt 1 }
Write-Output "Cross-split duplicates (actual leakage): $($crossSplit.Count)"
foreach ($dup in $crossSplit | Select-Object -First 20) { Write-Output "  DUP_HASH: $($dup.Key.Substring(0,8))... -> $($dup.Value -join " | ")" }
$intraSplit = $dups | Where-Object { $splits_found = $_.Value | ForEach-Object { ($_ -split "/")[0] } | Select-Object -Unique; ($splits_found | Measure-Object).Count -eq 1 }
Write-Output "Within-split duplicates: $($intraSplit.Count)"
