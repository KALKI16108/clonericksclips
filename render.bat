@echo off
setlocal enabledelayedexpansion

echo =======================================================
echo          Remotion + Three.js Local Fast Renderer
echo =======================================================
echo.

if "%1"=="" goto menu
if /i "%1"=="preview" goto preview
if /i "%1"=="full" goto full
if /i "%1"=="shot" goto shot
if /i "%1"=="shots" goto shots
if /i "%1"=="scale1080" goto scale1080
if /i "%1"=="benchmark" goto benchmark
if /i "%1"=="test" goto test
goto help

:menu
echo Select render mode:
echo   1. Fast Preview Render (540x960, no heavy DOF, audio muxed - FASTEST)
echo   2. Full Production Render (720x1280, full effects, audio muxed)
echo   3. Per-Shot Modular Render (Renders shots 1-9 to build/shots/ and joins via ffmpeg)
echo   4. Render Single Shot (e.g. shot 1, 2, 3...)
echo   5. 1080p Upscale (High-quality Lanczos upscale of final video to 1080x1920)
echo   6. GPU vs Software Benchmark (5-second 150-frame comparison)
echo   7. Quick Test (30 frames)
echo   8. Exit
echo.
set /p choice="Enter choice [1-8]: "

if "%choice%"=="1" goto preview
if "%choice%"=="2" goto full
if "%choice%"=="3" goto shots
if "%choice%"=="4" goto prompt_shot
if "%choice%"=="5" goto scale1080
if "%choice%"=="6" goto benchmark
if "%choice%"=="7" goto test
if "%choice%"=="8" goto end
echo Invalid choice.
goto end

:prompt_shot
set /p shot_num="Enter shot number (1 to 9): "
cd build\remotion_test
node scripts/render.mjs shot %shot_num%
cd ..\..
goto end

:preview
echo.
echo [Starting Fast Preview Render: 540x960]...
cd build\remotion_test
node scripts/render.mjs preview
cd ..\..
goto end

:full
echo.
echo [Starting Full Production Render: 720x1280]...
cd build\remotion_test
node scripts/render.mjs full
cd ..\..
goto end

:shot
cd build\remotion_test
node scripts/render.mjs shot %2
cd ..\..
goto end

:shots
echo.
echo [Starting Per-Shot Modular Render + FFmpeg Join]...
cd build\remotion_test
node scripts/render.mjs shots
cd ..\..
goto end

:scale1080
echo.
echo [Starting 1080x1920 Lanczos Upscale]...
cd build\remotion_test
node scripts/render.mjs scale1080
cd ..\..
goto end

:benchmark
echo.
echo [Running GPU vs Software Benchmark]...
cd build\remotion_test
node scripts/render.mjs benchmark
cd ..\..
goto end

:test
echo.
echo [Rendering 30 test frames]...
cd build\remotion_test
node scripts/render.mjs test
cd ..\..
goto end

:help
echo Usage: render.bat [preview ^| full ^| shot ^<n^> ^| shots ^| scale1080 ^| benchmark ^| test]
goto end

:end
echo.
echo Done.
pause
