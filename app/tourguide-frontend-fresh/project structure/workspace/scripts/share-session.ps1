# PowerShell script to start frontend, backend, and a temporary public sharing tunnel.

param(
	[string]$Subdomain
)

$workspacePath = "C:/Users/User/Documents/cloud uko/apps/toursim app/tourguide2.0/app/tourguide-frontend-fresh/project structure/workspace"
$frontendPath = $workspacePath
$backendPath = Join-Path $workspacePath "backend/server"
$backendPython = Join-Path $workspacePath "backend/venv/Scripts/python.exe"
$logFile = Join-Path $workspacePath "history log.md"
$shareStateFile = Join-Path $workspacePath ".share-session.json"
$managedPorts = @(3000, 8000)
$startupTimeoutSeconds = 45

function Write-ShareLog {
	param([string]$Message)

	$stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
	Add-Content -Path $logFile -Value "[$stamp] $Message"
}

function Stop-ManagedPorts {
	foreach ($port in $managedPorts) {
		$connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
			Select-Object -ExpandProperty OwningProcess -Unique

		foreach ($processId in $connections) {
			try {
				Stop-Process -Id $processId -Force -ErrorAction Stop
				Write-ShareLog "Stopped existing process on port $port (PID $processId) before share start."
			}
			catch {
				Write-ShareLog "Unable to stop existing process on port $port (PID $processId): $($_.Exception.Message)"
			}
		}
	}
}

function Wait-ForPort {
	param(
		[int]$Port,
		[int]$TimeoutSeconds = 30
	)

	$deadline = (Get-Date).AddSeconds($TimeoutSeconds)
	while ((Get-Date) -lt $deadline) {
		$connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
		if ($connection) {
			return $true
		}

		Start-Sleep -Seconds 2
	}

	return $false
}

function Wait-ForHttpOk {
	param(
		[string]$Url,
		[int]$TimeoutSeconds = 45
	)

	$deadline = (Get-Date).AddSeconds($TimeoutSeconds)
	while ((Get-Date) -lt $deadline) {
		try {
			$response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10
			if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
				return $true
			}
		}
		catch {
		}

		Start-Sleep -Seconds 2
	}

	return $false
}

function Get-ShareSubdomain {
	if ($Subdomain) {
		return $Subdomain.ToLowerInvariant()
	}

	$randomSuffix = Get-Random -Minimum 100000 -Maximum 999999
	return ("tourguide-share-" + $randomSuffix)
}

Write-ShareLog "Share session startup requested."

if (-not (Test-Path $backendPython)) {
	Write-ShareLog "Backend Python executable not found at $backendPython"
	throw "Backend Python executable not found."
}

if (Test-Path $shareStateFile) {
	try {
		Remove-Item -Path $shareStateFile -Force -ErrorAction Stop
		Write-ShareLog "Removed stale share session state file."
	}
	catch {
		Write-ShareLog "Unable to remove stale share session state file: $($_.Exception.Message)"
	}
}

Stop-ManagedPorts

& $backendPython (Join-Path $backendPath "manage.py") migrate --noinput
if ($LASTEXITCODE -ne 0) {
	Write-ShareLog "Backend migrations failed before share start."
	throw "Backend migrations failed before share start."
}
Write-ShareLog "Backend migrations completed successfully before share start."

$backendProcess = Start-Process powershell -WorkingDirectory $backendPath -ArgumentList "-NoExit", "-Command", "& '$backendPython' manage.py runserver" -WindowStyle Normal -PassThru
$backendStarted = Wait-ForPort -Port 8000 -TimeoutSeconds $startupTimeoutSeconds
if ($backendStarted) {
	Write-ShareLog "Backend started for share session on port 8000."
}
else {
	Write-ShareLog "Backend failed to start for share session on port 8000."
	throw "Backend failed to start on port 8000."
}

$frontendProcess = Start-Process powershell -WorkingDirectory $frontendPath -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal -PassThru
$frontendStarted = Wait-ForPort -Port 3000 -TimeoutSeconds $startupTimeoutSeconds
if ($frontendStarted) {
	Write-ShareLog "Frontend started for share session on port 3000."
}
else {
	Write-ShareLog "Frontend failed to start for share session on port 3000."
	throw "Frontend failed to start on port 3000."
}

$shareSubdomain = Get-ShareSubdomain
$shareUrl = "https://${shareSubdomain}.loca.lt"
$tunnelCommand = "npx --yes localtunnel --port 3000 --subdomain ${shareSubdomain}"
$tunnelProcess = Start-Process powershell -WorkingDirectory $frontendPath -ArgumentList "-NoExit", "-Command", $tunnelCommand -WindowStyle Normal -PassThru
$tunnelStarted = Wait-ForHttpOk -Url ("${shareUrl}/api/auth/session/") -TimeoutSeconds $startupTimeoutSeconds

if ($tunnelStarted) {
	Write-ShareLog "Share tunnel started at $shareUrl."
}
else {
	Write-ShareLog "Share tunnel did not respond successfully at $shareUrl within timeout."
	throw "Share tunnel did not become ready."
}

$state = [ordered]@{
	startedAt = (Get-Date).ToString("s")
	shareUrl = $shareUrl
	subdomain = $shareSubdomain
	frontendShellPid = $frontendProcess.Id
	backendShellPid = $backendProcess.Id
	tunnelShellPid = $tunnelProcess.Id
}
$state | ConvertTo-Json | Set-Content -Path $shareStateFile -Encoding UTF8

Write-ShareLog "Share session startup completed."

Write-Host ""
Write-Host "Share session ready:" -ForegroundColor Green
Write-Host "  Public URL: $shareUrl"
Write-Host "  Frontend:   http://localhost:3000"
Write-Host "  Backend:    http://127.0.0.1:8000"
Write-Host ""
Write-Host "To stop everything cleanly, run: npm run share:stop" -ForegroundColor Cyan