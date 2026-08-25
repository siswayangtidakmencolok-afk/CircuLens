$pip = "C:\Users\Public\Documents\Circulens\training\venv\Scripts\pip.exe"
Write-Output "Downgrading NumPy to be compatible with torch 2.1.2..."
& $pip install "numpy<2" --upgrade
Write-Output "Done."
& $pip show numpy | Select-String "Name|Version"
