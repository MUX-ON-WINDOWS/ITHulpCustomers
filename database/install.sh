#!/bin/bash

echo "========================================"
echo "IT Hulp Database Installatie"
echo "========================================"
echo ""

# Vraag om database credentials
read -p "MySQL Gebruikersnaam (default: casaos): " DB_USER
DB_USER=${DB_USER:-casaos}

read -sp "MySQL Wachtwoord: " DB_PASSWORD
echo ""

read -p "Database naam (default: casaos): " DB_NAME
DB_NAME=${DB_NAME:-casaos}

echo ""
echo "Installeren van database schema..."
echo ""

# Voer SQL script uit
mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < schema.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "Database schema succesvol geïnstalleerd!"
    echo "========================================"
else
    echo ""
    echo "========================================"
    echo "Fout bij installeren van database schema"
    echo "Controleer je MySQL credentials"
    echo "========================================"
fi
