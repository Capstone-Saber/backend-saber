FROM node:16-alpine
WORKDIR /app
ENV PORT 5000
COPY . .
RUN npm install
EXPOSE 5000
CMD [ "npm", "run", "start"]