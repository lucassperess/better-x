$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
Push-Location $projectRoot
try {
    npm test
    if ($LASTEXITCODE -ne 0) { throw 'Validation failed.' }
    $manifest = Get-Content manifest.json -Raw | ConvertFrom-Json
    $destination = Join-Path $projectRoot 'dist'
    New-Item -ItemType Directory -Path $destination -Force | Out-Null
    $archive = Join-Path $destination "better-x-$($manifest.version).zip"
    $files = @('manifest.json', 'content.js', 'content.css', 'popup.html', 'popup.js', 'popup.css', 'LICENSE')
    $files += @('16', '32', '48', '128') | ForEach-Object { "icons/icon-$_.png" }
    Add-Type -AssemblyName System.IO.Compression
    $stream = [System.IO.File]::Open($archive, [System.IO.FileMode]::Create)
    $zip = [System.IO.Compression.ZipArchive]::new($stream, [System.IO.Compression.ZipArchiveMode]::Create)
    try {
        foreach ($file in $files) {
            $entry = $zip.CreateEntry($file, [System.IO.Compression.CompressionLevel]::Optimal)
            $output = $entry.Open()
            $inputFile = [System.IO.File]::OpenRead((Join-Path $projectRoot $file))
            try { $inputFile.CopyTo($output) } finally { $inputFile.Dispose(); $output.Dispose() }
        }
    } finally { $zip.Dispose(); $stream.Dispose() }
    Write-Output $archive
} finally { Pop-Location }
