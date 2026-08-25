import subprocess
import sys

print("=== Visual C++ Redistributable Check ===")

# Check registry keys directly
keys = [
    r"HKLM\SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64",
    r"HKLM\SOFTWARE\WOW6432Node\Microsoft\VisualStudio\14.0\VC\Runtimes\x64",
]

for key in keys:
    try:
        result = subprocess.run(
            ["reg", "query", key],
            capture_output=True, text=True
        )
        if result.returncode == 0:
            print(f"Found: {key}")
            print(result.stdout.strip())
        else:
            print(f"NOT found: {key}")
    except Exception as e:
        print(f"Error checking {key}: {e}")

# Search installed programs for Visual C++
print("\n=== Searching installed programs ===")
try:
    result = subprocess.run(
        ["reg", "query", r"HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall",
         "/s", "/f", "Visual C++"],
        capture_output=True, text=True, timeout=30
    )
    if result.stdout.strip():
        print(result.stdout[:3000])
    else:
        print("No VC++ found in HKLM 64-bit uninstall")
except Exception as e:
    print(f"Error: {e}")

try:
    result = subprocess.run(
        ["reg", "query", r"HKLM\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall",
         "/s", "/f", "Visual C++"],
        capture_output=True, text=True, timeout=30
    )
    if result.stdout.strip():
        print(result.stdout[:3000])
    else:
        print("No VC++ found in WOW6432 uninstall")
except Exception as e:
    print(f"Error: {e}")
