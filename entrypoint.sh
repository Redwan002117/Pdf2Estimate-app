#!/bin/sh

# Inject environment variables into config.js at runtime
echo "window.env = {" > /usr/share/nginx/html/config.js
echo "  VITE_GEMINI_API_KEY: \"$VITE_GEMINI_API_KEY\"" >> /usr/share/nginx/html/config.js
echo "};" >> /usr/share/nginx/html/config.js

# Start Nginx
exec nginx -g "daemon off;"
