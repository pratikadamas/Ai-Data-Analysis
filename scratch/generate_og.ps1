Add-Type -AssemblyName System.Drawing

$bmp = New-Object System.Drawing.Bitmap(1200, 630)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

# Dark background
$g.Clear([System.Drawing.Color]::FromArgb(9, 13, 22))

# Gradient Orbs
$b1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(60, 0, 113, 227))
$g.FillEllipse($b1, -100, -100, 800, 800)

$b2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(60, 94, 92, 230))
$g.FillEllipse($b2, 600, 100, 800, 800)

# Card Box
$cardPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(80, 255, 255, 255), 2)
$cardBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(25, 255, 255, 255))
$g.FillRectangle($cardBrush, 80, 60, 1040, 510)
$g.DrawRectangle($cardPen, 80, 60, 1040, 510)

# Text Title
$fontTitle = New-Object System.Drawing.Font('Segoe UI', 44, [System.Drawing.FontStyle]::Bold)
$titleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$g.DrawString('AI Data Analysis Platform', $fontTitle, $titleBrush, 130, 180)

# Subtitle
$fontSub = New-Object System.Drawing.Font('Segoe UI', 24)
$subBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(161, 161, 166))
$g.DrawString('Talk to Your Data & Get Instant Visuals', $fontSub, $subBrush, 130, 270)

# Domain Pill
$pillBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(0, 113, 227))
$g.FillRectangle($pillBrush, 130, 360, 480, 54)
$fontPill = New-Object System.Drawing.Font('Segoe UI', 18, [System.Drawing.FontStyle]::Bold)
$g.DrawString('https://ai-data-analysis-five.vercel.app/', $fontPill, $titleBrush, 150, 372)

$outPng = 'd:\Projects\Ai-Data-Analysis\frontend\public\og-image.png'
$outJpg = 'd:\Projects\Ai-Data-Analysis\frontend\public\og-image.jpg'

$bmp.Save($outPng, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($outJpg, [System.Drawing.Imaging.ImageFormat]::Jpeg)

$g.Dispose()
$bmp.Dispose()
Write-Host 'GENERATED_OG_IMAGES_SUCCESS'
