param(
  [string]$FrontendBaseUrl = "http://localhost:3000",
  [string]$BackendBaseUrl = "http://127.0.0.1:8000",
  [switch]$IncludeWriteCheck
)

$ErrorActionPreference = "Stop"

function Invoke-CheckedRequest {
  param(
    [string]$Method = "GET",
    [string]$Url,
    [int]$ExpectedStatus = 200,
    [string]$Body,
    [string]$ContentType = "application/json",
    [Microsoft.PowerShell.Commands.WebRequestSession]$WebSession
  )

  try {
    if ($PSBoundParameters.ContainsKey("Body")) {
      if ($PSBoundParameters.ContainsKey("WebSession")) {
        $response = Invoke-WebRequest -UseBasicParsing -Method $Method -Uri $Url -Body $Body -ContentType $ContentType -WebSession $WebSession
      } else {
        $response = Invoke-WebRequest -UseBasicParsing -Method $Method -Uri $Url -Body $Body -ContentType $ContentType
      }
    } else {
      if ($PSBoundParameters.ContainsKey("WebSession")) {
        $response = Invoke-WebRequest -UseBasicParsing -Method $Method -Uri $Url -WebSession $WebSession
      } else {
        $response = Invoke-WebRequest -UseBasicParsing -Method $Method -Uri $Url
      }
    }
  } catch {
    throw "Request failed for ${Method} ${Url}: $($_.Exception.Message)"
  }

  if ($response.StatusCode -ne $ExpectedStatus) {
    throw "Expected status $ExpectedStatus from ${Url}, got $($response.StatusCode)."
  }

  return $response
}

function Invoke-CheckedJsonRequest {
  param(
    [string]$Method = "GET",
    [string]$Url,
    [string]$Label,
    [string]$Body,
    [string]$ContentType = "application/json",
    [Microsoft.PowerShell.Commands.WebRequestSession]$WebSession
  )

  try {
    if ($PSBoundParameters.ContainsKey("Body")) {
      if ($PSBoundParameters.ContainsKey("WebSession")) {
        return Invoke-RestMethod -Method $Method -Uri $Url -Body $Body -ContentType $ContentType -Headers @{ Accept = "application/json" } -WebSession $WebSession
      }

      return Invoke-RestMethod -Method $Method -Uri $Url -Body $Body -ContentType $ContentType -Headers @{ Accept = "application/json" }
    }

    if ($PSBoundParameters.ContainsKey("WebSession")) {
      return Invoke-RestMethod -Method $Method -Uri $Url -Headers @{ Accept = "application/json" } -WebSession $WebSession
    }

    return Invoke-RestMethod -Method $Method -Uri $Url -Headers @{ Accept = "application/json" }
  } catch {
    throw "${Label} request failed: $($_.Exception.Message)"
  }
}

function Assert-JsonKeys {
  param(
    [object]$Object,
    [string[]]$Keys,
    [string]$Context
  )

  foreach ($key in $Keys) {
    if (-not ($Object.PSObject.Properties.Name -contains $key)) {
      throw "${Context} is missing required key '$key'."
    }
  }
}

Write-Host "Checking frontend routes against $FrontendBaseUrl" -ForegroundColor Cyan

$frontendRoutes = @(
  "/",
  "/login",
  "/signup",
  "/aitripbuilder",
  "/document-trip",
  "/dashboard",
  "/profile",
  "/billing",
  "/consultancy",
  "/members",
  "/leaderboard",
  "/trips/1"
)

foreach ($route in $frontendRoutes) {
  $response = Invoke-CheckedRequest -Url ($FrontendBaseUrl + $route)
  Write-Host ("  OK  {0} -> {1}" -f $route, $response.StatusCode) -ForegroundColor Green
}

Write-Host "Checking backend read APIs against $BackendBaseUrl" -ForegroundColor Cyan

$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$authSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$signupPayload = @{
  name = "Smoke Test User"
  email = "smoke-$timestamp@example.com"
  password = "SmokePass123!"
  confirmPassword = "SmokePass123!"
} | ConvertTo-Json

$signupResponse = Invoke-CheckedJsonRequest -Method "POST" -Url ($BackendBaseUrl + "/api/auth/signup/") -Label "signup API" -Body $signupPayload -WebSession $authSession
Assert-JsonKeys -Object $signupResponse -Keys @("message", "user") -Context "signup API"

$homePayload = Invoke-CheckedJsonRequest -Url ($BackendBaseUrl + "/api/home/") -Label "home API"
Assert-JsonKeys -Object $homePayload -Keys @("stats", "featuredTrips", "featuredExperts") -Context "home API"

$dashboard = Invoke-CheckedJsonRequest -Url ($BackendBaseUrl + "/api/dashboard/") -Label "dashboard API" -WebSession $authSession
Assert-JsonKeys -Object $dashboard -Keys @("profile", "stats", "quickActions", "pricingOptions", "checkoutRequests", "trips", "aiTrips") -Context "dashboard API"

$leaderboard = Invoke-CheckedJsonRequest -Url ($BackendBaseUrl + "/api/leaderboard/") -Label "leaderboard API"
Assert-JsonKeys -Object $leaderboard -Keys @("countries", "classifications", "tripLeaderboard", "authorLeaderboard") -Context "leaderboard API"

$tripDetail = Invoke-CheckedJsonRequest -Url ($BackendBaseUrl + "/api/trips/1/") -Label "trip detail API"
Assert-JsonKeys -Object $tripDetail -Keys @("id", "title", "summary", "itinerary", "reviews") -Context "trip detail API"
Write-Host "  OK  read APIs returned expected contract keys" -ForegroundColor Green

if ($IncludeWriteCheck) {
  Write-Host "Running write-path smoke check for checkout request persistence" -ForegroundColor Cyan

  $checkoutPayload = @{
    planKey = "bundle"
    source = "smoke-test"
    notes = "Checkout request created by smoke suite."
  } | ConvertTo-Json

  $checkoutResponse = Invoke-CheckedJsonRequest -Method "POST" -Url ($BackendBaseUrl + "/api/checkout/request/") -Label "checkout request API" -Body $checkoutPayload -WebSession $authSession
  Assert-JsonKeys -Object $checkoutResponse -Keys @("checkoutRequest", "message", "nextStep") -Context "checkout request API"
  Assert-JsonKeys -Object $checkoutResponse.checkoutRequest -Keys @("reference", "planKey", "planName", "amountDisplay", "status") -Context "checkout request payload"

  $dashboardAfterCheckout = Invoke-CheckedJsonRequest -Url ($BackendBaseUrl + "/api/dashboard/") -Label "dashboard checkout archive API" -WebSession $authSession
  if (-not ($dashboardAfterCheckout.checkoutRequests | Where-Object { $_.reference -eq $checkoutResponse.checkoutRequest.reference })) {
    throw "Saved checkout request $($checkoutResponse.checkoutRequest.reference) was not found in dashboard checkoutRequests."
  }

  Write-Host "Running write-path smoke check for consultancy profile persistence" -ForegroundColor Cyan

  $consultancyPayload = @{
    consultancy_mode = "Paid only"
    consultation_rate = "USD 95/session"
    consultancy_bio = "Smoke test consultancy profile update created at $timestamp"
  } | ConvertTo-Json

  $consultancyResponse = Invoke-CheckedJsonRequest -Method "POST" -Url ($BackendBaseUrl + "/api/profile/consultancy/") -Label "consultancy profile API" -Body $consultancyPayload -WebSession $authSession
  Assert-JsonKeys -Object $consultancyResponse -Keys @("message", "profile") -Context "consultancy profile API"
  Assert-JsonKeys -Object $consultancyResponse.profile -Keys @("consultancy_mode", "consultation_rate", "consultancy_bio") -Context "consultancy profile payload"

  if ($consultancyResponse.profile.consultancy_mode -ne "Paid only") {
    throw "Consultancy mode was not updated by the consultancy profile API."
  }

  $dashboardAfterConsultancyUpdate = Invoke-CheckedJsonRequest -Url ($BackendBaseUrl + "/api/dashboard/") -Label "dashboard consultancy archive API" -WebSession $authSession
  if ($dashboardAfterConsultancyUpdate.profile.consultancy_mode -ne "Paid only") {
    throw "Updated consultancy profile values were not returned by the dashboard API."
  }

  Write-Host "Running write-path smoke check for AI trip persistence" -ForegroundColor Cyan

  $payload = @{
    departureCountry = "Angola"
    destinationCountry = "Japan"
    travelStart = "2026-04-10"
    travelEnd = "2026-04-15"
    budget = "EUR 2500"
    travelStyle = "Cultural + food"
    transportPreference = "Flight + rail"
    accommodationLevel = "Mid-range boutique"
    tripGoals = "Smoke test verification $timestamp"
  } | ConvertTo-Json

  $createdTrip = Invoke-CheckedJsonRequest -Method "POST" -Url ($BackendBaseUrl + "/api/ai-trip-builder/preview/") -Label "AI trip builder API" -Body $payload -WebSession $authSession
  Assert-JsonKeys -Object $createdTrip -Keys @("summary", "itinerary", "savedTrip") -Context "AI trip builder API"
  Assert-JsonKeys -Object $createdTrip.savedTrip -Keys @("id", "title", "visibility", "author", "countries", "duration", "budget_range", "classifications") -Context "savedTrip payload"

  $savedTripId = $createdTrip.savedTrip.id
  if (-not $savedTripId) {
    throw "AI trip builder API did not return a saved trip id."
  }

  $dashboardAfterWrite = Invoke-CheckedJsonRequest -Url ($BackendBaseUrl + "/api/dashboard/") -Label "dashboard archive API" -WebSession $authSession
  if (-not ($dashboardAfterWrite.aiTrips | Where-Object { $_.id -eq $savedTripId })) {
    throw "Saved AI trip $savedTripId was not found in dashboard aiTrips."
  }

  $savedTripDetail = Invoke-CheckedJsonRequest -Url ($BackendBaseUrl + "/api/trips/$savedTripId/") -Label "saved trip detail API"
  Assert-JsonKeys -Object $savedTripDetail -Keys @("id", "title", "summary", "itinerary") -Context "saved trip detail API"

  $frontendTripRoute = Invoke-CheckedRequest -Url ($FrontendBaseUrl + "/trips/$savedTripId")
  Write-Host ("  OK  saved trip route /trips/{0} -> {1}" -f $savedTripId, $frontendTripRoute.StatusCode) -ForegroundColor Green

  Write-Host "Running write-path smoke check for manual trip documentation" -ForegroundColor Cyan

  $manualPayload = @{
    title = "Smoke Test Manual Trip $timestamp"
    destinationCountry = "South Africa"
    destinationCity = "Cape Town"
    additionalCountries = @()
    travelStart = "2026-02-10"
    travelEnd = "2026-02-16"
    classifications = @("Cultural", "Food")
    summary = "Manual trip record created by smoke test to verify the dashboard documentation flow."
      budgetRange = "USD 1,000 - 1,800"
    estimatedTotalPrice = "1450.00"
    travelerCount = 2
    visibility = "Public"
    itinerary = @(
        @{ day = "Day 1"; description = "Arrival, check-in, and an evening walk through the VA Waterfront." },
      @{ day = "Day 2"; description = "Bo-Kaap food stops, city center architecture, and local market research." }
    )
  } | ConvertTo-Json -Depth 5

  $manualTrip = Invoke-CheckedJsonRequest -Method "POST" -Url ($BackendBaseUrl + "/api/trips/document/") -Label "manual trip API" -Body $manualPayload -WebSession $authSession
  Assert-JsonKeys -Object $manualTrip -Keys @("createdTrip", "detailPath", "message") -Context "manual trip API"
  Assert-JsonKeys -Object $manualTrip.createdTrip -Keys @("id", "title", "visibility", "author", "countries", "duration", "budget_range", "classifications") -Context "manual createdTrip payload"

  $manualTripId = $manualTrip.createdTrip.id
  if (-not $manualTripId) {
    throw "Manual trip API did not return a created trip id."
  }

  $dashboardAfterManualWrite = Invoke-CheckedJsonRequest -Url ($BackendBaseUrl + "/api/dashboard/") -Label "dashboard manual archive API" -WebSession $authSession
  if (-not ($dashboardAfterManualWrite.trips | Where-Object { $_.id -eq $manualTripId })) {
    throw "Saved manual trip $manualTripId was not found in dashboard trips."
  }

  $manualTripDetail = Invoke-CheckedJsonRequest -Url ($BackendBaseUrl + "/api/trips/$manualTripId/") -Label "manual trip detail API"
  Assert-JsonKeys -Object $manualTripDetail -Keys @("id", "title", "summary", "itinerary") -Context "manual trip detail API"

  $frontendManualTripRoute = Invoke-CheckedRequest -Url ($FrontendBaseUrl + "/trips/$manualTripId")
  Write-Host ("  OK  manual trip route /trips/{0} -> {1}" -f $manualTripId, $frontendManualTripRoute.StatusCode) -ForegroundColor Green
}

Write-Host "Smoke checks passed." -ForegroundColor Green