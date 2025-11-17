#!/bin/bash

# ============================================
# SCRIPT DE INSTALACIÓN RÁPIDA
# Sistema Electoral con Cifrado de 5 Capas
# ============================================

echo "==========================================="
echo "🚀 INSTALACIÓN DEL SISTEMA ELECTORAL"
echo "==========================================="
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instalar Node.js >= 18.0.0"
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"

# Verificar MySQL
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL no detectado. Asegúrese de tenerlo instalado y configurado."
fi

echo ""
echo "📦 Instalando dependencias del BACKEND..."
cd backend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error al instalar dependencias del backend"
    exit 1
fi

echo ""
echo "📦 Instalando dependencias del FRONTEND..."
cd ..
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error al instalar dependencias del frontend"
    exit 1
fi

echo ""
echo "⚙️  Configurando archivos de entorno..."

# Backend .env
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Archivo backend/.env creado"
    echo "⚠️  IMPORTANTE: Editar backend/.env y configurar:"
    echo "   - Credenciales de base de datos"
    echo "   - Generar claves de cifrado únicas"
    echo "   - Configurar JWT secrets"
else
    echo "⚠️  backend/.env ya existe, no se sobrescribe"
fi

# Frontend .env
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Archivo .env creado (frontend)"
else
    echo "⚠️  .env ya existe, no se sobrescribe"
fi

echo ""
echo "==========================================="
echo "✅ INSTALACIÓN COMPLETADA"
echo "==========================================="
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo ""
echo "1. Configurar base de datos:"
echo "   mysql -u root -p < dbserver_completo_32_estados.sql"
echo ""
echo "2. Editar backend/.env con sus configuraciones"
echo ""
echo "3. Generar claves de cifrado:"
echo "   node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
echo ""
echo "4. Iniciar el backend:"
echo "   cd backend && npm run dev"
echo ""
echo "5. En otra terminal, iniciar el frontend:"
echo "   npm run dev"
echo ""
echo "==========================================="
