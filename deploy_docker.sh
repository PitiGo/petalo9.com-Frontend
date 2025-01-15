#!/bin/bash

# Configuración
LOCAL_DIR="/Users/dantecollazzi/Desktop/petalo9/petalo9.com-Frontend-main"
REMOTE_USER="root"
REMOTE_HOST="147.79.118.190"
REMOTE_PATH="/opt/petalo9-frontend"

# Función para mostrar mensajes de error y salir
error_exit() {
    echo "❌ Error: $1" 1>&2
    exit 1
}

# Función para mostrar mensajes de progreso
log_message() {
    echo "🔄 $1"
}

# Verificar que estamos en el directorio correcto
cd "$LOCAL_DIR" || error_exit "No se puede acceder al directorio $LOCAL_DIR"

# Actualizar dependencias y hacer build
log_message "Actualizando dependencias..."
npm install || error_exit "Falló la instalación de dependencias"

log_message "Actualizando browserslist..."
npx update-browserslist-db@latest

log_message "Generando build de producción..."
npm run build || error_exit "Falló la generación del build"

# Verificar que index.html existe localmente
[ -f "build/index.html" ] || error_exit "index.html no encontrado en el build local"
log_message "Build generado correctamente ✅"

# Preparar servidor remoto
log_message "Preparando servidor remoto..."
ssh $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_PATH" || error_exit "No se pudo crear el directorio remoto"

# Transferir archivos necesarios para Docker
log_message "Transfiriendo archivos al servidor..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.env' \
    ./ \
    $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/ || error_exit "Falló la transferencia de archivos"

# Configurar Docker en el servidor
log_message "Configurando Docker en el servidor..."
ssh $REMOTE_USER@$REMOTE_HOST "
    # Instalar Docker si no está instalado
    if ! command -v docker &> /dev/null; then
        apt-get update && \
        apt-get install -y docker.io docker-compose && \
        systemctl start docker && \
        systemctl enable docker
    fi

    # Detener contenedores existentes
    cd $REMOTE_PATH
    docker-compose down

    # Eliminar imágenes antiguas
    docker image prune -f

    # Construir y levantar contenedores
    docker-compose build --no-cache
    docker-compose up -d
"

# Verificar estado de los contenedores
log_message "Verificando estado de los contenedores..."
ssh $REMOTE_USER@$REMOTE_HOST "
    cd $REMOTE_PATH
    docker-compose ps
    docker-compose logs --tail=50
"

# Configurar nginx
log_message "Verificando configuración de nginx..."
ssh $REMOTE_USER@$REMOTE_HOST "
    nginx -t && \
    systemctl reload nginx
"

# Verificación final
log_message "Verificación final del despliegue..."
ssh $REMOTE_USER@$REMOTE_HOST "
    echo 'Estado de los servicios:'
    docker-compose ps
    echo 'Estado de nginx:'
    systemctl status nginx | grep Active
"

echo "✅ Despliegue completado exitosamente!"
echo "🌐 Puedes acceder a tu sitio en: https://dantecollazzi.com"
echo "🐳 Contenedores Docker desplegados y funcionando"