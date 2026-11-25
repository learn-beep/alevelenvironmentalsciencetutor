@echo off
cd /d "%~dp0"
for %%f in (site-*.zip) do (
  echo Extracting %%f
  tar -xf "%%f"
)
echo.
echo Done. You can close this window.
pause
