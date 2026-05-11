# Y-TRACK Admin Dashboard

A multi-tenant Monitoring & Evaluation system for youth platforms with integrated Vercel Web Analytics.

## Project Structure

- `/backend` - Flask API backend
- `/app` - Next.js frontend with Vercel Analytics

## Features

- ✅ Vercel Web Analytics integrated
- 🔥 Next.js 16 with App Router
- 📊 Flask REST API backend
- 🎯 TypeScript support
- 📱 Responsive design

## Getting Started

### Frontend (Next.js)

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
npm start
```

The frontend will be available at [http://localhost:3000](http://localhost:3000).

### Backend (Flask)

Navigate to the backend directory:
```bash
cd backend
```

Install Python dependencies (recommended: use a virtual environment):
```bash
pip install flask flask-cors
```

Run the Flask server:
```bash
python app.py
```

The API will be available at [http://localhost:5000](http://localhost:5000).

## Vercel Web Analytics

This project has been configured with Vercel Web Analytics following the official documentation.

### Configuration Details

- **Package**: `@vercel/analytics` v2.0.1
- **Integration**: Next.js App Router
- **Location**: `app/layout.tsx`

The Analytics component is placed at the root layout level to track all pages automatically.

### Enabling Analytics on Vercel

1. Deploy this project to Vercel
2. Go to your project dashboard on Vercel
3. Navigate to the Analytics tab
4. Click "Enable Web Analytics"

Analytics will start collecting data once deployed and enabled.

## API Endpoints

- `GET /` - Root endpoint with API information
- `GET /health` - Health check
- `POST /api/v1/auth/login` - User authentication
- `GET /api/v1/platforms` - Get all platforms
- `GET /api/v1/beneficiaries` - Get all beneficiaries
- `GET /api/v1/programs` - Get all programs

## Deployment

### Deploy to Vercel

The easiest way to deploy this project is using the Vercel platform:

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## License

ISC
