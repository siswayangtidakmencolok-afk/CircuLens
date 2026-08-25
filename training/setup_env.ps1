# CircuLens — Virtual Environment Setup Script
# Uses Python 3.11.6 via the Python Launcher (py -3.11)

$python = "py"
$pyArgs = @("-3.11")
$venv   = "C:\Users\Public\Documents\Circulens\training\venv"

Write-Output "CircuLens venv setup starting..."
Write-Output "Python launcher: $python $pyArgs"
Write-Output "Venv path: $venv"

# Verify python is available
$ver = & $python @pyArgs --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Output "ERROR: py -3.11 not available. Ensure Python 3.11 is installed."
    exit 1
}
Write-Output "Python version: $ver"

# Create virtual environment
Write-Output "Creating venv at $venv ..."
& $python @pyArgs -m venv $venv
if ($LASTEXITCODE -ne 0) {
    Write-Output "ERROR: Failed to create venv"
    exit 1
}
Write-Output "venv created OK"

$pip = "$venv\Scripts\pip.exe"

Write-Output "Upgrading pip..."
& $pip install --upgrade pip

Write-Output "Installing torch + torchvision (CPU build)..."
& $pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu

Write-Output "Installing Pillow numpy scikit-learn matplotlib..."
& $pip install Pillow numpy scikit-learn matplotlib

Write-Output ""
Write-Output "Installed packages:"
& $pip list

Write-Output ""
Write-Output "SETUP COMPLETE"
Write-Output "Next: run training\run_validate.ps1 to validate the data loader"
