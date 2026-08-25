Add-Type -AssemblyName System.Drawing
$base = "C:\Users\Public\Documents\Circulens\dataset\Mehedi2"
$splits = @("train","val","test")
$classes = @("cercospora","healthy","mites_and_trips","nutritional","powdery mildew")
Write-Output "=== IMAGE DIMENSION SAMPLE CHECK ==="
foreach ($split in $splits) {
  foreach ($cls in $classes) {
    $path = Join-Path $base ($split + "\" + $cls)
    if (Test-Path $path) {
      $files = Get-ChildItem -LiteralPath $path -File | Select-Object -First 5
      $dims = @()
      foreach ($f in $files) {
        try { $img = [System.Drawing.Image]::FromFile($f.FullName)
          $dims += ($img.Width.ToString() + "x" + $img.Height.ToString()); $img.Dispose() }
        catch { $dims += "ERROR" }
      }
      Write-Output ("  " + $split + "/" + $cls + " : " + ($dims -join ", "))
    }
  }
}
