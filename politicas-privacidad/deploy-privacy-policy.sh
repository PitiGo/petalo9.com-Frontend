#!/bin/bash

# Configuración
LOCAL_FILE="privacy-policy.html"
REMOTE_USER="root"
REMOTE_HOST="147.79.118.190"
REMOTE_PATH="/opt/petalo9-frontend/build"            # Cambiado para coincidir con tu directorio root en Nginx
NGINX_CONF_PATH="/etc/nginx/sites-available/default" # Ruta a tu archivo de configuración de Nginx

# Función para mostrar mensajes de error y salir
error_exit() {
  echo "❌ Error: $1" 1>&2
  exit 1
}

# Función para mostrar mensajes de progreso
log_message() {
  echo "🔄 $1"
}

# Verificar que el archivo de política de privacidad existe
[ -f "$LOCAL_FILE" ] || error_exit "El archivo $LOCAL_FILE no existe en el directorio actual"

# Transferir el archivo de política de privacidad
log_message "Subiendo archivo de política de privacidad al servidor..."
scp "$LOCAL_FILE" $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/ || error_exit "Falló la transferencia del archivo"

# Verificar permisos del archivo
log_message "Ajustando permisos del archivo..."
ssh $REMOTE_USER@$REMOTE_HOST "chmod 644 $REMOTE_PATH/$LOCAL_FILE" || error_exit "No se pudieron ajustar los permisos"

# Verificar si la configuración de Nginx ya tiene una ruta para la política de privacidad
log_message "Verificando configuración de Nginx..."
LOCATION_EXISTS=$(ssh $REMOTE_USER@$REMOTE_HOST "grep -c 'location = /privacy-policy.html' $NGINX_CONF_PATH" || echo "0")

if [ "$LOCATION_EXISTS" -eq "0" ]; then
  log_message "Añadiendo configuración para la política de privacidad en Nginx..."

  # Crear un archivo temporal con la configuración de location
  cat >nginx_privacy_location.tmp <<EOF
        location = /privacy-policy.html {
            expires 1h;
            add_header Cache-Control "public";
        }
EOF

  # Subir el archivo temporal al servidor
  scp nginx_privacy_location.tmp $REMOTE_USER@$REMOTE_HOST:/tmp/

  # Insertar la configuración en el archivo de Nginx (justo antes del bloque location /)
  ssh $REMOTE_USER@$REMOTE_HOST "
    # Buscar la ubicación para insertar (justo antes del bloque location / principal)
    SEARCH_PATTERN='location \\/ {'
    # Insertar la configuración
    sed -i \"/\$SEARCH_PATTERN/i\\$(cat /tmp/nginx_privacy_location.tmp)\" $NGINX_CONF_PATH
    # Eliminar el archivo temporal
    rm /tmp/nginx_privacy_location.tmp
  " || error_exit "No se pudo modificar la configuración de Nginx"

  # Eliminar el archivo temporal local
  rm nginx_privacy_location.tmp
fi

# Verificar y recargar la configuración de Nginx
log_message "Verificando y recargando la configuración de Nginx..."
ssh $REMOTE_USER@$REMOTE_HOST "
  nginx -t && systemctl reload nginx
" || error_exit "La configuración de Nginx es inválida o no se pudo recargar"

# Verificación final
log_message "Verificando acceso a la política de privacidad..."
SSH_CURL_CHECK="curl -s -I https://dantecollazzi.com/privacy-policy.html | grep -c '200 OK'"
CURL_RESULT=$(ssh $REMOTE_USER@$REMOTE_HOST "$SSH_CURL_CHECK" 2>/dev/null || echo "0")

if [ "$CURL_RESULT" -eq "1" ]; then
  echo "✅ Política de privacidad desplegada exitosamente!"
  echo "🌐 Puedes acceder a tu política de privacidad en: https://dantecollazzi.com/privacy-policy.html"
else
  echo "⚠️ La política de privacidad se ha subido pero puede haber problemas con el acceso."
  echo "📝 La política de privacidad está disponible en: https://dantecollazzi.com/privacy-policy.html"
  echo "🔍 Verifica manualmente accediendo a la URL."
fi
