const API_URL = 'http://localhost:5000/api';
let passengerToken = '';
let adminToken = '';
let trainId = '';
let bookingId = '';
let pnrNumber = '';

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  const data = await res.json();
  if (!res.ok) {
    throw { response: { data } };
  }
  return data;
}

async function runTests() {
  try {
    console.log('--- STARTING QA TESTS ---');
    
    // 1. Register Passenger
    console.log('1. Registering Passenger...');
    try {
        const data = await fetchJSON(`${API_URL}/auth/register`, {
            method: 'POST',
            body: JSON.stringify({
                name: 'QA Passenger',
                email: `qa_${Date.now()}@test.com`,
                password: 'password123',
                confirmPassword: 'password123',
                phone: '03001234567',
                role: 'passenger'
            })
        });
        passengerToken = data.token;
        console.log('✅ Passenger registered successfully.');
    } catch (err) {
        console.error('❌ Passenger registration failed:', err.response?.data || err.message);
        throw err;
    }

    // 2. Login Admin (use seeded admin)
    console.log('2. Logging in Admin...');
    try {
        const data = await fetchJSON(`${API_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
                email: 'admin@pakrail.com',
                password: 'admin123'
            })
        });
        adminToken = data.token;
        console.log('✅ Admin logged in successfully.');
    } catch (err) {
        console.error('❌ Admin login failed:', err.response?.data || err.message);
        throw err;
    }

    // 3. Admin Adds Train
    console.log('3. Admin adding a new train...');
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const data = await fetchJSON(`${API_URL}/admin/trains`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${adminToken}` },
            body: JSON.stringify({
                trainNumber: `QA-${Date.now()}`,
                trainName: 'QA Express',
                from: 'Lahore',
                to: 'Karachi',
                departureTime: '10:00',
                arrivalTime: '20:00',
                duration: '10h',
                date: tomorrow.toISOString(),
                totalSeats: 150, // Test >100 seats
                fare: 1500,
                class: 'Economy'
            })
        });
        trainId = data.train._id;
        console.log('✅ Train added successfully. Train ID:', trainId);
    } catch (err) {
        console.error('❌ Admin train addition failed:', err.response?.data || err.message);
        throw err;
    }

    // 4. Passenger Searches Trains
    console.log('4. Passenger searching trains...');
    try {
        const data = await fetchJSON(`${API_URL}/trains/search?from=Lahore&to=Karachi`);
        const found = data.trains.some(t => t._id === trainId);
        if (found) {
            console.log('✅ Train found in search results.');
        } else {
            throw new Error('Added train not found in search results.');
        }
    } catch (err) {
        console.error('❌ Train search failed:', err.response?.data || err.message);
        throw err;
    }

    // 5. Passenger Books Train
    console.log('5. Passenger booking train...');
    try {
        const data = await fetchJSON(`${API_URL}/bookings`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${passengerToken}` },
            body: JSON.stringify({
                trainId: trainId,
                seatNumbers: ['A1', 'A2'],
                passengerDetails: [
                    { name: 'John QA', age: 30, gender: 'Male', cnic: '1234512345123' },
                    { name: 'Jane QA', age: 28, gender: 'Female', cnic: '1234512345124' }
                ]
            })
        });
        bookingId = data.data._id;
        pnrNumber = data.data.pnrNumber;
        console.log('✅ Booking successful. Booking ID:', bookingId, 'PNR:', pnrNumber);
    } catch (err) {
        console.error('❌ Booking failed:', err.response?.data || err.message);
        throw err;
    }

    // 6. Passenger Cancels Booking
    console.log('6. Passenger cancelling booking...');
    try {
        await fetchJSON(`${API_URL}/bookings/${bookingId}/cancel`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${passengerToken}` }
        });
        console.log('✅ Booking cancelled successfully.');
    } catch (err) {
        console.error('❌ Booking cancellation failed:', err.response?.data || err.message);
        throw err;
    }

    // 7. Admin Deletes Train
    console.log('7. Admin deleting train...');
    try {
        await fetchJSON(`${API_URL}/admin/trains/${trainId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Train deleted successfully.');
    } catch (err) {
        console.error('❌ Train deletion failed:', err.response?.data || err.message);
        throw err;
    }

    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('🛑 TESTS FAILED!');
    process.exit(1);
  }
}

runTests();
