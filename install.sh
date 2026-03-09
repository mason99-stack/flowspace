#!/bin/bash
set -e

# ─────────────────────────────────────────────
#  FlowSpace — Instalador local
#  Uso: curl -fsSL https://raw.githubusercontent.com/mason99-stack/flowspace/main/install.sh | bash
# ─────────────────────────────────────────────

REPO="https://github.com/mason99-stack/flowspace"
INSTALL_DIR="$HOME/.flowspace"
DATA_DIR="$HOME/.flowspace"
BIN_DIR="/usr/local/bin"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo ""
echo -e "${PURPLE}  ✦ FlowSpace${NC}"
echo -e "  Tu segundo cerebro — instalación local"
echo ""

# ── 1. Comprobar Node.js ──────────────────────
if ! command -v node &> /dev/null; then
  echo -e "${RED}✕ Node.js no encontrado.${NC}"
  echo "  Instálalo desde https://nodejs.org (versión 18 o superior)"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}✕ Node.js v18+ requerido. Tienes $(node -v)${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# ── 2. Comprobar git ──────────────────────────
if ! command -v git &> /dev/null; then
  echo -e "${RED}✕ git no encontrado. Instala git primero.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ git $(git --version | cut -d' ' -f3)${NC}"

# ── 3. Clonar o actualizar ────────────────────
if [ -d "$INSTALL_DIR/app" ]; then
  echo -e "${BLUE}↻ Actualizando FlowSpace...${NC}"
  cd "$INSTALL_DIR/app"
  git pull --quiet
else
  echo -e "${BLUE}↓ Descargando FlowSpace...${NC}"
  mkdir -p "$INSTALL_DIR"
  git clone --quiet "$REPO" "$INSTALL_DIR/app"
  cd "$INSTALL_DIR/app"
fi

# ── 4. Instalar dependencias ──────────────────
echo -e "${BLUE}📦 Instalando dependencias...${NC}"
npm install --silent

# ── 5. Build de la app ────────────────────────
echo -e "${BLUE}🔨 Compilando FlowSpace...${NC}"
npm run build --silent

# ── 6. Crear directorio de datos ─────────────
mkdir -p "$DATA_DIR"
echo -e "${GREEN}✓ Datos en $DATA_DIR/data.json${NC}"

# ── 7. Crear comando 'flowspace' ─────────────
LAUNCHER="$INSTALL_DIR/app/start.sh"
cat > "$LAUNCHER" << 'SCRIPT'
#!/bin/bash
cd "$HOME/.flowspace/app"
node server/index.js
SCRIPT
chmod +x "$LAUNCHER"

# Symlink a /usr/local/bin si tenemos permisos, si no a ~/.local/bin
if [ -w "$BIN_DIR" ]; then
  ln -sf "$LAUNCHER" "$BIN_DIR/flowspace"
  echo -e "${GREEN}✓ Comando 'flowspace' disponible globalmente${NC}"
else
  mkdir -p "$HOME/.local/bin"
  ln -sf "$LAUNCHER" "$HOME/.local/bin/flowspace"
  echo -e "${GREEN}✓ Comando 'flowspace' en ~/.local/bin${NC}"
  echo "  Añade esto a tu ~/.bashrc si no está:"
  echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
fi

# ── 8. Listo ──────────────────────────────────
echo ""
echo -e "${PURPLE}  ✦ FlowSpace instalado correctamente${NC}"
echo ""
echo "  Para iniciar:"
echo -e "  ${GREEN}flowspace${NC}"
echo ""
echo "  O directamente:"
echo -e "  ${GREEN}node ~/.flowspace/app/server/index.js${NC}"
echo ""
echo "  Se abrirá en: http://localhost:3000"
echo ""

# Preguntar si iniciar ahora
read -p "  ¿Iniciar FlowSpace ahora? [S/n] " REPLY
REPLY=${REPLY:-S}
if [[ $REPLY =~ ^[Ss]$ ]]; then
  echo -e "${BLUE}  Iniciando...${NC}"
  # Intentar abrir el navegador
  (sleep 2 && (xdg-open http://localhost:3000 || open http://localhost:3000)) &
  node "$INSTALL_DIR/app/server/index.js"
fi
