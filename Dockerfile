# Use the official Node.js 20 runtime as the base image
FROM node:20-slim

# Install Python and other dependencies
RUN apt-get update && apt-get install -y python3 python3-pip

# Set the working directory
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Install Python dependencies
RUN pip3 install -r requirements.txt

# Expose the port the app runs on
EXPOSE 8080

# Define the environment variable for Cloud Run
ENV PORT=8080

# Start the application
CMD ["npm", "run", "start"]
