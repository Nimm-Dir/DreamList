Add-Type -AssemblyName System.Drawing

$srcPath = Join-Path $PSScriptRoot "..\Logo.png"
$outDir = Join-Path $PSScriptRoot "_icon-build"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$src = [System.Drawing.Image]::FromFile((Resolve-Path $srcPath).Path)

$sizes = @(256, 128, 64, 48, 32, 16)

foreach ($size in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $scale = [Math]::Min($size / $src.Width, $size / $src.Height)
    $w = [int]($src.Width * $scale)
    $h = [int]($src.Height * $scale)
    $x = [int](($size - $w) / 2)
    $y = [int](($size - $h) / 2)

    $g.DrawImage($src, $x, $y, $w, $h)
    $g.Dispose()

    $outFile = Join-Path $outDir "icon-$size.png"
    $bmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Wrote $outFile"
}

$src.Dispose()
