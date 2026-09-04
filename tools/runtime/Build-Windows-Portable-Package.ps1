[CmdletBinding()]
param(
    [string]$OutputDirectory = (Join-Path $PSScriptRoot '..\..\dist'),
    [switch]$KeepWorkDirectory
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

function Write-Log {
    param(
        [Parameter(Mandatory = $true)][string]$Message,
        [ValidateSet('INFO','WARN','ERROR','SUCCESS')][string]$Level = 'INFO'
    )
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    Write-Host "[$timestamp] [$Level] $Message"
}

function Get-Sha256 {
    param([Parameter(Mandatory = $true)][string]$Path)
    return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$manifestPath = Join-Path $projectRoot 'analyzer\runtime\runtime-manifest.json'
if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) {
    throw "Runtime-Manifest nicht gefunden: $manifestPath"
}

$manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
$target = $manifest.targets.'win32-x64'
if ($null -eq $target) {
    throw 'Das Runtime-Manifest enthält kein Ziel win32-x64.'
}

$runtimeVersion = [string]$manifest.runtime.version
$archiveName = [string]$target.archive
$archiveSha256 = ([string]$target.archiveSha256).ToLowerInvariant()
$sourceBase = ([string]$manifest.runtime.source).TrimEnd('/')
$downloadUrl = "$sourceBase/$archiveName"

$workRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("oluntir-runtime-build-" + [Guid]::NewGuid().ToString('N'))
$downloadPath = Join-Path $workRoot $archiveName
$extractPath = Join-Path $workRoot 'extract'
$packageRoot = Join-Path $workRoot 'package\Oluntir-API-Analyzer-Windows-x64'

try {
    New-Item -ItemType Directory -Path $workRoot, $extractPath, $packageRoot -Force | Out-Null
    New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null

    Write-Log "Lade offizielle Node.js-Runtime $runtimeVersion von $downloadUrl"
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $downloadUrl -OutFile $downloadPath -UseBasicParsing

    $actualArchiveHash = Get-Sha256 -Path $downloadPath
    if ($actualArchiveHash -ne $archiveSha256) {
        throw "Archiv-Prüfsumme stimmt nicht. Erwartet: $archiveSha256; erhalten: $actualArchiveHash"
    }
    Write-Log 'Offizielles Runtime-Archiv erfolgreich verifiziert.' 'SUCCESS'

    Expand-Archive -LiteralPath $downloadPath -DestinationPath $extractPath -Force
    $nodeRoot = Get-ChildItem -LiteralPath $extractPath -Directory | Select-Object -First 1
    if ($null -eq $nodeRoot) {
        throw 'Entpacktes Node.js-Verzeichnis wurde nicht gefunden.'
    }

    $nodeExe = Join-Path $nodeRoot.FullName 'node.exe'
    $nodeLicense = Join-Path $nodeRoot.FullName 'LICENSE'
    if (-not (Test-Path -LiteralPath $nodeExe -PathType Leaf)) {
        throw "node.exe fehlt im offiziellen Archiv: $nodeExe"
    }
    if (-not (Test-Path -LiteralPath $nodeLicense -PathType Leaf)) {
        throw "Node.js-Lizenz fehlt im offiziellen Archiv: $nodeLicense"
    }

    Write-Log 'Kopiere Oluntir-Projekt in die portable Distribution.'
    $excludeDirectories = @('.git', 'dist', 'runtime\node', 'logs')
    $excludeFiles = @('*.zip', '*.sha256')
    $robocopyArgs = @(
        $projectRoot,
        $packageRoot,
        '/E', '/COPY:DAT', '/DCOPY:T', '/R:2', '/W:1', '/NFL', '/NDL', '/NJH', '/NJS', '/NP'
    )
    foreach ($directory in $excludeDirectories) {
        $robocopyArgs += @('/XD', (Join-Path $projectRoot $directory))
    }
    foreach ($file in $excludeFiles) {
        $robocopyArgs += @('/XF', $file)
    }
    & robocopy.exe @robocopyArgs | Out-Null
    if ($LASTEXITCODE -ge 8) {
        throw "Robocopy ist mit Fehlercode $LASTEXITCODE fehlgeschlagen."
    }

    $runtimeDestination = Join-Path $packageRoot 'runtime\node\win32-x64'
    $licenseDestination = Join-Path $packageRoot 'licenses\runtime'
    New-Item -ItemType Directory -Path $runtimeDestination, $licenseDestination -Force | Out-Null
    Copy-Item -LiteralPath $nodeExe -Destination (Join-Path $runtimeDestination 'node.exe') -Force
    Copy-Item -LiteralPath $nodeLicense -Destination (Join-Path $licenseDestination "NODEJS-$runtimeVersion-LICENSE.txt") -Force

    $runtimeExe = Join-Path $runtimeDestination 'node.exe'
    $runtimeHash = Get-Sha256 -Path $runtimeExe
    $integrity = [ordered]@{
        schemaVersion = '1.0.0'
        runtimeVersion = $runtimeVersion
        executables = [ordered]@{
            'win32-x64' = $runtimeHash
        }
    }
    $integrityPath = Join-Path $packageRoot 'runtime\runtime-integrity.json'
    $integrity | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $integrityPath -Encoding UTF8

    $buildInfo = [ordered]@{
        schemaVersion = '1.0.0'
        package = 'Oluntir-API-Analyzer-Windows-x64'
        builtAtUtc = (Get-Date).ToUniversalTime().ToString('o')
        runtime = [ordered]@{
            name = 'Node.js'
            version = $runtimeVersion
            source = $downloadUrl
            archiveSha256 = $actualArchiveHash
            executableSha256 = $runtimeHash
        }
        offlineRuntime = $true
        pathFallbackAllowed = $false
    }
    $buildInfo | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $packageRoot 'runtime\runtime-build-info.json') -Encoding UTF8

    Write-Log 'Prüfe die eingebettete Runtime.'
    $versionOutput = & $runtimeExe --version
    if ($LASTEXITCODE -ne 0 -or $versionOutput -ne "v$runtimeVersion") {
        throw "Runtime-Selbsttest fehlgeschlagen. Erwartet v$runtimeVersion, erhalten '$versionOutput'."
    }

    Write-Log 'Führe portable Runtime-Vertragstests aus.'
    $env:OLUNTIR_ALLOW_DEVELOPMENT_RUNTIME = '1'
    & $runtimeExe (Join-Path $packageRoot 'analyzer\tests\test-portable-runtime-contract.js')
    if ($LASTEXITCODE -ne 0) {
        throw 'Portable-Runtime-Vertragstest fehlgeschlagen.'
    }
    Remove-Item Env:\OLUNTIR_ALLOW_DEVELOPMENT_RUNTIME -ErrorAction SilentlyContinue

    $zipName = "Oluntir_API_Analyzer_Windows-x64_Node-$runtimeVersion.zip"
    $zipPath = Join-Path $OutputDirectory $zipName
    if (Test-Path -LiteralPath $zipPath) {
        Remove-Item -LiteralPath $zipPath -Force
    }
    Compress-Archive -LiteralPath $packageRoot -DestinationPath $zipPath -CompressionLevel Optimal
    $zipHash = Get-Sha256 -Path $zipPath
    Set-Content -LiteralPath "$zipPath.sha256" -Value "$zipHash  $zipName" -Encoding ASCII

    Write-Log "Portables Windows-Paket erstellt: $zipPath" 'SUCCESS'
    Write-Log "SHA-256: $zipHash" 'SUCCESS'
}
finally {
    if (-not $KeepWorkDirectory -and (Test-Path -LiteralPath $workRoot)) {
        Remove-Item -LiteralPath $workRoot -Recurse -Force -ErrorAction SilentlyContinue
    }
    elseif ($KeepWorkDirectory) {
        Write-Log "Arbeitsverzeichnis beibehalten: $workRoot" 'WARN'
    }
}
