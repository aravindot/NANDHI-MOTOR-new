# Nandhi Motors

## Backend authentication and local development

Every `/api` route requires a server-issued bearer token except
`POST /api/auth/login`. Configure the backend environment before signing in:

- `APP_USERNAME`: the dealership login username.
- `APP_PASSWORD`: a unique, strong login password. Do not commit it or expose
  it through a `VITE_` variable.
- `ALLOWED_ORIGINS`: comma-separated exact browser origins, including scheme
  and port (for example, `http://localhost:5173`). Set the production frontend
  origin in the backend host's environment settings.
- `MONGODB_URI`: the MongoDB connection string, kept only in backend secrets.
- `OLD_MONGODB_URI` and `NEW_MONGODB_URI`: migration-only secrets, required
  only when running `server/migrate.js`.

For local development, put these backend values in an ignored `server/.env`
file. The root `.env.example` shows the expected variable names; replace the
empty password with a strong local-only password. In Render, set
`APP_USERNAME`, `APP_PASSWORD`, `ALLOWED_ORIGINS`, and `MONGODB_URI` in the
backend service's environment settings. Deploy the backend and frontend
together so the frontend login uses the authenticated API.

Sessions are held in backend memory, expire after 20 minutes without API
activity, and are invalidated when the backend process restarts. Users must
sign in again after a restart.

If MongoDB credentials have ever been committed or shared, rotate/revoke them
in MongoDB Atlas and update the backend secret. Removing a credential from
the current source does not remove it from prior Git history; clean repository
history before redistributing a repository that contained active credentials.

## Vite template notes

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
