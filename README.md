# E-Library: A Book of Collected Knowledge

A digital library management system built with SvelteKit, Drizzle ORM, and SQLite.

## Setup Instructions

Follow these steps to set up the E-Library project after cloning it from GitHub.

### 1. Install Dependencies

```bash
# Install all required dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory with the following content:

```
DATABASE_URL="file:E-lib.db"
AUTH_SECRET="QWERTYUIOPASDFGHJKLZXCVBNMQWERTY"

```

Create a `.env.example` the root directory with the following content:

```
DATABASE_URL="libsql://db-name-user.turso.io"
DATABASE_AUTH_TOKEN=""
AUTH_SECRET="QWERTYUIOPASDFGHJKLZXCVBNMQWERTY"

```

Replace `your-auth-secret-key` with a secure random string.

### 3. Database Setup

Run the following commands to set up and initialize the database:

```bash
# Initialize the database structure
npm run db:init

# Run database migrations
npm run migrate

# Push schema changes to the database
npm run db:push

# Seed the database with an admin user
npm run seed

# Add test users (optional)
npm run seed:test
```

After running the seed commands, you'll have access to these accounts:

- Admin login:
  - Email: `admin@example.com`
  - Password: `admin123`

- Test user (if you ran seed:test):
  - Email: `user@example.com`
  - Password: `password123`

### 4. Running the Application

```bash
# Start the development server
npm run dev

# Or to open it in a new browser tab automatically
npm run dev -- --open
```

### 5. Database Management

The project includes several utility scripts for database management:

```bash
# Check database content
npm run db:check

# Fix user data if needed
npm run db:fix

# Open the database studio for visual management
npm run db:studio
```

### 6. Building for Production

```bash
# Create a production build
npm run build

# Preview the production build
npm run preview
```

## Project Structure

- `/src/routes` - Contains all routes and page components
- `/src/lib` - Shared libraries and components
  - `/components` - Reusable UI components
  - `/server` - Server-side code
    - `/db` - Database configuration and schema
    - `/auth` - Authentication utilities

## Technologies Used

- SvelteKit - Frontend framework
- Drizzle ORM - Database ORM
- SQLite (via LibSQL) - Database
- TailwindCSS - Styling
- bcryptjs - Password hashing
