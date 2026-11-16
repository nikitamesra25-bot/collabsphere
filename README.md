# CollabSphere

CollabSphere is a full-stack project collaboration application.

## Features

- User registration and login
- JWT authentication
- Create and manage projects
- Project notes
- File upload and deletion
- Gemini AI assistant
- Public project sharing

## Technologies

Frontend:
- React
- Vite
- React Router
- CSS

Backend:
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Multer
- Gemini API

## Run the backend

cd server
npm install
npm run dev

## Run the frontend

cd client
npm install
npm run dev

## Environment variables

Configure the root .env file with:

PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
GEMINI_API_KEY=your_gemini_api_key
