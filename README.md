# Academic Integrity Full Authentication System

This workspace contains:

- `academic-integrity-frontend` – React/Vite client application
- `backend` – Node.js/Express server with MongoDB authentication

The system supports user registration, login, password reset, and
JWT-protected routes.

## Backend Setup

1. **Navigate to the backend folder**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   - Copy `.env.example` to `.env` and fill in your values:
     ```ini
     MONGO_URI=mongodb://localhost:27017/academic_integrity
     JWT_SECRET=your_jwt_secret_here
     JWT_EXPIRES_IN=1d
     EMAIL_SERVICE=gmail
     EMAIL_USER=your.email@gmail.com
     EMAIL_PASS=your_email_password
     BASE_URL=http://localhost:3000
     ```
   - `BASE_URL` is used when composing the password reset link that is
     emailed to users.

4. **Start the server**
   ```bash
   npm run dev    # uses nodemon
   ```

   The API will be available at `http://localhost:5000/api`.

### Important backend locations

| File | Purpose |
|------|---------|
| `models/User.js` | Mongoose schema with password hashing and reset token fields |
| `controllers/authController.js` | Register/login/forgot/reset logic plus JWT generation |
| `routes/auth.js` | Public routes for authentication operations |
| `middleware/authMiddleware.js` | `protect` middleware that validates the JWT |
| `utils/sendEmail.js` | Simple wrapper around Nodemailer to send emails |

Protected endpoints (e.g. `/api/dashboard`) are guarded with the `protect`
middleware.

---

## Frontend Setup

1. **Go to the frontend directory**
   ```bash
   cd academic-integrity-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

   The React app will run at `http://localhost:5173`.

### Features implemented

- **Auth context** (`src/context/AuthContext.jsx`) stores JWT in
  `localStorage` and exposes `login()`/`logout()` helpers.
- **Axios instance** (`src/api/axios.js`) automatically attaches the
  bearer token to every request.
- **Pages** added:
  - `Register.jsx` – user signup
  - `Login.jsx` – authentication with redirect to dashboard
  - `ForgotPassword.jsx` – sends reset token to email
  - `ResetPassword.jsx` – set new password using token
- **Routes** configured in `App.jsx` for public and protected views.
- **ProtectedRoute** component ensures only authenticated users can access
  dashboard, courses, reports and detail pages.
- **Navbar** includes a logout button that clears the token.

The login, registration, and password‑reset forms connect to the backend
API and display error messages returned by the server.

---

## How it works

1. **Registration**: POST `/api/auth/register` with `{name,email,password}`.
   The password is hashed in the model, a JWT is returned and stored in
   `localStorage` by the frontend.
2. **Login**: POST `/api/auth/login` with credentials. A JWT is returned.
3. **Token storage**: the token is kept in `localStorage` and added to
   every axios request; `AuthContext` tracks authentication state.
4. **Protected routes**: frontend uses `ProtectedRoute` to block access
   unless `isAuthenticated` is true. Backend routes use `protect` to
   verify the token and attach `req.user`.
5. **Forgot password**: POST to `/api/auth/forgot-password` with an
   email. The server generates a temporary token, saves a hash to the
   user document along with expiry (15 minutes), and emails the token
   using Nodemailer.
6. **Reset password**: PUT to `/api/auth/reset-password/:token` with a
   new password. The server verifies the hashed token and expiry, then
   updates the user’s password (hashing it) and clears reset fields.

---

## Running the entire system

1. Start MongoDB locally (e.g. `mongod`).
2. Launch the backend (`cd backend && npm run dev`).
3. In another terminal start the frontend (`cd academic-integrity-frontend && npm run dev`).
4. Use the browser to navigate to `http://localhost:5173`, register a user,
   then log in. Once authenticated you can visit `/dashboard`, `/courses`, etc.
5. To test password reset, use the forgot-password screen; check the
   email configured in `.env` to retrieve the token link.

---

Feel free to extend the models, add validation, or integrate with a real
mail service when moving to production.
