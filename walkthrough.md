# Walkthrough: Login Functionality and Role-Based Access

I have implemented a login function before accessing the index page and added role-based access control for "Hotel Users".

## Changes Made

### Database
- Created a migration file `migrations/002_add_role_and_hotel_id_to_admins.sql` to add `role` and `hotel_id` columns to the `admins` table.
- **IMPORTANT**: You need to run this SQL against your database manually as I could not execute it in this environment.

```sql
ALTER TABLE admins ADD COLUMN role ENUM('super_admin', 'hotel_user') DEFAULT 'super_admin';
ALTER TABLE admins ADD COLUMN hotel_id INT NULL;
ALTER TABLE admins ADD CONSTRAINT fk_admins_hotel_id FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE SET NULL;
```

### Backend
- Updated `src/models/Admin.js` to support `role` and `hotel_id`.
- Updated `src/services/adminAuthService.js` to include `role` and `hotel_id` in the JWT token and return user info on login.
- Updated `src/controllers/adminAuthController.js` to return the user info.
- Updated `src/services/adminManagementService.js` and `src/controllers/adminManagementController.js` to allow creating admins with a specific role and hotel assignment.
- Updated `server.js` to:
    - Serve a new login page at `/login`.
    - Protect the root route `/` (Index) to require authentication.

### Frontend
- Created `public/login.html` for user login.
- Updated `public/js/admin.js` to redirect "hotel_user" to `/` and "super_admin" to `/admin/dashboard` after login.
- Updated `public/index.html` to display a dashboard for hotel users with:
    - Token information card showing remaining tokens
    - Schedule history table with status indicators (Upcoming/Completed)
    - Registration form moved to a modal
- Updated `public/js/user.js` to:
    - Check if the user is authenticated.
    - If authenticated and assigned to a hotel, pre-select that hotel and disable the dropdown.
    - Load and display token information and schedule history.
    - Handle modal opening/closing for registration.

### API Endpoints
- Added `GET /api/vouchers/history/:hotelId` to fetch voucher history for a specific hotel.

## How to Test

1.  **Apply Database Changes**: Run the SQL commands from `migrations/002_add_role_and_hotel_id_to_admins.sql`.
2.  **Restart Server**: Restart your Node.js server.
3.  **Create a Hotel User**:
    - Log in as a Super Admin at `/admin/login`.
    - Go to "Admins" management (`/admin/admins`).
    - Use the "Add New Admin" form:
        - Enter Email and Password.
        - Select Role: "Hotel User".
        - A "Assign Hotel" dropdown will appear. Select the hotel (required).
        - Click "Add Admin".
    - The admin table will now show the Role and Hotel for each admin user.
    - Hotel Users will have a blue badge, Super Admins will have a purple badge.
4.  **Login as Hotel User**:
    - Go to `/login`.
    - Log in with the new hotel user credentials.
    - You should be redirected to `/` (Index).
    - You will see:
        - A token information card at the top showing remaining tokens
        - A schedule history table showing all registered trainings
        - Past schedules marked as "Completed" (grayed out)
        - Upcoming schedules marked as "Upcoming" (green)
        - A "Register New Training" button to open the registration modal
    - Click "Register New Training" to open the modal and register for a new schedule.
    - The hotel dropdown will be locked to the assigned hotel.

## Next Steps
- Update the Admin Dashboard UI to allow selecting Role and Hotel when creating a new admin.
