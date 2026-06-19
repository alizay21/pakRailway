# PakRail Automation - Selenium IDE Test Case Summary

## 1. Project Information
- **Project Name:** PakRail
- **Application URL:** `http://localhost:5173`
- **Purpose of Tests:** To automate and ensure the functional stability of both User and Admin modules of the PakRail web application using Selenium IDE.

## 2. Credentials Used
- **User Role:**
  - **Email:** passenger@pakrail.com
  - **Password:** test123
- **Admin Role:**
  - **Email:** admin@pakrail.com
  - **Password:** admin123

## 3. Test Suite Details
- **Test Suite Name:** PakRail Complete Testing Suite
- **Number of Test Cases:** 20

## 4. List of Test Cases
1. **User Login with Valid Credentials:** Validates successful login and redirects to the dashboard.
2. **User Login with Invalid Password:** Tests login validation and expected error messaging.
3. **User Dashboard Access Test:** Confirms the home dashboard loads correctly.
4. **User Train Search with Valid Route:** Performs a search from Lahore to Karachi.
5. **Train Search Validation Test:** Validates search form requirements.
6. **Train Selection Test:** Checks seat selection page transition after clicking 'Book' on search results.
7. **Seat Selection Test:** Automates seat picking (Economy class) and progressing to passenger details.
8. **User Ticket Booking Flow:** Inputs passenger details (Name, CNIC, Phone) and mock payment (Card info) to complete booking.
9. **Booking History Test:** Validates presence of booking records in "My Bookings" section.
10. **User Booking Cancellation Flow:** Automates the cancellation of a booking from "My Bookings".
11. **Logout and Session Validation:** Validates user logout functionality.
12. **Admin Login with Valid Credentials:** Tests admin authentication.
13. **Admin Dashboard Access:** Validates access to Admin Dashboard overview.
14. **Admin Train Management Validation:** Adds a new "QA Test Express" train with 50 seats.
15. **Admin Add Train Validation Test:** Validates the Train Addition form requirements.
16. **Admin Booking Management View:** Ensures admins can view the managed bookings list.
17. **Admin User Management Test:** Verified as Not Available in current build; checks navigation handling.
18. **Admin Logout Test:** Verifies the session ends for admin accounts securely.
19. **Restricted Route Access Test:** Tests role-based access to ensure users cannot load admin routes directly.
20. **Navigation Menu Test:** Confirms navigation items like "Track PNR" operate smoothly.

## 5. Test Data Used
- **User Bookings:** Passenger Name: Alizay Test, CNIC: 3520212345678, Phone: 03001234567
- **Admin Train Setup:** Train Name: QA Test Express, Train Number: QA123, Source: Lahore, Destination: Karachi.

## 6. Assumptions and Constraints
- The UI contains buttons and fields identifiable by text matching, name attributes, and index selection.
- Features like User Management under the Admin role are currently not available in `client/src/App.jsx`. These were omitted or logged as unavailable during testing.
- The `type=date` HTML5 locators assume the web browser implementation handles default `.value` property setting during type commands.

## 7. Instructions for Selenium IDE
1. Open Google Chrome or Firefox with the **Selenium IDE** extension installed.
2. Click **"Open an existing project"**.
3. Select `PakRail_Automation.side` from your file system.
4. Set the Base URL to match your local running instance (e.g., `http://localhost:5173`).
5. Select the **"PakRail Complete Testing Suite"** or individually run test cases by clicking the Play button.
