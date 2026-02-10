const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database file
// Vercel is read-only, so use in-memory DB if deployed there
const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
const dbPath = isVercel ? ':memory:' : path.resolve(__dirname, 'invoice.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log(`Connected to the SQLite database (${isVercel ? 'In-Memory' : 'File'}).`);
        initDatabase();
    }
});

function initDatabase() {
    db.serialize(() => {
        // Create Invoices Table
        db.run(`CREATE TABLE IF NOT EXISTS Invoices (
            InvoiceID INTEGER PRIMARY KEY,
            CustomerName TEXT
        )`);

        // Create InvoiceItems Table
        db.run(`CREATE TABLE IF NOT EXISTS InvoiceItems (
            ItemID INTEGER PRIMARY KEY AUTOINCREMENT,
            InvoiceID INTEGER,
            Name TEXT,
            Price REAL,
            FOREIGN KEY (InvoiceID) REFERENCES Invoices(InvoiceID)
        )`);

        // Seed Data if empty
        db.get("SELECT count(*) as count FROM Invoices", (err, row) => {
            if (err) {
                return console.error(err.message);
            }
            if (row.count === 0) {
                console.log("Seeding initial data...");
                const stmtInvoice = db.prepare("INSERT INTO Invoices (InvoiceID, CustomerName) VALUES (?, ?)");
                stmtInvoice.run(1, 'John Doe');
                stmtInvoice.finalize();

                const stmtItems = db.prepare("INSERT INTO InvoiceItems (InvoiceID, Name, Price) VALUES (?, ?, ?)");
                stmtItems.run(1, 'Widget A', 19.99);
                stmtItems.run(1, 'Service B', 45.00);
                stmtItems.run(1, 'Gadget C', 12.50);
                stmtItems.finalize();
            }
        });
    });
}

module.exports = db;
