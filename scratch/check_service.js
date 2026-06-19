const { exec } = require('child_process');
exec('powershell -Command "Get-CimInstance Win32_Service -Filter \\"Name = \'MongoDB\'\\" | Format-List PathName"', (err, stdout, stderr) => {
    if (err) {
        console.error("Error:", err);
    }
    console.log("Full PathName:");
    console.log(stdout);
});
