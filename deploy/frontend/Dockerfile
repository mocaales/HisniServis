# Slika samo streže artefakt joba build (frontend/dist) prek nginx.
FROM nginx:1.29-alpine
# Render nastavi PORT; nginx ga ob zagonu vstavi v predlogo.
ENV PORT=10000
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY dist/ /usr/share/nginx/html/
EXPOSE 10000
