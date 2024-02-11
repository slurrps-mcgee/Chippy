#nginx base image
FROM nginx:alpine

#copy source folder to /usr/share/nignx/html
COPY . /usr/share/nginx/html

#expose port 80
EXPOSE 80