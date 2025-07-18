# Check if Docker is installed and running
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed. Please install Docker Desktop for Windows first."
    exit 1
}

# Create necessary directories if they don't exist
$directories = @(
    "frontend",
    "backend",
    "monitoring\prometheus",
    "monitoring\grafana"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force
    }
}

# Function to check if a container is healthy
function Test-ContainerHealth {
    param (
        [string]$containerName
    )
    $maxAttempts = 30
    $attempt = 1
    
    while ($attempt -le $maxAttempts) {
        $status = docker ps --filter "name=$containerName" --format "{{.Status}}"
        if ($status -match "healthy|running") {
            return $true
        }
        Start-Sleep -Seconds 2
        $attempt++
    }
    return $false
}

# Build and start services
Write-Host "Building Alpha-1-Assist containers..."
docker-compose build

Write-Host "Starting Alpha-1-Assist services..."
docker-compose up -d

# Wait for services to be healthy
Write-Host "Waiting for services to be ready..."
$services = @("backend", "postgres", "redis")
foreach ($service in $services) {
    if (-not (Test-ContainerHealth $service)) {
        Write-Error "Service $service failed to start properly."
        exit 1
    }
}

# Perform health check
Write-Host "Performing health check..."
try {
    $healthCheck = Invoke-WebRequest -Uri "http://localhost:5001/api/health" -TimeoutSec 30
    if ($healthCheck.StatusCode -eq 200) {
        Write-Host "`nDeployment successful! Services are running at:"
        Write-Host "Frontend: http://localhost:80"
        Write-Host "Backend API: http://localhost:5001"
        Write-Host "Grafana: http://localhost:3001 (admin/admin123)"
        Write-Host "Prometheus: http://localhost:9090"
    } else {
        Write-Error "Health check failed with status code: $($healthCheck.StatusCode)"
        exit 1
    }
} catch {
    Write-Error "Health check failed. Please check the logs."
    exit 1
}