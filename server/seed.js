const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Train = require('./models/Train');
const Seat = require('./models/Seat');
const Booking = require('./models/Booking');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

const importData = async () => {
    try {
        // Clear existing data
        await User.deleteMany();
        await Train.deleteMany();
        await Seat.deleteMany();
        await Booking.deleteMany();

        const salt = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash('admin123', salt);
        const passengerPassword = await bcrypt.hash('test123', salt);

        const users = [
            {
                name: 'Admin User',
                email: 'admin@pakrail.com',
                password: adminPassword,
                phone: '03001234567',
                role: 'admin'
            },
            {
                name: 'Test Passenger',
                email: 'passenger@pakrail.com',
                password: passengerPassword,
                phone: '03007654321',
                role: 'passenger'
            }
        ];

        await User.insertMany(users);
        console.log('Users created');

        const trainRoutes = [
            { trainNumber: '101', trainName: 'Tezgam Express', from: 'Lahore', to: 'Karachi', departureTime: '18:00', arrivalTime: '10:00', duration: '16h', fare: 2500, class: 'Economy' },
            { trainNumber: '102', trainName: 'Green Line', from: 'Islamabad', to: 'Lahore', departureTime: '08:00', arrivalTime: '12:30', duration: '4h 30m', fare: 3500, class: 'Business' },
            { trainNumber: '103', trainName: 'Jinnah Express', from: 'Karachi', to: 'Peshawar', departureTime: '15:00', arrivalTime: '20:00', duration: '29h', fare: 4500, class: 'Economy' },
            { trainNumber: '104', trainName: 'Awam Express', from: 'Multan', to: 'Rawalpindi', departureTime: '10:00', arrivalTime: '19:00', duration: '9h', fare: 1200, class: 'Economy' },
            { trainNumber: '105', trainName: 'Chenab Express', from: 'Faisalabad', to: 'Quetta', departureTime: '20:00', arrivalTime: '16:00', duration: '20h', fare: 3500, class: 'Business' },
            { trainNumber: '106', trainName: 'Karakoram Express', from: 'Karachi', to: 'Lahore', departureTime: '16:00', arrivalTime: '09:00', duration: '17h', fare: 6500, class: 'First Class' },
            { trainNumber: '107', trainName: 'Shalimar Express', from: 'Lahore', to: 'Karachi', departureTime: '06:00', arrivalTime: '23:00', duration: '17h', fare: 2000, class: 'Economy' },
            { trainNumber: '108', trainName: 'Bahauddin Zakaria', from: 'Multan', to: 'Karachi', departureTime: '17:00', arrivalTime: '08:00', duration: '15h', fare: 1800, class: 'Economy' },
            { trainNumber: '109', trainName: 'Rawal Express', from: 'Rawalpindi', to: 'Lahore', departureTime: '00:30', arrivalTime: '04:45', duration: '4h 15m', fare: 1500, class: 'Business' },
            { trainNumber: '110', trainName: 'Allama Iqbal Exp', from: 'Sialkot', to: 'Karachi', departureTime: '08:00', arrivalTime: '12:00', duration: '28h', fare: 3000, class: 'Economy' }
        ];

        const dateTomorrow = new Date();
        dateTomorrow.setDate(dateTomorrow.getDate() + 1);
        dateTomorrow.setHours(0, 0, 0, 0);

        const trains = trainRoutes.map(route => ({
            ...route,
            date: dateTomorrow,
            totalSeats: 70,
            availableSeats: 70,
            status: 'Active'
        }));

        const createdTrains = await Train.insertMany(trains);
        console.log('Trains created');

        const seatsToInsert = [];
        // Requirements: 40 Economy, 20 Business, 10 First Class for each train.
        // We'll map them sequentially to the 70 seats.
        // A, B, C, D (4 rows * 10 = 40) -> Economy
        // E, F (2 rows * 10 = 20) -> Business
        // G (1 row * 10 = 10) -> First Class
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

        for (let train of createdTrains) {
            for (let i = 0; i < train.totalSeats; i++) {
                let row = rows[Math.floor(i / 10)];
                let num = (i % 10) + 1;
                let seatClass = 'Economy';
                if (row === 'E' || row === 'F') seatClass = 'Business';
                if (row === 'G') seatClass = 'First Class';

                seatsToInsert.push({
                    trainId: train._id,
                    seatNumber: `${row}${num}`,
                    class: seatClass,
                    isBooked: false
                });
            }
        }

        await Seat.insertMany(seatsToInsert);
        console.log('Seats created');

        console.log('✅ Database seeded successfully!');
        process.exit();

    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

connectDB().then(() => {
    importData();
});
