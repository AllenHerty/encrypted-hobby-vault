# PowerShell script to deploy contract to Sepolia testnet
# Make sure to set MNEMONIC and INFURA_API_KEY in hardhat vars

Write-Host "Deploying contract to Sepolia testnet..." -ForegroundColor Cyan

# Deploy contract
npx hardhat deploy --network sepolia

# Get the deployed address from deployment logs
$deploymentFile = "deployments\sepolia\EncryptedPrivateExpenseLog.json"
if (Test-Path $deploymentFile) {
    $deployment = Get-Content $deploymentFile | ConvertFrom-Json
    $address = $deployment.address
    Write-Host "Contract deployed at: $address" -ForegroundColor Green
    
    # Update Addresses.ts
    Write-Host "Updating contract address in Addresses.ts..." -ForegroundColor Cyan
    & ".\scripts\update-contract-address.ps1" sepolia $address
    
    Write-Host "`nDeployment complete!" -ForegroundColor Green
    Write-Host "Contract Address: $address" -ForegroundColor Yellow
    Write-Host "Please update VITE_CONTRACT_ADDRESS in frontend/.env.local if needed" -ForegroundColor Yellow
} else {
    Write-Host "Error: Deployment file not found. Please check deployment logs." -ForegroundColor Red
}

