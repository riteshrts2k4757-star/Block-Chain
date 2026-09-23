$ErrorActionPreference = "Stop"
$jdkUrl = "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.12%2B7/OpenJDK17U-jdk_x64_windows_hotspot_17.0.12_7.zip"
$zipPath = "C:\Work Space\Mobile_Application\jdk-17.zip"
$extractPath = "C:\Work Space\Mobile_Application\jdk-17"

Write-Host "Downloading JDK 17..."
Invoke-WebRequest -Uri $jdkUrl -OutFile $zipPath

Write-Host "Extracting JDK 17..."
Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force

Write-Host "Cleaning up zip..."
Remove-Item $zipPath

Write-Host "Done!"
