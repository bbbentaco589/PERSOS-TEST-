Set-Location C:\pss-beta-web-ascii
$ErrorActionPreference = "Stop"
$port = 3010

function Read-SecretText([string]$prompt) {
    $secure = Read-Host $prompt -AsSecureString
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
        [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    }
}

Write-Host "`n=== PERSOS Gemini Live Demo 설정 ===" -ForegroundColor Cyan
Write-Host "입력값은 화면에 표시되지 않습니다.`n"

$geminiKey = Read-SecretText "Gemini API Key"
$databaseUrl = Read-SecretText "Neon DATABASE_URL (Pooled URL)"
$databaseDirectUrl = Read-SecretText "Neon DATABASE_URL_DIRECT (Direct URL)"

if (
    [string]::IsNullOrWhiteSpace($geminiKey) -or
    [string]::IsNullOrWhiteSpace($databaseUrl) -or
    [string]::IsNullOrWhiteSpace($databaseDirectUrl)
) {
    throw "Gemini Key와 Neon URL을 모두 입력해야 합니다."
}

$triggerSecret = [Convert]::ToBase64String(
    [Security.Cryptography.RandomNumberGenerator]::GetBytes(48)
)

$startAt = (Get-Date).AddMinutes(-5).ToString("yyyy-MM-ddTHH:mm:sszzz")
$endAt = (Get-Date).AddHours(2).ToString("yyyy-MM-ddTHH:mm:sszzz")

$envContent = @"
PERSISTENCE_PROVIDER=postgres
DATABASE_URL=$databaseUrl
DATABASE_URL_DIRECT=$databaseDirectUrl
TEST_DATABASE_URL=

AI_PROVIDER=gemini
GEMINI_API_KEY=$geminiKey
GEMINI_MODEL=gemini-3.5-flash-lite
GEMINI_TIMEOUT_MS=30000

NEXT_PUBLIC_SITE_URL=http://localhost:$port
NEXT_PUBLIC_DEPLOYMENT_MODE=preview

LIVE_DEMO_MODE=true
LIVE_DEMO_START_AT=$startAt
LIVE_DEMO_END_AT=$endAt
AI_GENERATION_ENABLED=true
AI_AUTO_PUBLISH=true

AI_MAX_TOTAL_CALLS=40
AI_MAX_RETRIES=1
AI_MAX_CHAT_RUNS=18
AI_MAX_CHAT_MESSAGES=30
AI_MAX_FEED_POSTS=5
AI_MAX_DEBATE_MESSAGES=10

DEMO_TRIGGER_SECRET=$triggerSecret
DEMO_BASE_URL=http://localhost:$port
"@

Set-Content `
    -LiteralPath ".env.local" `
    -Value $envContent `
    -Encoding UTF8

$geminiKey = $null
$databaseUrl = $null
$databaseDirectUrl = $null
$envContent = $null

Write-Host "`n[1/6] 환경파일 생성 완료" -ForegroundColor Green

Write-Host "[2/6] 의존성 확인 중..." -ForegroundColor Cyan
npm.cmd install
if ($LASTEXITCODE -ne 0) { throw "npm install 실패" }

Write-Host "[3/6] Neon Migration 실행 중..." -ForegroundColor Cyan
npm.cmd run db:migrate
if ($LASTEXITCODE -ne 0) { throw "DB Migration 실패" }

Write-Host "[4/6] TypeScript 검사 중..." -ForegroundColor Cyan
npm.cmd run typecheck
if ($LASTEXITCODE -ne 0) { throw "Typecheck 실패" }

Write-Host "[5/6] 개발 서버 시작 중..." -ForegroundColor Cyan
$server = Start-Process `
    -FilePath "npm.cmd" `
    -ArgumentList @("run", "dev", "--", "--port", "$port") `
    -WorkingDirectory "C:\pss-beta-web-ascii" `
    -WindowStyle Hidden `
    -PassThru

$serverReady = $false

for ($attempt = 1; $attempt -le 60; $attempt++) {
    try {
        $response = Invoke-WebRequest `
            -Uri "http://localhost:$port/discussion/public" `
            -UseBasicParsing `
            -TimeoutSec 2

        if ($response.StatusCode -eq 200) {
            $serverReady = $true
            break
        }
    }
    catch {
        Start-Sleep -Seconds 1
    }
}

if (-not $serverReady) {
    throw "로컬 서버가 60초 안에 시작되지 않았습니다. PID: $($server.Id)"
}

Write-Host "[6/6] Gemini 실제 생성 테스트 중..." -ForegroundColor Cyan

$headers = @{
    Authorization = "Bearer $triggerSecret"
    "Content-Type" = "application/json"
}

Write-Host "`nTECT Demo Content Plan 생성..." -ForegroundColor Yellow
$planResult = Invoke-RestMethod `
    -Uri "http://localhost:$port/api/live-demo/trigger" `
    -Method Post `
    -Headers $headers `
    -Body '{"action":"plan"}'

$planResult | ConvertTo-Json -Depth 8

Write-Host "`n첫 콘텐츠 Tick 실행..." -ForegroundColor Yellow
$tickResult = Invoke-RestMethod `
    -Uri "http://localhost:$port/api/live-demo/trigger" `
    -Method Post `
    -Headers $headers `
    -Body '{"action":"tick"}'

$tickResult | ConvertTo-Json -Depth 8

Write-Host "`n현재 Live Demo 상태..." -ForegroundColor Yellow
$statusResult = Invoke-RestMethod `
    -Uri "http://localhost:$port/api/live-demo/trigger" `
    -Method Get `
    -Headers $headers

$statusResult | ConvertTo-Json -Depth 6

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Gemini 연결 및 생성 테스트 완료" -ForegroundColor Green
Write-Host "공개 피드: http://localhost:$port/discussion/public"
Write-Host "찬반 토론: http://localhost:$port/discussion/debate"
Write-Host "익명 채팅: http://localhost:$port/discussion/anonymous"
Write-Host "서버 PID: $($server.Id)"
Write-Host "========================================`n" -ForegroundColor Green
