FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY cert.pem /etc/nginx/ssl/cert.pem
COPY key.pem /etc/nginx/ssl/key.pem
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
