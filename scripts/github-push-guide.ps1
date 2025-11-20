# GitHub Push Guide for Soul Shards

Write-Host "=== GitHub Push Guide for Soul Shards ===" -ForegroundColor Cyan
Write-Host ""

# Check git status
Write-Host "1. Checking git status..." -ForegroundColor Yellow
git status --short

Write-Host ""
Write-Host "2. Current git configuration:" -ForegroundColor Yellow
git config --list | Select-String "user.name|user.email|remote.origin.url"

Write-Host ""
Write-Host "3. To push to GitHub, follow these steps:" -ForegroundColor Green
Write-Host ""

Write-Host "Step 1: Create GitHub Personal Access Token" -ForegroundColor Yellow
Write-Host "   - Go to: https://github.com/settings/tokens" -ForegroundColor White
Write-Host "   - Click 'Generate new token (classic)'" -ForegroundColor White
Write-Host "   - Select scopes: 'repo' (full control of private repositories)" -ForegroundColor White
Write-Host "   - Copy the generated token" -ForegroundColor White
Write-Host ""

Write-Host "Step 2: Push to GitHub" -ForegroundColor Yellow
Write-Host "   Run this command:" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 3: Authentication" -ForegroundColor Yellow
Write-Host "   When prompted:" -ForegroundColor White
Write-Host "   - Username: water4699" -ForegroundColor White
Write-Host "   - Password: [paste your Personal Access Token here]" -ForegroundColor White
Write-Host ""

Write-Host "Step 4: Verify push success" -ForegroundColor Yellow
Write-Host "   After successful push, visit:" -ForegroundColor White
Write-Host "   https://github.com/AllenHerty/encrypted-hobby-vault" -ForegroundColor Cyan
Write-Host ""

Write-Host "=== Alternative: Use GitHub CLI ===" -ForegroundColor Green
Write-Host "If you have GitHub CLI installed:" -ForegroundColor White
Write-Host "gh auth login" -ForegroundColor Cyan
Write-Host "git push -u origin main" -ForegroundColor Cyan
Write-Host ""

Write-Host "=== Project Files Ready to Push ===" -ForegroundColor Green
Get-ChildItem -Name | Where-Object { $_ -notin @("node_modules", "artifacts", "cache", "types", "frontend/dist", "fhevmTemp", ".git") } | ForEach-Object {
    Write-Host "✓ $_" -ForegroundColor White
}
