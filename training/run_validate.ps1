# CircuLens — Data Loader Validation Runner
# Requires: venv must be set up first via setup_env.ps1

$python = "C:\Users\Public\Documents\Circulens\training\venv\Scripts\python.exe"
$script = "C:\Users\Public\Documents\Circulens\training\validate_loader.py"

if (-not (Test-Path -LiteralPath $python)) {
    Write-Output "ERROR: venv not found at $python"
    Write-Output "Run setup_env.ps1 first to create the virtual environment."
    exit 1
}

Write-Output "Running data loader validation..."
& $python $script
