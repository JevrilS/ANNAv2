# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the app
RUN npm run build

# Serve the app using serve package
RUN npm install -g serve
CMD ["serve", "-s", "build"]

# Expose the port the app will run on
EXPOSE 3000
