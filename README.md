# BluAssist Frontend

React frontend application for the BluAssist chatbot platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure API URL (optional):
   - Create a `.env` file based on `.env.example`
   - Set `VITE_API_URL` if your backend is running on a different URL
   - Default: Uses Vite proxy in development (`/api` → `http://localhost:3000/api`)

3. Start the development server:
```bash
npm run dev
```

## Backend Connection

The frontend is connected to the backend API with the following features:

### Authentication
- **Login**: User authentication with email/password
- **Registration**: Tenant registration with company details
- **Token Management**: Automatic token storage and refresh
- **Protected Routes**: Authentication state management

### API Integration
- All API calls go through `/api` endpoints
- Automatic token injection in request headers
- Error handling and user feedback

### Features
- Login/Register modals
- User authentication state
- Protected content based on auth status
- Logout functionality

## Backend Requirements

Make sure your backend is running on `http://localhost:3000` (or configure `VITE_API_URL`).

The backend should have:
- `/api/auth/login` - Login endpoint
- `/api/auth/me` - Get current user
- `/api/auth/logout` - Logout endpoint
- `/api/tenants/register` - Tenant registration

## Development

The app uses:
- React 19
- Vite for build tooling
- Context API for state management
- CSS Variables for theming

## Build

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```
