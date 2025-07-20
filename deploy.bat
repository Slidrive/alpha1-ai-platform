@echo off
echo ========================================
echo Alpha1 AI Platform - Quick Deployment
echo ========================================
echo.

echo Checking if Railway CLI is installed...
railway --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Railway CLI...
    npm install -g @railway/cli
)

echo.
echo ========================================
echo DEPLOYMENT OPTIONS:
echo ========================================
echo.
echo 1. RAILWAY (Recommended - Fast)
echo    - Automatic scaling
echo    - Built-in database
echo    - Free tier available
echo.
echo 2. HEROKU (Traditional)
echo    - Extensive add-ons
echo    - Well documented
echo    - Free tier available
echo.
echo 3. MANUAL (Custom server)
echo    - Full control
echo    - Custom configuration
echo    - Requires server setup
echo.

set /p choice="Choose deployment option (1, 2, or 3): "

if "%choice%"=="1" goto railway
if "%choice%"=="2" goto heroku
if "%choice%"=="3" goto manual
goto invalid

:railway
echo.
echo ========================================
echo RAILWAY DEPLOYMENT
echo ========================================
echo.
echo Step 1: Login to Railway (opens browser)
railway login
echo.
echo Step 2: Initialize project
railway init --name alpha1-ai-platform
echo.
echo Step 3: Deploy
railway up
echo.
echo Step 4: Get your live URL
railway status
echo.
echo ✅ Deployment complete!
echo Your platform is live. Check the URL above.
goto end

:heroku
echo.
echo ========================================
echo HEROKU DEPLOYMENT
echo ========================================
echo.
echo Step 1: Login to Heroku
heroku login
echo.
echo Step 2: Create app
heroku create alpha1-ai-platform
echo.
echo Step 3: Deploy
git push heroku main
echo.
echo ✅ Deployment complete!
echo Your platform is live at: https://alpha1-ai-platform.herokuapp.com
goto end

:manual
echo.
echo ========================================
echo MANUAL DEPLOYMENT
echo ========================================
echo.
echo For manual deployment:
echo 1. Copy all files to your server
echo 2. Install Python 3.11+
echo 3. Run: pip install -r backend/requirements.txt
echo 4. Set environment variables
echo 5. Run: python backend/app.py
echo.
echo See DEPLOYMENT_STRATEGY.md for detailed instructions.
goto end

:invalid
echo Invalid choice. Please run the script again and choose 1, 2, or 3.
goto end

:end
echo.
echo ========================================
echo POST-DEPLOYMENT CHECKLIST:
echo ========================================
echo.
echo 1. Test main platform at your live URL
echo 2. Test waitlist at your-url/waitlist.html
echo 3. Test voice communication features
echo 4. Test file upload functionality
echo 5. Share waitlist URL to start collecting users
echo.
echo 🚀 Your Alpha1 AI Platform is ready!
echo.
pause