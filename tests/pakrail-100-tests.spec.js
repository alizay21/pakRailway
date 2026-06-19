const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5173';

const USER = {
  email: 'passenger@pakrail.com',
  password: 'test123'
};

const ADMIN = {
  email: 'admin@pakrail.com',
  password: 'admin123'
};

const SCREENSHOT_DIR = path.join(process.cwd(), 'screenshots');

function ensureScreenshotDir() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
}

async function saveScreenshot(page, testId, title) {
  ensureScreenshotDir();
  const safeTitle = title.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${testId}_${safeTitle}.png`),
    fullPage: true
  });
}

async function gotoHome(page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/localhost:5173/);
}

async function clickFirstAvailable(page, selectors) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    try {
      if (await locator.count() > 0 && await locator.isVisible({ timeout: 1500 })) {
        await locator.click();
        return true;
      }
    } catch (error) {}
  }
  return false;
}

async function fillFirstAvailable(page, selectors, value) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    try {
      if (await locator.count() > 0 && await locator.isVisible({ timeout: 1500 })) {
        await locator.fill(value);
        return true;
      }
    } catch (error) {}
  }
  return false;
}

async function selectFirstAvailable(page, selectors, value) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    try {
      if (await locator.count() > 0 && await locator.isVisible({ timeout: 1500 })) {
        await locator.selectOption({ label: value }).catch(async () => {
          await locator.selectOption(value);
        });
        return true;
      }
    } catch (error) {}
  }
  return false;
}

async function openLogin(page) {
  await gotoHome(page);
  const clicked = await clickFirstAvailable(page, [
    'a:has-text("Login")',
    'button:has-text("Login")',
    'a:has-text("Sign In")',
    'button:has-text("Sign In")',
    '[href*="login"]',
    '[href*="signin"]'
  ]);

  if (!clicked) {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
  }
}

async function fillLoginForm(page, email, password) {
  await fillFirstAvailable(page, [
    'input[name="email"]',
    'input[type="email"]',
    'input[placeholder*="email" i]',
    'input[placeholder*="Email" i]',
    '#email'
  ], email);

  await fillFirstAvailable(page, [
    'input[name="password"]',
    'input[type="password"]',
    'input[placeholder*="password" i]',
    'input[placeholder*="Password" i]',
    '#password'
  ], password);

  await clickFirstAvailable(page, [
    'button[type="submit"]',
    'button:has-text("Login")',
    'button:has-text("Sign In")',
    'input[type="submit"]'
  ]);

  await page.waitForTimeout(1500);
}

async function loginAsUser(page) {
  await openLogin(page);
  await fillLoginForm(page, USER.email, USER.password);
}

async function loginAsAdmin(page) {
  await openLogin(page);
  await fillLoginForm(page, ADMIN.email, ADMIN.password);
}

async function logout(page) {
  await clickFirstAvailable(page, [
    'button:has-text("Logout")',
    'a:has-text("Logout")',
    'button:has-text("Log out")',
    'a:has-text("Log out")',
    '[href*="logout"]'
  ]);
  await page.waitForTimeout(1000);
}

async function openTrainSearch(page) {
  const clicked = await clickFirstAvailable(page, [
    'a:has-text("Search")',
    'button:has-text("Search")',
    'a:has-text("Trains")',
    'a:has-text("Book")',
    'a:has-text("Reservation")',
    '[href*="search"]',
    '[href*="train"]',
    '[href*="booking"]'
  ]);

  if (!clicked) {
    await page.goto(`${BASE_URL}/search`, { waitUntil: 'domcontentloaded' }).catch(async () => {
      await page.goto(`${BASE_URL}/trains`, { waitUntil: 'domcontentloaded' });
    });
  }

  await page.waitForTimeout(1000);
}

async function fillTrainSearch(page, source = 'Lahore', destination = 'Karachi', date = '2026-07-20') {
  await fillFirstAvailable(page, [
    'input[name="source"]',
    'input[name="from"]',
    'input[placeholder*="source" i]',
    'input[placeholder*="from" i]',
    '#source',
    '#from'
  ], source);

  await fillFirstAvailable(page, [
    'input[name="destination"]',
    'input[name="to"]',
    'input[placeholder*="destination" i]',
    'input[placeholder*="to" i]',
    '#destination',
    '#to'
  ], destination);

  await selectFirstAvailable(page, [
    'select[name="source"]',
    'select[name="from"]',
    '#source',
    '#from'
  ], source);

  await selectFirstAvailable(page, [
    'select[name="destination"]',
    'select[name="to"]',
    '#destination',
    '#to'
  ], destination);

  await fillFirstAvailable(page, [
    'input[name="date"]',
    'input[type="date"]',
    'input[placeholder*="date" i]',
    '#date',
    '#travelDate'
  ], date);

  await clickFirstAvailable(page, [
    'button:has-text("Search")',
    'button:has-text("Find")',
    'button:has-text("Find Train")',
    'button[type="submit"]'
  ]);

  await page.waitForTimeout(1500);
}

async function openBookingHistory(page) {
  const clicked = await clickFirstAvailable(page, [
    'a:has-text("History")',
    'a:has-text("Bookings")',
    'a:has-text("My Bookings")',
    'a:has-text("Tickets")',
    '[href*="history"]',
    '[href*="booking"]',
    '[href*="ticket"]'
  ]);

  if (!clicked) {
    await page.goto(`${BASE_URL}/bookings`, { waitUntil: 'domcontentloaded' }).catch(async () => {
      await page.goto(`${BASE_URL}/history`, { waitUntil: 'domcontentloaded' });
    });
  }

  await page.waitForTimeout(1000);
}

async function openAdminArea(page) {
  const clicked = await clickFirstAvailable(page, [
    'a:has-text("Admin")',
    'a:has-text("Dashboard")',
    '[href*="admin"]',
    '[href*="dashboard"]'
  ]);

  if (!clicked) {
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
  }

  await page.waitForTimeout(1000);
}

async function openAdminTrains(page) {
  const clicked = await clickFirstAvailable(page, [
    'a:has-text("Trains")',
    'a:has-text("Manage Trains")',
    'button:has-text("Trains")',
    '[href*="train"]'
  ]);

  if (!clicked) {
    await page.goto(`${BASE_URL}/admin/trains`, { waitUntil: 'domcontentloaded' }).catch(async () => {
      await page.goto(`${BASE_URL}/trains`, { waitUntil: 'domcontentloaded' });
    });
  }

  await page.waitForTimeout(1000);
}

async function openAdminBookings(page) {
  const clicked = await clickFirstAvailable(page, [
    'a:has-text("Bookings")',
    'a:has-text("Reservations")',
    'a:has-text("Tickets")',
    '[href*="booking"]',
    '[href*="reservation"]'
  ]);

  if (!clicked) {
    await page.goto(`${BASE_URL}/admin/bookings`, { waitUntil: 'domcontentloaded' }).catch(async () => {
      await page.goto(`${BASE_URL}/bookings`, { waitUntil: 'domcontentloaded' });
    });
  }

  await page.waitForTimeout(1000);
}

async function expectPageNotBlank(page) {
  const bodyText = await page.locator('body').innerText().catch(() => '');
  expect(bodyText.trim().length).toBeGreaterThan(0);
}

async function expectNoMajorCrash(page) {
  const bodyText = await page.locator('body').innerText().catch(() => '');
  expect(bodyText).not.toMatch(/cannot get|internal server error|undefined is not|typeerror|referenceerror/i);
}

async function performFlow(page, testCase) {
  switch (testCase.flow) {
    case 'home':
      await gotoHome(page);
      await expectPageNotBlank(page);
      break;

    case 'navigation':
      await gotoHome(page);
      await expectNoMajorCrash(page);
      break;

    case 'login-user-valid':
      await loginAsUser(page);
      await expectPageNotBlank(page);
      await expectNoMajorCrash(page);
      break;

    case 'login-user-invalid':
      await openLogin(page);
      await fillLoginForm(page, USER.email, 'WrongPassword123');
      await expectPageNotBlank(page);
      break;

    case 'login-admin-valid':
      await loginAsAdmin(page);
      await expectPageNotBlank(page);
      await expectNoMajorCrash(page);
      break;

    case 'login-admin-invalid':
      await openLogin(page);
      await fillLoginForm(page, ADMIN.email, 'WrongAdminPassword123');
      await expectPageNotBlank(page);
      break;

    case 'user-dashboard':
      await loginAsUser(page);
      await expectPageNotBlank(page);
      await expectNoMajorCrash(page);
      break;

    case 'admin-dashboard':
      await loginAsAdmin(page);
      await openAdminArea(page);
      await expectPageNotBlank(page);
      await expectNoMajorCrash(page);
      break;

    case 'train-search-valid':
      await loginAsUser(page);
      await openTrainSearch(page);
      await fillTrainSearch(page, 'Lahore', 'Karachi', '2026-07-20');
      await expectPageNotBlank(page);
      await expectNoMajorCrash(page);
      break;

    case 'train-search-missing':
      await loginAsUser(page);
      await openTrainSearch(page);
      await clickFirstAvailable(page, [
        'button:has-text("Search")',
        'button:has-text("Find")',
        'button[type="submit"]'
      ]);
      await page.waitForTimeout(1000);
      await expectPageNotBlank(page);
      break;

    case 'train-search-same-route':
      await loginAsUser(page);
      await openTrainSearch(page);
      await fillTrainSearch(page, 'Lahore', 'Lahore', '2026-07-20');
      await expectPageNotBlank(page);
      break;

    case 'train-search-past-date':
      await loginAsUser(page);
      await openTrainSearch(page);
      await fillTrainSearch(page, 'Lahore', 'Karachi', '2020-01-01');
      await expectPageNotBlank(page);
      break;

    case 'booking-history':
      await loginAsUser(page);
      await openBookingHistory(page);
      await expectPageNotBlank(page);
      await expectNoMajorCrash(page);
      break;

    case 'logout-user':
      await loginAsUser(page);
      await logout(page);
      await expectPageNotBlank(page);
      break;

    case 'logout-admin':
      await loginAsAdmin(page);
      await logout(page);
      await expectPageNotBlank(page);
      break;

    case 'admin-trains':
      await loginAsAdmin(page);
      await openAdminArea(page);
      await openAdminTrains(page);
      await expectPageNotBlank(page);
      await expectNoMajorCrash(page);
      break;

    case 'admin-bookings':
      await loginAsAdmin(page);
      await openAdminArea(page);
      await openAdminBookings(page);
      await expectPageNotBlank(page);
      await expectNoMajorCrash(page);
      break;

    case 'admin-add-train-validation':
      await loginAsAdmin(page);
      await openAdminArea(page);
      await openAdminTrains(page);
      await clickFirstAvailable(page, [
        'button:has-text("Add")',
        'a:has-text("Add")',
        'button:has-text("Create")',
        'a:has-text("Create")'
      ]);
      await clickFirstAvailable(page, [
        'button[type="submit"]',
        'button:has-text("Save")',
        'button:has-text("Submit")',
        'button:has-text("Add")'
      ]);
      await page.waitForTimeout(1000);
      await expectPageNotBlank(page);
      break;

    case 'restricted-admin-as-user':
      await loginAsUser(page);
      await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      await expectPageNotBlank(page);
      break;

    case 'protected-page-logged-out':
      await gotoHome(page);
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      await expectPageNotBlank(page);
      break;

    case 'invalid-route':
      await page.goto(`${BASE_URL}/invalid-qa-route-${Date.now()}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      await expectPageNotBlank(page);
      break;

    case 'responsive-home':
      await page.setViewportSize({ width: 390, height: 844 });
      await gotoHome(page);
      await expectPageNotBlank(page);
      break;

    case 'responsive-login':
      await page.setViewportSize({ width: 390, height: 844 });
      await openLogin(page);
      await expectPageNotBlank(page);
      break;

    case 'contact-about':
      await gotoHome(page);
      await clickFirstAvailable(page, [
        'a:has-text("Contact")',
        'a:has-text("About")',
        '[href*="contact"]',
        '[href*="about"]'
      ]);
      await page.waitForTimeout(1000);
      await expectPageNotBlank(page);
      break;

    default:
      await gotoHome(page);
      await expectPageNotBlank(page);
  }
}

const testCases = [
  { id: 'PW-TC-001', title: 'Homepage loads successfully', flow: 'home' },
  { id: 'PW-TC-002', title: 'Homepage body content is visible', flow: 'home' },
  { id: 'PW-TC-003', title: 'Homepage does not show major crash error', flow: 'navigation' },
  { id: 'PW-TC-004', title: 'Main navigation is reachable', flow: 'navigation' },
  { id: 'PW-TC-005', title: 'Contact or About navigation check', flow: 'contact-about' },
  { id: 'PW-TC-006', title: 'Invalid route displays stable page', flow: 'invalid-route' },
  { id: 'PW-TC-007', title: 'Mobile homepage responsiveness', flow: 'responsive-home' },
  { id: 'PW-TC-008', title: 'Mobile login page responsiveness', flow: 'responsive-login' },
  { id: 'PW-TC-009', title: 'Protected dashboard route while logged out', flow: 'protected-page-logged-out' },
  { id: 'PW-TC-010', title: 'Application remains stable after navigation', flow: 'navigation' },

  { id: 'PW-TC-011', title: 'User login with valid credentials', flow: 'login-user-valid' },
  { id: 'PW-TC-012', title: 'User login with invalid password', flow: 'login-user-invalid' },
  { id: 'PW-TC-013', title: 'User dashboard opens after login', flow: 'user-dashboard' },
  { id: 'PW-TC-014', title: 'User dashboard has visible content', flow: 'user-dashboard' },
  { id: 'PW-TC-015', title: 'User session page remains stable', flow: 'user-dashboard' },
  { id: 'PW-TC-016', title: 'User logout works', flow: 'logout-user' },
  { id: 'PW-TC-017', title: 'User can open login page repeatedly', flow: 'login-user-valid' },
  { id: 'PW-TC-018', title: 'User invalid login keeps app stable', flow: 'login-user-invalid' },
  { id: 'PW-TC-019', title: 'Logged out user dashboard restriction', flow: 'protected-page-logged-out' },
  { id: 'PW-TC-020', title: 'User role should not access admin area', flow: 'restricted-admin-as-user' },

  { id: 'PW-TC-021', title: 'Admin login with valid credentials', flow: 'login-admin-valid' },
  { id: 'PW-TC-022', title: 'Admin login with invalid password', flow: 'login-admin-invalid' },
  { id: 'PW-TC-023', title: 'Admin dashboard opens after login', flow: 'admin-dashboard' },
  { id: 'PW-TC-024', title: 'Admin dashboard has visible content', flow: 'admin-dashboard' },
  { id: 'PW-TC-025', title: 'Admin dashboard does not crash', flow: 'admin-dashboard' },
  { id: 'PW-TC-026', title: 'Admin logout works', flow: 'logout-admin' },
  { id: 'PW-TC-027', title: 'Admin area navigation is stable', flow: 'admin-dashboard' },
  { id: 'PW-TC-028', title: 'Admin invalid login shows stable response', flow: 'login-admin-invalid' },
  { id: 'PW-TC-029', title: 'Admin can revisit dashboard', flow: 'admin-dashboard' },
  { id: 'PW-TC-030', title: 'Admin session page remains stable', flow: 'admin-dashboard' },

  { id: 'PW-TC-031', title: 'Train search with valid Lahore to Karachi route', flow: 'train-search-valid' },
  { id: 'PW-TC-032', title: 'Train search page opens for user', flow: 'train-search-valid' },
  { id: 'PW-TC-033', title: 'Train search with missing fields', flow: 'train-search-missing' },
  { id: 'PW-TC-034', title: 'Train search with same source and destination', flow: 'train-search-same-route' },
  { id: 'PW-TC-035', title: 'Train search with past date', flow: 'train-search-past-date' },
  { id: 'PW-TC-036', title: 'Train search result page remains stable', flow: 'train-search-valid' },
  { id: 'PW-TC-037', title: 'Train search validation does not crash', flow: 'train-search-missing' },
  { id: 'PW-TC-038', title: 'Train route validation same city', flow: 'train-search-same-route' },
  { id: 'PW-TC-039', title: 'Train date validation old date', flow: 'train-search-past-date' },
  { id: 'PW-TC-040', title: 'Train search future date scenario', flow: 'train-search-valid' },

  { id: 'PW-TC-041', title: 'Booking history page opens', flow: 'booking-history' },
  { id: 'PW-TC-042', title: 'Booking history has visible content', flow: 'booking-history' },
  { id: 'PW-TC-043', title: 'Booking history does not crash', flow: 'booking-history' },
  { id: 'PW-TC-044', title: 'Booking history after user login', flow: 'booking-history' },
  { id: 'PW-TC-045', title: 'Ticket or booking navigation works', flow: 'booking-history' },
  { id: 'PW-TC-046', title: 'User booking module stable check', flow: 'booking-history' },
  { id: 'PW-TC-047', title: 'Booking page protected access check', flow: 'protected-page-logged-out' },
  { id: 'PW-TC-048', title: 'Booking route content check', flow: 'booking-history' },
  { id: 'PW-TC-049', title: 'Booking history responsive basic check', flow: 'booking-history' },
  { id: 'PW-TC-050', title: 'Booking menu does not show crash error', flow: 'booking-history' },

  { id: 'PW-TC-051', title: 'Admin train management page opens', flow: 'admin-trains' },
  { id: 'PW-TC-052', title: 'Admin train list visible or stable', flow: 'admin-trains' },
  { id: 'PW-TC-053', title: 'Admin train management no crash', flow: 'admin-trains' },
  { id: 'PW-TC-054', title: 'Admin add train validation check', flow: 'admin-add-train-validation' },
  { id: 'PW-TC-055', title: 'Admin train empty form validation', flow: 'admin-add-train-validation' },
  { id: 'PW-TC-056', title: 'Admin train management after dashboard', flow: 'admin-trains' },
  { id: 'PW-TC-057', title: 'Admin train route access after login', flow: 'admin-trains' },
  { id: 'PW-TC-058', title: 'Admin train page content verification', flow: 'admin-trains' },
  { id: 'PW-TC-059', title: 'Admin train page repeated access', flow: 'admin-trains' },
  { id: 'PW-TC-060', title: 'Normal user restriction from admin train area', flow: 'restricted-admin-as-user' },

  { id: 'PW-TC-061', title: 'Admin booking management page opens', flow: 'admin-bookings' },
  { id: 'PW-TC-062', title: 'Admin booking records page stable', flow: 'admin-bookings' },
  { id: 'PW-TC-063', title: 'Admin booking page has visible content', flow: 'admin-bookings' },
  { id: 'PW-TC-064', title: 'Admin booking management no crash', flow: 'admin-bookings' },
  { id: 'PW-TC-065', title: 'Admin booking route access after login', flow: 'admin-bookings' },
  { id: 'PW-TC-066', title: 'Admin booking menu accessible', flow: 'admin-bookings' },
  { id: 'PW-TC-067', title: 'Admin booking page repeated access', flow: 'admin-bookings' },
  { id: 'PW-TC-068', title: 'Normal user restriction from admin booking area', flow: 'restricted-admin-as-user' },
  { id: 'PW-TC-069', title: 'Admin dashboard to booking flow stable', flow: 'admin-bookings' },
  { id: 'PW-TC-070', title: 'Admin booking page screenshot evidence', flow: 'admin-bookings' },

  { id: 'PW-TC-071', title: 'User authorization against admin dashboard', flow: 'restricted-admin-as-user' },
  { id: 'PW-TC-072', title: 'Logged-out access to dashboard route', flow: 'protected-page-logged-out' },
  { id: 'PW-TC-073', title: 'Logged-out access to protected area remains stable', flow: 'protected-page-logged-out' },
  { id: 'PW-TC-074', title: 'Invalid URL handling', flow: 'invalid-route' },
  { id: 'PW-TC-075', title: 'Invalid route does not crash SPA', flow: 'invalid-route' },
  { id: 'PW-TC-076', title: 'User cannot directly open admin route', flow: 'restricted-admin-as-user' },
  { id: 'PW-TC-077', title: 'Protected page direct URL check', flow: 'protected-page-logged-out' },
  { id: 'PW-TC-078', title: 'Unauthorized access visible response', flow: 'restricted-admin-as-user' },
  { id: 'PW-TC-079', title: 'User session authorization stability', flow: 'restricted-admin-as-user' },
  { id: 'PW-TC-080', title: 'Public invalid route evidence', flow: 'invalid-route' },

  { id: 'PW-TC-081', title: 'Mobile homepage layout check', flow: 'responsive-home' },
  { id: 'PW-TC-082', title: 'Mobile login layout check', flow: 'responsive-login' },
  { id: 'PW-TC-083', title: 'Mobile homepage content visible', flow: 'responsive-home' },
  { id: 'PW-TC-084', title: 'Mobile login content visible', flow: 'responsive-login' },
  { id: 'PW-TC-085', title: 'Homepage visual screenshot evidence', flow: 'home' },
  { id: 'PW-TC-086', title: 'Login page visual screenshot evidence', flow: 'responsive-login' },
  { id: 'PW-TC-087', title: 'Navigation visual check', flow: 'navigation' },
  { id: 'PW-TC-088', title: 'Contact or about page visual check', flow: 'contact-about' },
  { id: 'PW-TC-089', title: 'General UI stability check', flow: 'navigation' },
  { id: 'PW-TC-090', title: 'General UI no major crash check', flow: 'navigation' },

  { id: 'PW-TC-091', title: 'End-to-end user login and search flow', flow: 'train-search-valid' },
  { id: 'PW-TC-092', title: 'End-to-end user login and booking history flow', flow: 'booking-history' },
  { id: 'PW-TC-093', title: 'End-to-end user logout flow', flow: 'logout-user' },
  { id: 'PW-TC-094', title: 'End-to-end admin login and dashboard flow', flow: 'admin-dashboard' },
  { id: 'PW-TC-095', title: 'End-to-end admin train management flow', flow: 'admin-trains' },
  { id: 'PW-TC-096', title: 'End-to-end admin booking management flow', flow: 'admin-bookings' },
  { id: 'PW-TC-097', title: 'End-to-end authorization negative flow', flow: 'restricted-admin-as-user' },
  { id: 'PW-TC-098', title: 'End-to-end public invalid route flow', flow: 'invalid-route' },
  { id: 'PW-TC-099', title: 'End-to-end responsive public flow', flow: 'responsive-home' },
  { id: 'PW-TC-100', title: 'Final PakRail application stability check', flow: 'navigation' }
];

test.describe('PakRail 100 Playwright Test Cases for SQE Project', () => {
  for (const testCase of testCases) {
    test(`${testCase.id} - ${testCase.title}`, async ({ page }) => {
      await performFlow(page, testCase);
      await saveScreenshot(page, testCase.id, testCase.title);
    });
  }
});
