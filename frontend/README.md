# Instagram Clone

A full-stack Instagram-inspired social application built with React, Vite,
Express, MongoDB, and Socket.IO.

## Prerequisites

- Node.js and npm
- A MongoDB database
- Cloudinary credentials for media uploads

## Local development

1. Install backend dependencies and configure its environment:

   ```powershell
   cd backend
   npm install
   ```

   Create `backend/.env` with:

   ```dotenv
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_long_random_secret
   CLIENT_URL=http://localhost:5173
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   PORT=5000
   ```

2. Start the backend:

   ```powershell
   npm run dev
   ```

3. In a separate terminal, install and start the frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

   The frontend uses `http://localhost:5000/api` for API requests and derives
   the Socket.IO server origin from that URL by default.

## Frontend configuration

Set `VITE_API_URL` in the frontend environment to the backend API base URL,
including `/api` (for example, `https://api.example.com/api`). The Socket.IO
connection uses that URL's origin by default. Set `VITE_SOCKET_URL` only when
the socket server is hosted at a different origin.

Vite exposes `VITE_*` variables to browser code, so do not put secrets in them.

## Quality checks

Run these commands from `frontend`:

```powershell
npm run lint
npm run build
```
