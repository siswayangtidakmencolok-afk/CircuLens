$pip = "C:\Users\Public\Documents\Circulens\training\venv\Scripts\pip.exe"
Write-Output "Uninstalling current torch/torchvision..."
& $pip uninstall torch torchvision torchaudio -y
Write-Output "Installing torch 2.1.2+cpu (stable)..."
& $pip install "torch==2.1.2" "torchvision==0.16.2" --index-url https://download.pytorch.org/whl/cpu
Write-Output "Done. Installed versions:"
& $pip show torch torchvision | Select-String "Name|Version"
