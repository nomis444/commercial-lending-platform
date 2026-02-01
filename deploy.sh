#!/bin/bash

# Commercial Lending Platform - Quick Deploy Script
# This script helps set up the project for deployment

echo "🚀 Commercial Lending Platform - Deploy Setup"
echo "=============================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📝 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Commercial Lending Platform"
    git branch -M main
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Build the project to check for errors
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Create a GitHub repository"
echo "2. Add remote: git remote add origin https://github.com/yourusername/commercial-lending-platform.git"
echo "3. Push code: git push -u origin main"
echo "4. Deploy to Vercel: https://vercel.com"
echo ""
echo "📋 Demo Accounts:"
echo "- Borrower: borrower@demo.com"
echo "- Investor: investor@demo.com"
echo "- Admin: admin@demo.com"
echo ""
echo "🎉 Ready for investor presentation!"