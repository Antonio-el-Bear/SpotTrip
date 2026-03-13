# PowerShell script to launch the TravelRecord frontend and backend.

$workspacePath = "C:/Users/User/Documents/cloud uko/apps/toursim app/tourguide2.0/app/tourguide-frontend-fresh/project structure/workspace"
$frontendPath = $workspacePath
$backendPath = Join-Path $workspacePath "backend/server"
$backendPython = Join-Path $workspacePath "backend/venv/Scripts/python.exe"
$logFile = Join-Path $workspacePath "history log.md"
$managedPorts = @(3000, 8000)
$optionalContainers = @("tourguide-db-1", "travelrecord-redis")
$startupTimeoutSeconds = 45

function Get-PrimaryIpv4Address {
	$addresses = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
		Where-Object {
			$_.IPAddress -notlike '127.*' -and
			$_.IPAddress -notlike '169.254.*' -and
			$_.PrefixOrigin -ne 'WellKnown'
		} |
		Sort-Object -Property InterfaceMetric, SkipAsSource |
		Select-Object -ExpandProperty IPAddress

	return $addresses | Select-Object -First 1
}

function Write-LaunchLog {
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
				Write-LaunchLog "Stopped existing process on port $port (PID $processId) before launch."
			}
			catch {
				Write-LaunchLog "Unable to stop existing process on port $port (PID $processId): $($_.Exception.Message)"
			}
		}
	}
}

function Start-OptionalContainers {
	$docker = Get-Command docker -ErrorAction SilentlyContinue
	if (-not $docker) {
		Write-LaunchLog "Docker CLI not available; skipping optional containers."
		return
	}

	docker version --format "{{.Server.Version}}" *> $null
	if ($LASTEXITCODE -ne 0) {
		Write-LaunchLog "Docker daemon unavailable; skipping optional containers."
		return
	}

	foreach ($container in $optionalContainers) {
		$exists = docker ps -a --filter "name=^/${container}$" --format "{{.Names}}"
		if ($exists -contains $container) {
			$isRunning = docker ps --filter "name=^/${container}$" --format "{{.Names}}"
			if (-not ($isRunning -contains $container)) {
				docker start $container *> $null
				if ($LASTEXITCODE -eq 0) {
					Write-LaunchLog "Docker container started: $container"
				}
				else {
					Write-LaunchLog "Failed to start Docker container: $container"
				}
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

Write-LaunchLog "Quick launch started."

if (-not (Test-Path $backendPython)) {
	Write-LaunchLog "Backend Python executable not found at $backendPython"
	throw "Backend Python executable not found."
}

Stop-ManagedPorts
Start-OptionalContainers

& $backendPython (Join-Path $backendPath "manage.py") migrate --noinput
if ($LASTEXITCODE -ne 0) {
	Write-LaunchLog "Backend migrations failed before launch."
	Write-Host ""
	Write-Host "Launch failed during backend migration. Check history log.md for details." -ForegroundColor Red
	exit 1
}
Write-LaunchLog "Backend migrations completed successfully before launch."

Start-Process powershell -WorkingDirectory $backendPath -ArgumentList "-NoExit", "-Command", "& '$backendPython' manage.py runserver" -WindowStyle Normal | Out-Null
$backendStarted = $false
if (Wait-ForPort -Port 8000 -TimeoutSeconds $startupTimeoutSeconds) {
	$backendStarted = $true
	Write-LaunchLog "Backend started on port 8000."
}
else {
	Write-LaunchLog "Backend failed to start on port 8000 within $startupTimeoutSeconds seconds."
}

Start-Process powershell -WorkingDirectory $frontendPath -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal | Out-Null
$frontendStarted = $false
if (Wait-ForPort -Port 3000 -TimeoutSeconds $startupTimeoutSeconds) {
	$frontendStarted = $true
	Write-LaunchLog "Frontend started on port 3000."
}
else {
	Write-LaunchLog "Frontend failed to start on port 3000 within $startupTimeoutSeconds seconds."
}

Write-LaunchLog "Quick launch completed."

Write-Host "" 
Write-Host "Launch summary" -ForegroundColor Cyan
Write-Host ("  Backend (8000):  " + ($(if ($backendStarted) { "OK" } else { "FAILED" }))) -ForegroundColor $(if ($backendStarted) { "Green" } else { "Red" })
Write-Host ("  Frontend (3000): " + ($(if ($frontendStarted) { "OK" } else { "FAILED" }))) -ForegroundColor $(if ($frontendStarted) { "Green" } else { "Red" })

if ($backendStarted -and $frontendStarted) {
	$lanIp = Get-PrimaryIpv4Address
	$frontendLanUrl = if ($lanIp) { "http://${lanIp}:3000" } else { $null }
	Write-Host "" 
	Write-Host "App is ready:" -ForegroundColor Green
	Write-Host "  Frontend: http://localhost:3000"
	if ($frontendLanUrl) {
		Write-Host "  Frontend (phone): $frontendLanUrl"
	}
	Write-Host "  Backend:  http://127.0.0.1:8000"
	exit 0
}

Write-Host "" 
Write-Host "Launch failed. Check the spawned frontend/backend terminal windows and history log.md for details." -ForegroundColor Red
exit 1