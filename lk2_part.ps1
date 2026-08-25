$classes = @("cercospora","healthy","mites_and_trips","nutritional","powdery mildew")
$hashMap = @{}
$count = 0
Write-Output "=== HASH DUPLICATE CHECK ==="
Write-Output "Total files hashed: $count"
Write-Output "Duplicate file groups: $($dups.Count)"
$crossSplit = $dups | Where-Object { $sf = $_.Value | ForEach-Object { ($_ -split "/")[0] } | Select-Object -Unique; ($sf | Measure-Object).Count -gt 1 }
Write-Output "Cross-split duplicates: $($crossSplit.Count)"
foreach ($dup in $crossSplit | Select-Object -First 20) { Write-Output "  DUP_HASH: $($dup.Key.Substring(0,8))... -> $($dup.Value -join " | ")" }
$intraSplit = $dups | Where-Object { $sf = $_.Value | ForEach-Object { ($_ -split "/")[0] } | Select-Object -Unique; ($sf | Measure-Object).Count -eq 1 }
Write-Output "Within-split duplicates: $($intraSplit.Count)"
