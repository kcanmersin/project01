# ---- Build Stage ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Create the env directory that Vite expects (envDir: '../infrastructure')
ARG VITE_API_URL=""
RUN mkdir -p /infrastructure && \
    echo "VITE_API_URL=${VITE_API_URL}" > /infrastructure/.env

RUN npm run build

# ---- Production Stage ----
FROM nginx:alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html

# SPA routing: redirect all requests to index.html
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
