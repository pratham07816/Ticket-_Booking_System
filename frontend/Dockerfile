# Step 1: Use Node image
FROM node:18

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy package.json and install dependencies
COPY package*.json ./
RUN npm ci

# Step 4: Copy all source files
COPY . .

# Step 5: Build Vite app
RUN npm run build

# Step 6: Install serve to serve dist folder
RUN npm install -g serve

# Step 7: Expose port 3000
EXPOSE 3000

# Step 8: Start the app
CMD ["serve", "-s", "dist", "-l", "3000"]

