$base = "C:\Users\Public\Documents\Circulens\dataset\Mehedi2"
$splits = @("train","val","test")
$classes = @("cercospora","healthy","mites_and_trips","nutritional","powdery mildew")
$hashMap = @{}
$total = 0
Write-Output "=== HASH SAMPLE CHECK (50 per class per split) ==="
foreach ($split in $splits) {
    foreach ($cls in $classes) {
        $path = Join-Path $base ($split + "\" + $cls)
        if (Test-Path $path) {
            $files = Get-ChildItem -LiteralPath $path -File | Select-Object -First 50
            foreach ($f in $files) {
                $h = (Get-FileHash -LiteralPath $f.FullName -Algorithm MD5).Hash
                $entry = $split + "/" + $cls + "/" + $f.Name
                if (-not $hashMap.ContainsKey($h)) {
                    $hashMap[$h] = [System.Collections.Generic.List[string]]::new()
                }
                $hashMap[$h].Add($entry)
                $total++
            }
        }
    }
}
$dups = @($hashMap.GetEnumerator() | Where-Object { $_.Value.Count -gt 1 })
$crossSplit = @($dups | Where-Object {
    $sp = $_.Value | ForEach-Object { ($_ -split "/")[0] } | Select-Object -Unique
    ($sp | Measure-Object).Count -gt 1
})
Write-Output ("Files sampled: " + $total)
Write-Output ("Hash duplicate groups in sample: " + $dups.Count)
Write-Output ("Cross-split hash duplicates in sample: " + $crossSplit.Count)
foreach ($c in $crossSplit | Select-Object -First 10) {
    Write-Output ("  CROSS: " + ($c.Value -join " | "))
}
