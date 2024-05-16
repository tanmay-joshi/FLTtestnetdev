# Use an official Node runtime as a parent image
FROM node:22.1.0

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./
COPY .env ./
COPY FlocLoyaltyToken.json ./

# Install any needed packages specified in package.json
RUN npm install

# Bundle your app source inside the Docker image
COPY . .

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Define environment variable
ENV NODE_ENV=production

# Run app.js when the container launches
CMD ["node", "app.js"]
