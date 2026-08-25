$base = "C:\Users\Public\Documents\Circulens\dataset\Mehedi2"
$splits = @("train","val","test")
$classes = @("cercospora","healthy","mites_and_trips","nutritional","powdery mildew")
Write-Output "=== UNIQUE IMAGE COUNT PER CLASS (by filename dedup) ==="
$grandTotal = 0
foreach ($cls in $classes) {
    $uniqueNames = @{}
    $splitCounts = @{}
    foreach ($split in $splits) {
        $path = Join-Path $base ($split + "\" + $cls)
        if (Test-Path $path) {
            $files = Get-ChildItem -LiteralPath $path -File
            $splitCounts[$split] = $files.Count
            foreach ($f in $files) { $uniqueNames[$f.Name] = 1 }
        }
    }
    $total = ($splitCounts.Values | Measure-Object -Sum).Sum
    $unique = $uniqueNames.Count
    $grandTotal += $total
    Write-Output ("Class: " + $cls)
    Write-Output ("  train=" + $splitCounts["train"] + "  val=" + $splitCounts["val"] + "  test=" + $splitCounts["test"] + "  raw_total=" + $total + "  unique_filenames=" + $unique)
}
Write-Output ("Grand total raw: " + $grandTotal)
