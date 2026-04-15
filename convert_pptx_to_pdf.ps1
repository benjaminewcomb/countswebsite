$pptPath = Join-Path (Get-Location).Path 'powerpoint\rcwateruse final.pptx'
$pdfPath = Join-Path (Get-Location).Path 'powerpoint\rcwateruse final.pdf'
$ppt = New-Object -ComObject PowerPoint.Application
$presentation = $ppt.Presentations.Open($pptPath, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoTrue)
$presentation.SaveAs($pdfPath, 32)
$presentation.Close()
$ppt.Quit()
Write-Output 'PDF_CREATED'
