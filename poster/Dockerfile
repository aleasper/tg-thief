FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Expose port
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
