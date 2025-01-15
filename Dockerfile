FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
ENV REACT_APP_API_URL=https://api.dantecollazzi.com
RUN npm run build
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]