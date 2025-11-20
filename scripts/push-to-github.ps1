# PowerShell script to push Soul Shards project to GitHub

Write-Host "Pushing Soul Shards project to GitHub..." -ForegroundColor Cyan

# Check if git is initialized
if (!(Test-Path ".git")) {
    Write-Host "Initializing git repository..." -ForegroundColor Yellow
    git init
}

# Configure git user
git config user.name "water4699"
git config user.email "water4699@github.com"

# Add remote if not exists
$remotes = git remote
if ($remotes -notcontains "origin") {
    Write-Host "Adding remote origin..." -ForegroundColor Yellow
    git remote add origin https://github.com/AllenHerty/encrypted-hobby-vault.git
}

# Create .gitignore if not exists
if (!(Test-Path ".gitignore")) {
    Write-Host "Creating .gitignore..." -ForegroundColor Yellow
    @"
# Dependencies
node_modules/
frontend/node_modules/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
frontend/.env.local

# Build outputs
artifacts/
cache/
types/
frontend/dist/
fhevmTemp/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Hardhat
deployments/localhost/
.cache/

# Videos
*.avi
*.mov

# Temporary files
*.tmp
*.bak
"@ | Out-File -FilePath .gitignore -Encoding UTF8
}

# Add all files
Write-Host "Adding files..." -ForegroundColor Yellow
git add .

# Commit if there are changes
$status = git status --porcelain
if ($status) {
    Write-Host "Committing changes..." -ForegroundColor Yellow
    git commit -m "Initial commit: Soul Shards - Encrypted Private Expense Log

Complete FHE expense tracking application with:
- Smart contract for encrypted data storage
- React frontend with wallet integration
- Category-emotion correlation analysis
- Expense pressure trend visualization
- Multi-network support (localhost + Sepolia)"
}

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "Note: You may need to authenticate with GitHub" -ForegroundColor Yellow
Write-Host "If prompted, use your GitHub username and Personal Access Token as password" -ForegroundColor Yellow

try {
    git branch -M main
    git push -u origin main

    Write-Host "Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "Repository: https://github.com/AllenHerty/encrypted-hobby-vault" -ForegroundColor Green
} catch {
    Write-Host "Push failed. Please check your GitHub authentication." -ForegroundColor Red
    Write-Host "You can manually push using:" -ForegroundColor Yellow
    Write-Host "git push -u origin main" -ForegroundColor Yellow
    Write-Host "Make sure you have a Personal Access Token from GitHub." -ForegroundColor Yellow
}
