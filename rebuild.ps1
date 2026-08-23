param()

$src   = "C:\Users\Public\Documents\Circulens\dataset\Mehedi2"
$dst   = "C:\Users\Public\Documents\Circulens\dataset\Mehedi2-clean"
$classes = @("cercospora","healthy","mites_and_trips","nutritional","powdery mildew")
$splits  = @("train","val","test")
$seed    = 42
$trainR  = 0.70
$valR    = 0.15
$testR   = 0.15

Write-Output "=== CIRCULENS DATASET REBUILD ==="
Write-Output "Source : $src"
Write-Output "Dest   : $dst"
Write-Output "Seed   : $seed"
Write-Output "Split  : $trainR / $valR / $testR"
Write-Output ""

# -- Step 1: Pool all files per class
Write-Output "--- STEP 1: Pooling files ---"
$pool = @{}
foreach ($cls in $classes) {
    $pool[$cls] = [System.Collections.Generic.List[string]]::new()
    foreach ($sp in $splits) {
        $p = Join-Path $src ($sp + "\" + $cls)
        if (Test-Path -LiteralPath $p) {
            $files = Get-ChildItem -LiteralPath $p -File
            foreach ($f in $files) { $pool[$cls].Add($f.FullName) }
        }
    }
    Write-Output "  $cls : $($pool[$cls].Count) total files pooled"
}

# -- Step 2: SHA-256 deduplication per class
Write-Output ""
Write-Output "--- STEP 2: SHA-256 deduplication ---"
$unique = @{}
$dupGroups   = 0
$dupRemoved  = 0
$totalOrig   = 0
foreach ($cls in $classes) {
    $seen    = @{}
    $kept    = [System.Collections.Generic.List[string]]::new()
    foreach ($fp in $pool[$cls]) {
        $h = (Get-FileHash -LiteralPath $fp -Algorithm SHA256).Hash
        if (-not $seen.ContainsKey($h)) {
            $seen[$h] = $fp
            $kept.Add($fp)
        } else {
            $dupRemoved++
        }
    }
    $totalOrig   += $pool[$cls].Count
    $dupsInClass  = $pool[$cls].Count - $kept.Count
    if ($dupsInClass -gt 0) { $dupGroups++ }
    $unique[$cls] = $kept
    Write-Output "  $cls : pooled=$($pool[$cls].Count)  unique=$($kept.Count)  removed=$dupsInClass"
}
$totalUnique = ($unique.Values | ForEach-Object { $_.Count } | Measure-Object -Sum).Sum
Write-Output "  TOTAL original : $totalOrig"
Write-Output "  TOTAL unique   : $totalUnique"
Write-Output "  TOTAL removed  : $dupRemoved"

# -- Step 3: Deterministic shuffle + stratified split
Write-Output ""
Write-Output "--- STEP 3: Stratified split (seed=$seed) ---"
$rng = [System.Random]::new($seed)
$splitMap = @{ train = @{}; validation = @{}; test = @{} }
foreach ($sp in @("train","validation","test")) {
    foreach ($cls in $classes) { $splitMap[$sp][$cls] = [System.Collections.Generic.List[string]]::new() }
}
$splitCounts = @{ train = 0; validation = 0; test = 0 }
foreach ($cls in $classes) {
    $list = $unique[$cls]
    # Fisher-Yates shuffle
    $arr = $list.ToArray()
    for ($i = $arr.Length - 1; $i -gt 0; $i--) {
        $j = $rng.Next($i + 1)
        $tmp = $arr[$i]; $arr[$i] = $arr[$j]; $arr[$j] = $tmp
    }
    $n      = $arr.Length
    $nTrain = [Math]::Floor($n * $trainR)
    $nVal   = [Math]::Floor($n * $valR)
    $nTest  = $n - $nTrain - $nVal
    for ($i = 0; $i -lt $nTrain; $i++) { $splitMap["train"][$cls].Add($arr[$i]) }
    for ($i = $nTrain; $i -lt ($nTrain + $nVal); $i++) { $splitMap["validation"][$cls].Add($arr[$i]) }
    for ($i = ($nTrain + $nVal); $i -lt $n; $i++) { $splitMap["test"][$cls].Add($arr[$i]) }
    $splitCounts["train"]      += $nTrain
    $splitCounts["validation"] += $nVal
    $splitCounts["test"]       += $nTest
    Write-Output "  $cls : train=$nTrain  val=$nVal  test=$nTest"
}
Write-Output "  TOTAL train=$($splitCounts['train'])  val=$($splitCounts['validation'])  test=$($splitCounts['test'])"

# -- Step 4: Copy files to Mehedi2-clean
Write-Output ""
Write-Output "--- STEP 4: Copying files to $dst ---"
$copied = 0
foreach ($sp in @("train","validation","test")) {
    foreach ($cls in $classes) {
        $dstDir = Join-Path $dst ($sp + "\" + $cls)
        if (-not (Test-Path -LiteralPath $dstDir)) {
            New-Item -ItemType Directory -Path $dstDir -Force | Out-Null
        }
        foreach ($src_fp in $splitMap[$sp][$cls]) {
            $fname  = [System.IO.Path]::GetFileName($src_fp)
            $dstFp  = Join-Path $dstDir $fname
            Copy-Item -LiteralPath $src_fp -Destination $dstFp -Force
            $copied++
        }
    }
}
Write-Output "  Files copied: $copied"

# -- Step 5: Leakage verification (full SHA-256 on all copied files)
Write-Output ""
Write-Output "--- STEP 5: Leakage verification ---"
$hashTrain = @{}
$hashVal   = @{}
$hashTest  = @{}

foreach ($cls in $classes) {
    $dstDir = Join-Path $dst ("train\" + $cls)
    if (Test-Path -LiteralPath $dstDir) {
        foreach ($f in (Get-ChildItem -LiteralPath $dstDir -File)) {
            $h = (Get-FileHash -LiteralPath $f.FullName -Algorithm SHA256).Hash
            $hashTrain[$h] = 1
        }
    }
}
foreach ($cls in $classes) {
    $dstDir = Join-Path $dst ("validation\" + $cls)
    if (Test-Path -LiteralPath $dstDir) {
        foreach ($f in (Get-ChildItem -LiteralPath $dstDir -File)) {
            $h = (Get-FileHash -LiteralPath $f.FullName -Algorithm SHA256).Hash
            $hashVal[$h] = 1
        }
    }
}
foreach ($cls in $classes) {
    $dstDir = Join-Path $dst ("test\" + $cls)
    if (Test-Path -LiteralPath $dstDir) {
        foreach ($f in (Get-ChildItem -LiteralPath $dstDir -File)) {
            $h = (Get-FileHash -LiteralPath $f.FullName -Algorithm SHA256).Hash
            $hashTest[$h] = 1
        }
    }
}

Write-Output "  train : $($hashTrain.Count) unique hashes"
Write-Output "  validation : $($hashVal.Count) unique hashes"
Write-Output "  test : $($hashTest.Count) unique hashes"

$tvOverlap = 0
foreach ($h in $hashTrain.Keys) { if ($hashVal.ContainsKey($h)) { $tvOverlap++ } }
$ttOverlap = 0
foreach ($h in $hashTrain.Keys) { if ($hashTest.ContainsKey($h)) { $ttOverlap++ } }
$vtOverlap = 0
foreach ($h in $hashVal.Keys) { if ($hashTest.ContainsKey($h)) { $vtOverlap++ } }

Write-Output "  Train x Validation : $tvOverlap"
Write-Output "  Train x Test       : $ttOverlap"
Write-Output "  Validation x Test  : $vtOverlap"
if ($tvOverlap -eq 0 -and $ttOverlap -eq 0 -and $vtOverlap -eq 0) {
    Write-Output "  LEAKAGE RESULT: PASS - no exact hash overlap"
} else {
    Write-Output "  LEAKAGE RESULT: FAIL - overlap detected - STOP"
}

# -- Step 6: Per-class final counts
Write-Output ""
Write-Output "--- STEP 6: Final class distribution ---"
foreach ($cls in $classes) {
    $tr = $splitMap["train"][$cls].Count
    $vl = $splitMap["validation"][$cls].Count
    $ts = $splitMap["test"][$cls].Count
    Write-Output "  $cls : train=$tr  val=$vl  test=$ts  total=$($tr+$vl+$ts)"
}

Write-Output ""
Write-Output "=== REBUILD COMPLETE ==="
Write-Output "originalCount : $totalOrig"
Write-Output "duplicateGroups : $dupGroups"
Write-Output "duplicateRemoved : $dupRemoved"
Write-Output "uniqueCount : $totalUnique"
Write-Output "trainTotal : $($splitCounts['train'])"
Write-Output "validationTotal : $($splitCounts['validation'])"
Write-Output "testTotal : $($splitCounts['test'])"
