FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Check if session.txt exists and create it if not
# RUN if [ ! -f session.txt ]; then echo "Session file not found. Creating session.txt..." && touch session.txt; fi

# Expose port
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
