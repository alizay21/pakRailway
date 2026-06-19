const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const screenshotsDir = path.join(__dirname, '..', '..', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function run() {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: true,
        defaultViewport: { width: 1280, height: 800 }
    });

    const page = await browser.newPage();
    
    // 1. Home Page
    console.log("Navigating to Home...");
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(screenshotsDir, '01_home.png') });
    console.log("Captured 01_home.png");

    // 15. Urdu language switch (on Home Page)
    console.log("Switching to Urdu...");
    const buttons = await page.$$('button');
    let urduBtn;
    for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('اردو')) {
            urduBtn = btn;
            break;
        }
    }
    if (urduBtn) {
        await page.evaluate(el => el.click(), urduBtn);
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: path.join(screenshotsDir, '15_urdu_home.png') });
        console.log("Captured 15_urdu_home.png");
        
        // Click back to English
        const enButtons = await page.$$('button');
        for (const btn of enButtons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text.includes('EN')) {
                await page.evaluate(el => el.click(), btn);
                break;
            }
        }
        await new Promise(r => setTimeout(r, 1000));
    }

    // 2. Login Page
    console.log("Navigating to Login...");
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(screenshotsDir, '02_login_page.png') });
    console.log("Captured 02_login_page.png");

    // Login as Passenger
    console.log("Logging in as passenger...");
    await page.type('input[name="email"]', 'passenger@pakrail.com');
    await page.type('input[name="password"]', 'test123');
    await page.evaluate(() => {
        const btn = document.querySelector('button[type="submit"]');
        if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: path.join(screenshotsDir, '03_passenger_dashboard.png') });
    console.log("Captured 03_passenger_dashboard.png");

    // 4 & 5. Train Search and Results
    console.log("Fetching active trains from API...");
    const trainsResponse = await page.evaluate(async () => {
        const res = await fetch('/api/trains/search');
        return res.json();
    });
    
    if (!trainsResponse.trains || trainsResponse.trains.length === 0) {
        throw new Error("No active trains found in the database. Please make sure the database is seeded.");
    }
    
    const train = trainsResponse.trains[0];
    const dateStr = new Date(train.date).toISOString().split('T')[0];
    console.log(`Found active train: ${train.trainName} (${train.trainNumber}) from ${train.from} to ${train.to} on ${dateStr}`);
    
    console.log(`Navigating to search page: http://localhost:5173/search?from=${train.from}&to=${train.to}&date=${dateStr}`);
    await page.goto(`http://localhost:5173/search?from=${train.from}&to=${train.to}&date=${dateStr}`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(screenshotsDir, '04_train_search.png') });
    await page.screenshot({ path: path.join(screenshotsDir, '05_search_results.png') });
    console.log("Captured 04_train_search.png & 05_search_results.png");

    // 6. Seat Selection
    console.log(`Navigating to seat selection for train ID: ${train._id}`);
    await page.goto(`http://localhost:5173/select-seats/${train._id}`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2500));
    await page.screenshot({ path: path.join(screenshotsDir, '06_seat_selection.png') });
    console.log("Captured 06_seat_selection.png");

    // Click an available seat (like A1 or A2)
    console.log("Selecting seat A1...");
    const seatElements = await page.$$('button');
    let seatClicked = false;
    for (const el of seatElements) {
        const text = await page.evaluate(el => el.textContent, el);
        if (/^[A-G][1-9]$|^[A-G]10$/.test(text.trim())) {
            const isBooked = await page.evaluate(el => el.className.includes('bg-red') || el.className.includes('booked') || el.disabled, el);
            if (!isBooked) {
                await page.evaluate(el => el.click(), el);
                seatClicked = true;
                console.log(`Selected seat: ${text.trim()}`);
                break;
            }
        }
    }
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(screenshotsDir, '06_seat_selection_clicked.png') }); // debug screenshot

    // Click proceed to passenger details
    const proceedButtons = await page.$$('button, a');
    let proceedBtn;
    for (const btn of proceedButtons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.toLowerCase().includes('proceed') || text.toLowerCase().includes('continue') || text.toLowerCase().includes('details')) {
            proceedBtn = btn;
            break;
        }
    }
    if (proceedBtn) {
        console.log("Proceeding to details...");
        await page.evaluate(el => el.click(), proceedBtn);
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: path.join(screenshotsDir, '07_booking_details.png') });
        console.log("Captured 07_booking_details.png");

        // Fill passenger details (valid 13 digit CNIC)
        console.log("Entering passenger details...");
        const textInputs = await page.$$('input[type="text"]');
        if (textInputs.length >= 2) {
            await textInputs[0].type('Test Passenger');
            // CNIC (Exactly 13 digits)
            await textInputs[1].type('3520112345678');
        }
        const numInputs = await page.$$('input[type="number"]');
        if (numInputs.length > 0) {
            await numInputs[0].type('30');
        }

        // Click proceed to payment
        const toPaymentButtons = await page.$$('button, a');
        let toPaymentBtn;
        for (const btn of toPaymentButtons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text.toLowerCase().includes('payment') || text.toLowerCase().includes('proceed') || text.toLowerCase().includes('continue')) {
                toPaymentBtn = btn;
                break;
            }
        }
        if (toPaymentBtn) {
            console.log("Proceeding to payment...");
            await page.evaluate(el => el.click(), toPaymentBtn);
            await new Promise(r => setTimeout(r, 2000));
            await page.screenshot({ path: path.join(screenshotsDir, '08_payment_simulation.png') });
            console.log("Captured 08_payment_simulation.png");

            // Select simulated cash payment method
            console.log("Selecting Cash/Counter payment method...");
            const payBtns = await page.$$('button');
            for (const btn of payBtns) {
                const text = await page.evaluate(el => el.textContent, btn);
                if (text.toLowerCase().includes('cash') || text.toLowerCase().includes('counter')) {
                    await page.evaluate(el => el.click(), btn);
                    break;
                }
            }
            await new Promise(r => setTimeout(r, 1000));

            // Click confirm/book button
            const confirmBtns = await page.$$('button');
            let confirmBtn;
            for (const btn of confirmBtns) {
                const text = await page.evaluate(el => el.textContent, btn);
                if (text.toLowerCase().includes('book') || text.toLowerCase().includes('confirm') || text.toLowerCase().includes('pay')) {
                    confirmBtn = btn;
                    break;
                }
            }
            if (confirmBtn) {
                console.log("Completing booking...");
                await page.evaluate(el => el.click(), confirmBtn);
                await new Promise(r => setTimeout(r, 3500));
                await page.screenshot({ path: path.join(screenshotsDir, '09_booking_confirmation.png') });
                console.log("Captured 09_booking_confirmation.png");
            }
        }
    }

    // 10. My Bookings Page
    console.log("Navigating to My Bookings...");
    await page.goto('http://localhost:5173/my-bookings', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(screenshotsDir, '10_my_bookings.png') });
    console.log("Captured 10_my_bookings.png");

    // LOGOUT & ADMIN LOGIN
    console.log("Logging in as Admin...");
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await page.type('input[name="email"]', 'admin@pakrail.com');
    await page.type('input[name="password"]', 'admin123');
    await page.evaluate(() => {
        const btn = document.querySelector('button[type="submit"]');
        if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 3000));

    // 11. Admin Dashboard
    console.log("Navigating to Admin Dashboard...");
    await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(screenshotsDir, '11_admin_dashboard.png') });
    console.log("Captured 11_admin_dashboard.png");

    // 12. Admin Train Management
    console.log("Navigating to Admin Trains...");
    await page.goto('http://localhost:5173/admin/trains', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(screenshotsDir, '12_admin_train_management.png') });
    console.log("Captured 12_admin_train_management.png");

    // 13. Admin Booking Management
    console.log("Navigating to Admin Bookings...");
    await page.goto('http://localhost:5173/admin/bookings', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(screenshotsDir, '13_admin_booking_management.png') });
    console.log("Captured 13_admin_booking_management.png");

    // 14. Admin Reports
    console.log("Navigating to Admin Reports...");
    await page.goto('http://localhost:5173/admin/reports', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: path.join(screenshotsDir, '14_admin_reports.png') });
    console.log("Captured 14_admin_reports.png");

    console.log("All screenshots captured successfully!");
    await browser.close();
}

run().catch(e => {
    console.error("Error running script:", e);
    process.exit(1);
});
