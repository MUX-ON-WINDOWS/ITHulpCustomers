@echo off
echo ========================================
echo IT Hulp Database Installatie
echo ========================================
echo.

REM Vraag om database credentials
set /p DB_USER="MySQL Gebruikersnaam (default: casaos): "
if "%DB_USER%"=="" set DB_USER=casaos

set /p DB_PASSWORD="MySQL Wachtwoord: "
set /p DB_NAME="Database naam (default: casaos): "
if "%DB_NAME%"=="" set DB_NAME=casaos

echo.
echo Installeren van database schema...
echo.

REM Voer SQL script uit
mysql -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < schema.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Database schema succesvol geïnstalleerd!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo Fout bij installeren van database schema
    echo Controleer je MySQL credentials
    echo ========================================
)

pause
