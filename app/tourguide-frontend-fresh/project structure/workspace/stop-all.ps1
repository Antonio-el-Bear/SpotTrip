# PowerShell script to stop only the TravelRecord app processes and optional runtime containers.

$workspacePath = "C:/Users/User/Documents/cloud uko/apps/toursim app/tourguide2.0/app/tourguide-frontend-fresh/project structure/workspace"
$logFile = Join-Path $workspacePath "history log.md"
$shareStateFile = Join-Path $workspacePath ".share-session.json"
$managedPorts = @(3000, 8000, 8001, 6379)
$optionalContainers = @("travelrecord-redis", "tourguide-db-1")

function Write-StopLog {
	param([string]$Message)

	$stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
	Add-Content -Path $logFile -Value "[$stamp] $Message"
}

Write-StopLog "Stop script started."

if (Test-Path $shareStateFile) {
	try {
		$shareState = Get-Content -Path $shareStateFile -Raw | ConvertFrom-Json
		$trackedPids = @($shareState.tunnelShellPid, $shareState.frontendShellPid, $shareState.backendShellPid) | Where-Object { $_ }

		foreach ($trackedPid in $trackedPids) {
			try {
				Stop-Process -Id $trackedPid -Force -ErrorAction Stop
				Write-StopLog "Stopped tracked share-session process PID $trackedPid."
			}
			catch {
				Write-StopLog "Unable to stop tracked share-session process PID ${trackedPid}: $($_.Exception.Message)"
			}
		}
	}
	catch {
		Write-StopLog "Unable to read share session state file: $($_.Exception.Message)"
	}

	try {
		Remove-Item -Path $shareStateFile -Force -ErrorAction Stop
		Write-StopLog "Removed share session state file."
	}
	catch {
		Write-StopLog "Unable to remove share session state file: $($_.Exception.Message)"
	}
}

foreach ($port in $managedPorts) {
	$connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
		Select-Object -ExpandProperty OwningProcess -Unique

	foreach ($processId in $connections) {
		try {
			Stop-Process -Id $processId -Force -ErrorAction Stop
			Write-StopLog "Stopped process on port $port (PID $processId)."
		}
		catch {
				Write-StopLog "Unable to stop process on port ${port} (PID $processId): $($_.Exception.Message)"
		}
	}
}

$docker = Get-Command docker -ErrorAction SilentlyContinue
if ($docker) {
	docker version --format "{{.Server.Version}}" *> $null
	if ($LASTEXITCODE -eq 0) {
		foreach ($container in $optionalContainers) {
			$isRunning = docker ps --filter "name=^/${container}$" --format "{{.Names}}"
			if ($isRunning -contains $container) {
				docker stop $container *> $null
				if ($LASTEXITCODE -eq 0) {
					Write-StopLog "Docker container stopped: $container"
				}
				else {
					Write-StopLog "Failed to stop Docker container: $container"
				}
			}
		}
	}
	else {
		Write-StopLog "Docker daemon unavailable; skipped container shutdown."
	}
}
else {
	Write-StopLog "Docker CLI unavailable; skipped container shutdown."
}

Write-StopLog "App stopped via stop-all.ps1."
Write-Host "Managed app processes and optional containers stopped."
