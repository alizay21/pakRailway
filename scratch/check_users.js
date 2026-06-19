const mongoose = require('mongoose');

async function main() {
    const url = 'mongodb://127.0.0.1:27017/pakrail';
    try {
        await mongoose.connect(url);
        console.log("Connected successfully to server via Mongoose");
        
        const connection = mongoose.connection;
        
        // Check connection status
        const status = await connection.db.admin().command({ connectionStatus: 1 });
        console.log("Connection Status:", JSON.stringify(status, null, 2));

        // Try listing users
        try {
            const usersInfo = await connection.db.admin().command({ usersInfo: 1 });
            console.log("Users Info:", JSON.stringify(usersInfo, null, 2));
        } catch (e) {
            console.error("Failed to get users info:", e.message);
        }

        // Try listing databases
        try {
            const listDbs = await connection.db.admin().listDatabases();
            console.log("Databases:", JSON.stringify(listDbs, null, 2));
        } catch (e) {
            console.error("Failed to list databases:", e.message);
        }
        
    } catch (err) {
        console.error("Connection error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

main();
