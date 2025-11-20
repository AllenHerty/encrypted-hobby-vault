# PowerShell script to set Hardhat environment variables
# This script sets the required variables for deployment

Write-Host "Setting Hardhat environment variables..." -ForegroundColor Cyan

# Set INFURA_API_KEY
$infuraKey = "b18fb7e6ca7045ac83c41157ab93f990"
Write-Host "Setting INFURA_API_KEY..." -ForegroundColor Yellow
$env:INFURA_API_KEY = $infuraKey

Write-Host "`nVariables set. You can now deploy using:" -ForegroundColor Green
Write-Host "  npx hardhat deploy --network sepolia" -ForegroundColor Yellow
Write-Host "`nOr use the deploy script:" -ForegroundColor Green
Write-Host "  .\scripts\deploy-sepolia.ps1" -ForegroundColor Yellow

