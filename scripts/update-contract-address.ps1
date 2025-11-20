# PowerShell script to update contract address after deployment
# Usage: .\scripts\update-contract-address.ps1 <network> <address>
# Example: .\scripts\update-contract-address.ps1 sepolia 0x1234...

param(
    [Parameter(Mandatory=$true)]
    [string]$Network,
    
    [Parameter(Mandatory=$true)]
    [string]$Address
)

$AddressesFile = "frontend\src\abi\Addresses.ts"

if (-not (Test-Path $AddressesFile)) {
    Write-Host "Error: Addresses.ts file not found at $AddressesFile" -ForegroundColor Red
    exit 1
}

$content = Get-Content $AddressesFile -Raw

if ($Network -eq "localhost" -or $Network -eq "31337") {
    $content = $content -replace 'localhost: "0x[0-9a-fA-F]{40}"', "localhost: `"$Address`""
    Write-Host "Updated localhost address to $Address" -ForegroundColor Green
} elseif ($Network -eq "sepolia" -or $Network -eq "11155111") {
    $content = $content -replace 'sepolia: "0x[0-9a-fA-F]{40}"', "sepolia: `"$Address`""
    Write-Host "Updated sepolia address to $Address" -ForegroundColor Green
} else {
    Write-Host "Error: Unknown network $Network" -ForegroundColor Red
    Write-Host "Supported networks: localhost, sepolia" -ForegroundColor Yellow
    exit 1
}

Set-Content -Path $AddressesFile -Value $content -NoNewline
Write-Host "Contract address updated successfully!" -ForegroundColor Green

