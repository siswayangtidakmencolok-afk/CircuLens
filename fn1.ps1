$base = "C:\Users\Public\Documents\Circulens\dataset\Mehedi2"
$splits = @("train","val","test")
$classes = @("cercospora","healthy","mites_and_trips","nutritional","powdery mildew")
Write-Output "=== FILENAME PATTERN ANALYSIS ==="
foreach ($cls in $classes) {
    $allNames = @()
    foreach ($split in $splits) {
        $path = Join-Path $base ($split + "\" + $cls)
        if (Test-Path $path) {
            $files = Get-ChildItem -LiteralPath $path -File
            foreach ($f in $files) { $allNames += $f.Name }
        }
    }
    $clsLower = $cls.ToLower() -replace "_and_","" -replace " ",""
    $mismatched = $allNames | Where-Object {
        $n = $_.ToLower() -replace "_and_","" -replace " ",""
        -not ($n -like ($clsLower.Substring(0,[Math]::Min(5,$clsLower.Length)) + "*"))
    }
    $augSuffixes = $allNames | Where-Object { $_ -match "_\d+_\d+\.jpg$" }
    Write-Output ""
    Write-Output ("Class: " + $cls)
    Write-Output ("  Total filenames: " + $allNames.Count)
    Write-Output ("  Filenames NOT starting with class prefix: " + $mismatched.Count)
    if ($mismatched.Count -gt 0 -and $mismatched.Count -lt 20) {
        foreach ($m in $mismatched) { Write-Output ("    MISMATCH: " + $m) }
    } elseif ($mismatched.Count -ge 20) {
        $mismatched | Select-Object -First 5 | ForEach-Object { Write-Output ("    MISMATCH(sample): " + $_) }
    }
    Write-Output ("  Filenames with numeric suffix pattern _N_N.jpg: " + $augSuffixes.Count)
    if ($augSuffixes.Count -gt 0) {
        $augSuffixes | Select-Object -First 3 | ForEach-Object { Write-Output ("    AUG(sample): " + $_) }
    }
}
