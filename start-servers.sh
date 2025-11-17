#!/bin/bash

# ============================================
# SCRIPT PARA INICIAR SERVIDORES
# Backend + Frontend
# ============================================

echo "==========================================="
echo "🚀 INICIANDO SISTEMA ELECTORAL"
echo "==========================================="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -ano | grep ":$port " | grep "LISTENING" >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detectado${NC}"
echo ""

# Verificar si los puertos ya están en uso
if check_port 3002; then
    echo -e "${YELLOW}⚠️  Puerto 3002 (backend) ya está en uso${NC}"
    read -p "¿Desea continuar de todos modos? (s/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

if check_port 3000; then
    echo -e "${YELLOW}⚠️  Puerto 3000 (frontend) ya está en uso${NC}"
    read -p "¿Desea continuar de todos modos? (s/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

# Crear directorio de logs si no existe
mkdir -p logs

# Iniciar Backend
echo -e "${BLUE}📦 Iniciando Backend (Puerto 3002)...${NC}"
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo -e "${GREEN}✅ Backend iniciado (PID: $BACKEND_PID)${NC}"
echo "   Log: logs/backend.log"
echo ""

# Esperar 5 segundos para que el backend inicie
echo "⏳ Esperando 5 segundos para que el backend inicie..."
sleep 5

# Verificar que el backend esté respondiendo
echo "🔍 Verificando backend..."
if curl -s http://localhost:3002/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend respondiendo correctamente${NC}"
else
    echo -e "${RED}❌ Backend no responde. Ver logs/backend.log${NC}"
fi
echo ""

# Iniciar Frontend
echo -e "${BLUE}🎨 Iniciando Frontend (Puerto 3000)...${NC}"
npm run dev > logs/frontend.log 2>&1 &
FRONTEND_PID=$!

echo -e "${GREEN}✅ Frontend iniciado (PID: $FRONTEND_PID)${NC}"
echo "   Log: logs/frontend.log"
echo ""

# Esperar 10 segundos para que el frontend compile
echo "⏳ Esperando 10 segundos para que el frontend compile..."
sleep 10

# Verificar que el frontend esté respondiendo
echo "🔍 Verificando frontend..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend respondiendo correctamente${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend aún compilando. Ver logs/frontend.log${NC}"
fi
echo ""

# Resumen
echo "==========================================="
echo "✅ SERVIDORES INICIADOS"
echo "==========================================="
echo ""
echo -e "${BLUE}Backend:${NC}"
echo "  - URL: http://localhost:3002"
echo "  - API: http://localhost:3002/api"
echo "  - Health: http://localhost:3002/health"
echo "  - PID: $BACKEND_PID"
echo "  - Log: logs/backend.log"
echo ""
echo -e "${BLUE}Frontend:${NC}"
echo "  - URL: http://localhost:3000"
echo "  - PID: $FRONTEND_PID"
echo "  - Log: logs/frontend.log"
echo ""
echo "==========================================="
echo ""
echo "📝 Para detener los servidores:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "   O usar el script: ./stop-servers.sh"
echo ""
echo "📊 Ver logs en tiempo real:"
echo "   tail -f logs/backend.log"
echo "   tail -f logs/frontend.log"
echo ""
echo "==========================================="

# Guardar PIDs en archivo
echo "$BACKEND_PID" > logs/backend.pid
echo "$FRONTEND_PID" > logs/frontend.pid

echo "PIDs guardados en logs/*.pid"
