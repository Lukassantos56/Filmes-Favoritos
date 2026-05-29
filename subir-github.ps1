# Envia o projeto para o GitHub (rode depois de: gh auth login)

$git = "C:\Program Files\Git\cmd\git.exe"
$dir = $PSScriptRoot
$repoName = "filmes-favoritos"

Set-Location $dir

if (-not (Test-Path $git)) {
  Write-Error "Git nao encontrado. Instale: https://git-scm.com/download/win"
  exit 1
}

$gh = Get-Command gh -ErrorAction SilentlyContinue
if (-not $gh) {
  Write-Error "GitHub CLI nao encontrado. Instale: winget install GitHub.cli"
  exit 1
}

gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Faca login no GitHub primeiro:"
  gh auth login
}

Write-Host "Criando repositorio $repoName e enviando codigo..."
gh repo create $repoName --public --source=. --remote=origin --push

if ($LASTEXITCODE -eq 0) {
  Write-Host "Pronto! Veja seu repo em: https://github.com/$(gh api user -q .login)/$repoName"
}
