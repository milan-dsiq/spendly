# Spec: Registration

## Overview

Enable new users to create a Spendly account through the existing
`/register` page. This step converts the current GET-only route into a
full registration flow: the form POSTs `name`, `email`, and `password`,
the server validates input, hashes the password with `werkzeug`, and
inserts a new row into the `users` table created in Step 1. On success
the user is redirected to the sign-in page; on failure the form is
re-rendered with an inline error. Registration is the second building
block of the Spendly roadmap — it is the prerequisite for login,
sessions, and every per-user feature that follows.

## Depends on

- Step 1 — Database Setup (`users` table, `get_db()`, password hashing
  helpers already wired in `database/db.py`).

## Routes

- `GET /register` — render the registration form — public *(already
  exists, keep behaviour unchanged)*
- `POST /register` — validate form, create user, redirect to `/login`
  with a success flash; on failure re-render `register.html` with an
  `error` message — public

## Database changes

No new tables or columns. Registration writes to the existing
`users(name, email, password_hash)` columns. The `UNIQUE` constraint on
`email` is relied on to prevent duplicates.

## Templates

- **Create:** none.
- **Modify:**
  - `templates/register.html` — no structural change required; it
    already POSTs to `/register` and renders `{{ error }}` when
    present. Confirm the `name="name" | "email" | "password"` fields
    match what the route reads. If a success flash is displayed on the
    login page, also render `{% with messages = get_flashed_messages() %}`
    in `templates/login.html`.

## Files to change

- `app.py` — replace the current `GET`-only `register` view with a
  handler that accepts `GET` and `POST`, performs validation, and
  inserts into the database. Add a Flask `secret_key` (needed for
  flash messages) and import `request`, `redirect`, `url_for`, and
  `flash` from Flask.
- `database/db.py` — add two small helpers used by the view:
  - `get_user_by_email(email)` — returns a row or `None`.
  - `create_user(name, email, password)` — hashes the password with
    `werkzeug.security.generate_password_hash` and inserts a row;
    returns the new `user_id`.
- `templates/login.html` — render flashed messages so the
  “Account created — please sign in” confirmation is visible after the
  redirect.

## Files to create

- None.

## New dependencies

No new dependencies. `flask`, `werkzeug`, and `sqlite3` are already
available via `requirements.txt`.

## Rules for implementation

- No SQLAlchemy or ORMs — use raw `sqlite3` via `get_db()`.
- Parameterised queries only — never build SQL with f-strings or
  concatenation.
- Passwords hashed with `werkzeug.security.generate_password_hash`; the
  raw password must never be written to the database or logged.
- Use CSS variables from `static/css/style.css` for any styling tweaks
  — never hardcode hex values.
- All templates extend `base.html`.
- Keep validation in the view thin and explicit:
  - `name`, `email`, `password` must all be non-empty after `.strip()`.
  - `password` must be at least 8 characters.
  - `email` must be lowercased before insert and lookup.
- Catch `sqlite3.IntegrityError` on insert to convert the UNIQUE-email
  violation into a friendly error message rather than a 500.
- On success, `flash("Account created — please sign in.")` and
  `redirect(url_for("login"))`. Do not auto-login the user (sessions
  land in Step 3).
- Set `app.secret_key` from an environment variable with a safe
  development fallback; do not commit a production secret.

## Definition of done

- [ ] `GET /register` still renders `register.html` with no error.
- [ ] Submitting the form with valid details creates exactly one row
  in `users` with a hashed password (verify via `sqlite3`).
- [ ] Submitting with a duplicate email re-renders `register.html`
  showing “An account with that email already exists.”
- [ ] Submitting with an empty field or a password shorter than 8
  characters re-renders the form with a clear inline error and does
  not create a row.
- [ ] After a successful registration the browser is redirected to
  `/login` and the flash message “Account created — please sign in.”
  is visible.
- [ ] `database/db.py` exposes `get_user_by_email` and `create_user`
  and both use parameterised queries.
- [ ] Running `python app.py` starts without errors and all existing
  routes (`/`, `/login`, `/terms`) continue to work.
- [ ] No raw password appears anywhere in the database or server logs.
