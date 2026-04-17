# Vadmin3 - Project Documentation

## Overview
Admin panel with blog, generated using Laravel (API) + React (Frontend). Connected only via REST API.

## Environment

- **Server**: VPS with Nginx (production)
- **Database**: MySQL (production)

## Local Development

The project can also be run locally. Check the `.env` files:
- **Production (VPS)**: `APP_ENV=production`
- **Local**: `APP_ENV=local` with SQLite database

## Structure

```
/home/vadmin/htdocs/vadmin.studiovimana.com.ar/vadmin3/
backend/          # Laravel API
frontend/         # React source
dist/         # Built static files (served by Nginx)
frontend/src/     # React source code
```

## URLs
- **Frontend**: 
- **Backend API**: 

## Tech Stack
- **Backend**: Laravel 11, SQLite (dev) / MySQL (prod), Laravel Sanctum
- **Frontend**: React (Vite), Tailwind CSS v4, shadcn/ui, Axios

## Commands

### Backend (Laravel)
```bash
cd backend

# Install dependencies
composer install

# Run migrations
php artisan migrate

# Clear cache
php artisan cache:clear
php artisan route:clear
php artisan config:clear

# Tinker (database debugging)
php artisan tinker
```

### Frontend (React)
```bash
cd frontend

# Install dependencies
npm install

# Development
npm run dev

# Build production
npm run build
```

## Key Files

### Backend
- `backend/routes/api.php` - API routes
- `backend/app/Http/Controllers/` - Controllers
- `backend/app/Models/` - Eloquent models
- `backend/database/migrations/` - Database migrations

### Frontend
- `frontend/src/App.jsx` - Main router
- `frontend/src/views/` - Page components
- `frontend/src/components/` - Reusable components
- `frontend/src/i18n/locales/` - Translations (es.json, en.json)

## API Endpoints

### Auth
- `POST /api/login` - Login
- `GET /api/user` - Current user
- `PUT /api/profile` - Update profile

### Blog
- `GET /api/articles` - List articles
- `POST /api/articles` - Create article
- `PUT /api/articles/{id}` - Update article
- `PATCH /api/articles/{id}` - Quick update
- `DELETE /api/articles/{id}` - Delete article


## Features
- Role-Based Access Control (RBAC)
- Dark/Light mode
- Internationalization (ES/EN)
- Media upload with crop
- Activity logs
