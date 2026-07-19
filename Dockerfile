# matar — static rain-sound PWA served by nginx
FROM nginx:1.27-alpine

# Site files (build context is filtered by .dockerignore)
COPY . /usr/share/nginx/html/
# Server config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Tidy up files that shouldn't be served
RUN rm -f /usr/share/nginx/html/Dockerfile \
          /usr/share/nginx/html/nginx.conf \
          /usr/share/nginx/html/docker-compose.yml

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q -O /dev/null http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
