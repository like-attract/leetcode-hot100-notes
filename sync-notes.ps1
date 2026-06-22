$ErrorActionPreference = "Stop"

Set-Location -LiteralPath $PSScriptRoot

Write-Host "== LeetCode Hot100 notes sync ==" -ForegroundColor Cyan
Write-Host "Repository: $PSScriptRoot"
Write-Host ""

git rev-parse --is-inside-work-tree | Out-Null

Write-Host "Pulling latest changes..."
git pull --rebase --autostash

$changes = git status --porcelain
if (-not $changes) {
    Write-Host ""
    Write-Host "No local changes to sync." -ForegroundColor Green
    exit 0
}

Write-Host ""
Write-Host "Changes to publish:"
git status --short

Write-Host ""
Write-Host "Staging changes..."
git add -A -- .

$commitMessage = "update notes $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
Write-Host "Committing: $commitMessage"
git commit -m $commitMessage

Write-Host ""
Write-Host "Pushing to GitHub..."
git push

Write-Host ""
Write-Host "Sync complete. GitHub Pages will update shortly." -ForegroundColor Green
