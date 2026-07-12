# Migrate Authentication to Email Login and Dedicated OTP Collections

This plan updates the authentication system to use `email` as the primary login identifier and migrates OTP management to dedicated MongoDB collections with TTL (Time-To-Live) indexes and bcrypt hashing for enhanced security.

## User Review Required

> [!WARNING]
> This is a breaking change to the authentication schema. Existing users who have an unverified state or an ongoing password reset via the old schema will lose their OTP state. Existing users will now log in with their email instead of their username. 

## Proposed Changes

### Backend Changes

#### [MODIFY] [mongodb.py](file:///e:/ai-data-analyst/backend/app/db/mongodb.py)
- Create `password_resets` collection with a TTL index on `expires_at` (300 seconds).
- Create `email_verifications` collection with a TTL index on `expires_at` (600 seconds).
- Create indexes on `user_id` for both new collections.

#### [MODIFY] [schemas.py](file:///e:/ai-data-analyst/backend/app/models/schemas.py)
- Update `LoginRequest` to require `email` instead of `username`.
- Update `ResetPasswordRequest` to only require `email`, `password`, and `otp` (remove `username`).

#### [MODIFY] [auth.py](file:///e:/ai-data-analyst/backend/app/api/routes/auth.py)
- **Register**: Instead of saving `verification_otp` on the user document, hash the generated OTP with `bcrypt` and insert a record into the `email_verifications` collection. Ensure we handle "username already exists" with a clear message.
- **Verify OTP**: Query the `email_verifications` collection for the user. Verify the OTP against the hash using bcrypt. Update the `users` document `is_verified` to `True` and mark the OTP as `used: True`.
- **Login**: Change the authentication query to look up the user by `email` instead of `username`.
- **Forgot Password**: Instead of saving `forgot_password_otp` on the user document, hash the generated OTP with `bcrypt` and insert a record into the `password_resets` collection.
- **Reset Password**: Query the `password_resets` collection for the user. Verify the OTP against the hash. Update the user's password and mark the OTP as `used: True`. Remove `username` from the payload check.

---

### Frontend Changes

#### [MODIFY] [UserContext.jsx](file:///e:/ai-data-analyst/frontend/src/context/UserContext.jsx)
- Update the `login` function to accept and send `email` instead of `username`.
- Update the `resetPassword` function to send only `email`, `password`, and `otp`.

#### [MODIFY] [Auth.jsx](file:///e:/ai-data-analyst/frontend/src/pages/Auth.jsx)
- **Login Form**: Replace the `Username` input field with an `Email Address` input field.
- **Verify OTP Form**: Make the `Email Address` field read-only/disabled so the user doesn't have to retype it (it will auto-fill from the registration flow).
- **Reset Password Form**: Remove the `Username` input field completely.

## Verification Plan

### Automated Tests
- No automated test suite provided, but we will ensure the Python code compiles and uvicorn starts successfully.

### Manual Verification
1. Run `uvicorn app.main:app --reload` to ensure DB indexes are created successfully.
2. Attempt to register a new user. Verify the email field is auto-filled and locked on the OTP screen.
3. Verify the OTP using the database direct value (or console log).
4. Attempt to log in with the registered email and password.
5. Attempt a password reset flow, verifying the username field is gone and the OTP is accepted properly.
