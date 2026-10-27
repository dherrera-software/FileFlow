param (
    [Parameter(Mandatory=$true)][string]$InputPath,
    [Parameter(Mandatory=$true)][string]$OutputPath,
    [Parameter(Mandatory=$true)][string]$SourceFormat,
    [Parameter(Mandatory=$true)][string]$TargetFormat
)

$ErrorActionPreference = "Stop"

$src = $SourceFormat.ToLower().Trim().TrimStart('.')
$tgt = $TargetFormat.ToLower().Trim().TrimStart('.')

$InputPath = [System.IO.Path]::GetFullPath($InputPath)
$OutputPath = [System.IO.Path]::GetFullPath($OutputPath)

if (-not (Test-Path $InputPath)) {
    Write-Error "Input file does not exist: $InputPath"
    exit 1
}

# Ensure destination directory exists
$outDir = [System.IO.Path]::GetDirectoryName($OutputPath)
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

try {
    # ----------------------------------------------------
    # 1. TEXT-TO-SPEECH (TXT -> WAV)
    # ----------------------------------------------------
    if ($src -eq "txt" -and $tgt -eq "wav") {
        Add-Type -AssemblyName System.Speech
        $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
        try {
            $synth.Rate = 0
            $synth.Volume = 100
            $text = Get-Content -Path $InputPath -Raw -Encoding UTF8
            if ([string]::IsNullOrWhiteSpace($text)) {
                $text = "Documento vacio."
            }
            # Limit TTS length for sanity if huge
            if ($text.Length -gt 50000) {
                $text = $text.Substring(0, 50000)
            }
            $synth.SetOutputToWaveFile($OutputPath)
            $synth.Speak($text)
        } finally {
            $synth.Dispose()
        }
    }
    # ----------------------------------------------------
    # 2. WORD CONVERSIONS (DOCX, DOC, RTF, ODT, HTML, TXT, PDF -> PDF, PDFA, DOCX, TXT, HTML, RTF, ODT)
    # ----------------------------------------------------
    elseif (($src -in @("docx", "doc", "rtf", "odt", "html", "htm", "txt", "pdf", "pdfa")) -and
            ($tgt -in @("pdf", "pdfa", "docx", "doc", "txt", "html", "htm", "rtf", "odt"))) {
        
        $word = New-Object -ComObject Word.Application
        $word.Visible = $false
        $word.DisplayAlerts = 0
        try {
            $doc = $word.Documents.Open($InputPath, $false, $true)
            
            if ($tgt -eq "pdf") {
                # 17 = wdExportFormatPDF
                $doc.ExportAsFixedFormat($OutputPath, 17)
            }
            elseif ($tgt -eq "pdfa") {
                # 17 = wdExportFormatPDF, 14th param is UseISO19005_1 (PDF/A compliance)
                # ExportAsFixedFormat(OutputFileName, ExportFormat, OpenAfterExport, OptimizeFor, Range, From, To, Item, IncludeDocProps, KeepIRM, CreateBookmarks, DocStructureTags, BitmapMissingFonts, UseISO19005_1)
                $doc.ExportAsFixedFormat($OutputPath, 17, $false, 0, 0, 1, 1, 0, $true, $true, 1, $true, $true, $true)
            }
            elseif ($tgt -eq "docx") {
                # 16 = wdFormatXMLDocument (.docx)
                $doc.SaveAs([ref]$OutputPath, [ref]16)
            }
            elseif ($tgt -eq "doc") {
                # 0 = wdFormatDocument (.doc)
                $doc.SaveAs([ref]$OutputPath, [ref]0)
            }
            elseif ($tgt -eq "txt") {
                # 2 = wdFormatText (.txt)
                $doc.SaveAs([ref]$OutputPath, [ref]2)
            }
            elseif ($tgt -eq "html" -or $tgt -eq "htm") {
                # 10 = wdFormatFilteredHTML
                $doc.SaveAs([ref]$OutputPath, [ref]10)
            }
            elseif ($tgt -eq "rtf") {
                # 6 = wdFormatRTF
                $doc.SaveAs([ref]$OutputPath, [ref]6)
            }
            elseif ($tgt -eq "odt") {
                # 23 = wdFormatOpenDocumentText
                $doc.SaveAs([ref]$OutputPath, [ref]23)
            }
            else {
                throw "Unsupported Word target format: $tgt"
            }
            
            $doc.Close([ref]0)
        } finally {
            $word.Quit()
            [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
            [System.GC]::Collect()
            [System.GC]::WaitForPendingFinalizers()
        }
    }
    # ----------------------------------------------------
    # 3. EXCEL CONVERSIONS (XLSX, XLS, ODS, CSV, TSV -> PDF, XLSX, CSV, TSV)
    # ----------------------------------------------------
    elseif (($src -in @("xlsx", "xls", "ods", "csv", "tsv")) -and
            ($tgt -in @("pdf", "xlsx", "csv", "tsv"))) {
        
        $excel = New-Object -ComObject Excel.Application
        $excel.Visible = $false
        $excel.DisplayAlerts = $false
        try {
            $wb = $excel.Workbooks.Open($InputPath, $false, $true)
            
            if ($tgt -eq "pdf") {
                # 0 = xlTypePDF
                $wb.ExportAsFixedFormat(0, $OutputPath)
            }
            elseif ($tgt -eq "xlsx") {
                # 51 = xlOpenXMLWorkbook (.xlsx)
                $wb.SaveAs($OutputPath, 51)
            }
            elseif ($tgt -eq "csv") {
                # 6 = xlCSV
                $wb.SaveAs($OutputPath, 6)
            }
            elseif ($tgt -eq "tsv") {
                # 20 = xlTextWindows (tab delimited)
                $wb.SaveAs($OutputPath, 20)
            }
            else {
                throw "Unsupported Excel target format: $tgt"
            }
            
            $wb.Close($false)
        } finally {
            $excel.Quit()
            [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
            [System.GC]::Collect()
            [System.GC]::WaitForPendingFinalizers()
        }
    }
    # ----------------------------------------------------
    # 4. POWERPOINT CONVERSIONS (PPTX, PPT, ODP -> PDF, PPTX, JPG, PNG, MP4)
    # ----------------------------------------------------
    elseif (($src -in @("pptx", "ppt", "odp")) -and
            ($tgt -in @("pdf", "pptx", "jpg", "jpeg", "png", "mp4"))) {
        
        $ppt = New-Object -ComObject PowerPoint.Application
        try {
            $pres = $ppt.Presentations.Open($InputPath, [Microsoft.Office.Core.MsoTriState]::msoTrue, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse)
            
            if ($tgt -eq "pdf") {
                # 32 = ppSaveAsPDF
                $pres.SaveAs($OutputPath, 32)
            }
            elseif ($tgt -eq "pptx") {
                # 24 = ppSaveAsOpenXMLPresentation
                $pres.SaveAs($OutputPath, 24)
            }
            elseif ($tgt -eq "jpg" -or $tgt -eq "jpeg") {
                # 17 = ppSaveAsJPG
                $tempDir = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), [System.Guid]::NewGuid().ToString())
                New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
                try {
                    $pres.SaveAs($tempDir, 17)
                    $slides = Get-ChildItem -Path $tempDir -Filter "*.jpg" | Sort-Object Name
                    if ($slides.Count -gt 0) {
                        Copy-Item -Path $slides[0].FullName -Destination $OutputPath -Force
                    } else {
                        throw "PowerPoint slide JPG export produced no files."
                    }
                } finally {
                    Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
                }
            }
            elseif ($tgt -eq "png") {
                # 18 = ppSaveAsPNG
                $tempDir = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), [System.Guid]::NewGuid().ToString())
                New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
                try {
                    $pres.SaveAs($tempDir, 18)
                    $slides = Get-ChildItem -Path $tempDir -Filter "*.png" | Sort-Object Name
                    if ($slides.Count -gt 0) {
                        Copy-Item -Path $slides[0].FullName -Destination $OutputPath -Force
                    } else {
                        throw "PowerPoint slide PNG export produced no files."
                    }
                } finally {
                    Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
                }
            }
            elseif ($tgt -eq "mp4") {
                # CreateVideo(FileName, UseTimingsAndNarrations, DefaultSlideDuration, VertResolution, FramesPerSecond, Quality)
                $pres.CreateVideo($OutputPath, $true, 4, 1080, 30, 85)
                $timeout = 90
                $elapsed = 0
                # 1 = ppMediaTaskStatusInProgress, 3 = ppMediaTaskStatusFailed, 2 = ppMediaTaskStatusDone
                while ($pres.CreateVideoStatus -eq 1 -and $elapsed -lt $timeout) {
                    Start-Sleep -Seconds 1
                    $elapsed++
                }
                if ($pres.CreateVideoStatus -eq 3) {
                    throw "PowerPoint failed to render video."
                }
            }
            else {
                throw "Unsupported PowerPoint target format: $tgt"
            }
            
            $pres.Close()
        } finally {
            $ppt.Quit()
            [System.Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null
            [System.GC]::Collect()
            [System.GC]::WaitForPendingFinalizers()
        }
    }
    else {
        Write-Error "Unsupported office conversion combination: $src to $tgt"
        exit 1
    }

    if (-not (Test-Path $OutputPath)) {
        Write-Error "Output file was not created: $OutputPath"
        exit 1
    }

    Write-Output "SUCCESS"
    exit 0
} catch {
    Write-Error $_.Exception.Message
    exit 1
}
