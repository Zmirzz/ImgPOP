# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) first
# This leverages Docker's layer caching
COPY package.json package-lock.json* yarn.lock* ./

# Install dependencies
# If you use yarn, replace with: RUN yarn install --frozen-lockfile
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Vite dev server runs on port 5173 by default (as per our package.json)
EXPOSE 5173

# Command to run the Vite dev server
# We need to add --host to make it accessible from outside the container
CMD ["npm", "run", "dev:react", "--", "--host", "0.0.0.0"] 