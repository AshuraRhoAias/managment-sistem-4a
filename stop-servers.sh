#!/bin/bash

# ============================================
# SCRIPT PARA DETENER SERVIDORES
# Backend + Frontend
# ============================================

echo "==========================================="
echo "🛑 DETENIENDO SERVIDORES"
echo "==========================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Función para detener proceso
stop_process() {
    local name=$1
    local pid=$2

    if [ -z "$pid" ]; then
        echo -e "${RED}❌ PID no encontrado para $name${NC}"
        return 1
    fi

    if ps -p $pid > /dev/null 2>&1; then
        echo "🛑 Deteniendo $name (PID: $pid)..."
        kill $pid 2>/dev/null
        sleep 2

        if ps -p $pid > /dev/null 2>&1; then
            echo "⚠️  Forzando detención de $name..."
            kill -9 $pid 2>/dev/null
        fi

        echo -e "${GREEN}✅ $name detenido${NC}"
    else
        echo "⚠️  $name no está ejecutándose"
    fi
}

# Leer PIDs de archivos
if [ -f logs/backend.pid ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    stop_process "Backend" $BACKEND_PID
    rm -f logs/backend.pid
else
    echo "⚠️  Archivo logs/backend.pid no encontrado"
fi

echo ""

if [ -f logs/frontend.pid ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    stop_process "Frontend" $FRONTEND_PID
    rm -f logs/frontend.pid
else
    echo "⚠️  Archivo logs/frontend.pid no encontrado"
fi

echo ""

# Buscar y matar procesos en los puertos (fallback)
echo "🔍 Buscando procesos en puertos 3002 y 3000..."

# Puerto 3002 (Backend)
PORT_3002_PID=$(lsof -ti:3002 2>/dev/null || netstat -ano | grep ":3002 " | grep "LISTENING" | awk '{print $5}' | head -1)
if [ ! -z "$PORT_3002_PID" ]; then
    echo "🛑 Deteniendo proceso en puerto 3002 (PID: $PORT_3002_PID)..."
    kill -9 $PORT_3002_PID 2>/dev/null
fi

# Puerto 3000 (Frontend)
PORT_3000_PID=$(lsof -ti:3000 2>/dev/null || netstat -ano | grep ":3000 " | grep "LISTENING" | awk '{print $5}' | head -1)
if [ ! -z "$PORT_3000_PID" ]; then
    echo "🛑 Deteniendo proceso en puerto 3000 (PID: $PORT_3000_PID)..."
    kill -9 $PORT_3000_PID 2>/dev/null
fi

echo ""
echo "==========================================="
echo "✅ SERVIDORES DETENIDOS"
echo "==========================================="
