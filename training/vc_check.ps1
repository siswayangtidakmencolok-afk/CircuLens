Write-Output "=== Visual C++ Redistributable Check ==="
$keys = @(
    "HKLM:\SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64",
    "HKLM:\SOFTWARE\WOW6432Node\Microsoft\VisualStudio\14.0\VC\Runtimes\x64",
    "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*",
    "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*"
)
foreach ($k in $keys[0..1]) {
    if (Test-Path $k) {
        $props = Get-ItemProperty $k -ErrorAction SilentlyContinue
        Write-Output "Found at $k"
        Write-Output "  Version: $($props.Version)"
        Write-Output "  Installed: $($props.Installed)"
    } else {
        Write-Output "NOT found: $k"
    }
}
$installed = Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*" -ErrorAction SilentlyContinue |
    Where-Object { $_.DisplayName -like "*Visual C++*" } |
    Select-Object DisplayName, DisplayVersion
$installed += Get-ItemProperty "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*" -ErrorAction SilentlyContinue |
    Where-Object { $_.DisplayName -like "*Visual C++*" } |
    Select-Object DisplayName, DisplayVersion
if ($installed) {
    Write-Output "Installed Visual C++ packages:"
    $installed | ForEach-Object { Write-Output "  $($_.DisplayName) — $($_.DisplayVersion)" }
} else {
    Write-Output "No Visual C++ Redistributable found in registry"
}
