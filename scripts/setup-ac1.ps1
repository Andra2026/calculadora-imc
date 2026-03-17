# FitTrack — Setup AC1 (Projeto de Software)
# Integra: Git CLI, Supabase CLI, GitHub CLI
# Execute no PowerShell: .\scripts\setup-ac1.ps1

$ErrorActionPreference = "Stop"

Write-Host "`n=== FitTrack — Setup AC1 ===" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar ferramentas instaladas
function Test-Command($cmd) {
    try {
        Get-Command $cmd -ErrorAction Stop | Out-Null
        return $true
    } catch { return $false }
}

$missing = @()
if (-not (Test-Command "git")) { $missing += "Git (https://git-scm.com)" }
if (-not (Test-Command "supabase")) { $missing += "Supabase CLI (npm i -g supabase)" }
if (-not (Test-Command "gh")) { $missing += "GitHub CLI (https://cli.github.com)" }

if ($missing.Count -gt 0) {
    Write-Host "Instale as ferramentas abaixo antes de continuar:" -ForegroundColor Yellow
    $missing | ForEach-Object { Write-Host "  - $_" }
    Write-Host ""
    Write-Host "Supabase CLI: npm install -g supabase" -ForegroundColor Gray
    exit 1
}

Write-Host "[OK] Git, Supabase CLI e GitHub CLI encontrados" -ForegroundColor Green

# 2. Git — init e primeiro commit (se necessário)
if (-not (Test-Path ".git")) {
    Write-Host "`n[Git] Inicializando repositório..." -ForegroundColor Cyan
    git init
    git branch -M main
    Write-Host "[OK] Repositório Git criado" -ForegroundColor Green
} else {
    Write-Host "`n[Git] Repositório já existe" -ForegroundColor Gray
}

# 3. Supabase — login e link
Write-Host "`n[Supabase] Faça login (abre o navegador):" -ForegroundColor Cyan
supabase login

$projectRef = Read-Host "`nCole o Project ID do Supabase (da URL: supabase.com/dashboard/project/XXXXX)"
if ([string]::IsNullOrWhiteSpace($projectRef)) {
    Write-Host "Project ID não informado. Execute manualmente: supabase link --project-ref SEU_PROJECT_ID" -ForegroundColor Yellow
} else {
    Write-Host "Conectando ao projeto Supabase..." -ForegroundColor Cyan
    supabase link --project-ref $projectRef
    Write-Host "[OK] Projeto Supabase vinculado" -ForegroundColor Green

    Write-Host "`nAplicando migrações no banco remoto..." -ForegroundColor Cyan
    supabase db push
    Write-Host "[OK] Migrações aplicadas" -ForegroundColor Green
}

# 4. .env.local
if (-not (Test-Path ".env.local")) {
    Copy-Item ".env.local.example" ".env.local"
    Write-Host "`n[Env] .env.local criado. Edite e preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Yellow
    Write-Host "  (Settings > API no dashboard Supabase)" -ForegroundColor Gray
} else {
    Write-Host "`n[Env] .env.local já existe" -ForegroundColor Gray
}

# 5. GitHub — criar repo e push (opcional)
Write-Host "`n[GitHub] Deseja criar o repositório no GitHub agora? (s/n)" -ForegroundColor Cyan
$createRepo = Read-Host
if ($createRepo -eq "s" -or $createRepo -eq "S") {
    $repoName = Read-Host "Nome do repositório (padrão: fittrack)"
    if ([string]::IsNullOrWhiteSpace($repoName)) { $repoName = "fittrack" }

    gh auth status 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Faça login no GitHub: gh auth login" -ForegroundColor Yellow
    } else {
        gh repo create $repoName --private --source=. --remote=origin --push
        Write-Host "[OK] Repositório criado e código enviado" -ForegroundColor Green
    }
}

# 6. Resumo
Write-Host "`n=== Próximos passos ===" -ForegroundColor Cyan
Write-Host "1. Edite .env.local com URL e anon key do Supabase (Settings > API)"
Write-Host "2. npm install && npm run dev"
Write-Host "3. Acesse http://localhost:3000"
Write-Host "4. Para a entrega AC1: PDF com nomes, link do board, link do GitHub, vídeo"
Write-Host ""
