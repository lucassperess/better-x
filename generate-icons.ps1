Add-Type -AssemblyName System.Drawing

$iconDirectory = Join-Path $PSScriptRoot "icons"
$sourcePath = Join-Path $iconDirectory "logo-original.png"
$sizes = @(16, 32, 48, 128, 512)
$source = [System.Drawing.Image]::FromFile($sourcePath)

foreach ($size in $sizes) {
    $bitmap = [System.Drawing.Bitmap]::new($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.Clear([System.Drawing.Color]::Black)

    $scale = [Math]::Min($size / $source.Width, $size / $source.Height)
    $width = [Math]::Round($source.Width * $scale)
    $height = [Math]::Round($source.Height * $scale)
    $x = [Math]::Floor(($size - $width) / 2)
    $y = [Math]::Floor(($size - $height) / 2)
    $graphics.DrawImage($source, $x, $y, $width, $height)

    $output = Join-Path $iconDirectory "icon-$size.png"
    $bitmap.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)

    $graphics.Dispose()
    $bitmap.Dispose()
}

$source.Dispose()
