
CREATE TABLE Invoices (
    InvoiceID INTEGER PRIMARY KEY,
    CustomerName TEXT
);

CREATE TABLE InvoiceItems (
    ItemID INTEGER PRIMARY KEY AUTOINCREMENT,
    InvoiceID INTEGER,
    Name TEXT,
    Price REAL,
    FOREIGN KEY (InvoiceID) REFERENCES Invoices(InvoiceID)
);

INSERT INTO Invoices (InvoiceID, CustomerName) VALUES (1, 'John Doe');
INSERT INTO InvoiceItems (ItemID, InvoiceID, Name, Price) VALUES (1, 1, 'Widget A', 19.99);
