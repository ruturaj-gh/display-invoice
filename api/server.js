const express = require('express');
const path = require('path');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const db = require('./database');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // Enable JSON body parsing
app.use(express.static(path.join(__dirname, '../ui')));

/**
 * @swagger
 * /api/invoice:
 *   get:
 *     description: Get the invoice details and items
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 */
app.get('/api/invoice', (req, res) => {
    db.all("SELECT Name as name, Price as price FROM InvoiceItems", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ items: rows });
    });
});

/**
 * @swagger
 * /api/invoice/items:
 *   post:
 *     description: Add a new item to the invoice
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: item
 *         description: The item to add
 *         schema:
 *           type: object
 *           required:
 *             - name
 *             - price
 *           properties:
 *             name:
 *               type: string
 *             price:
 *               type: number
 *     responses:
 *       200:
 *         description: Item added successfully
 *       400:
 *         description: Invalid input
 */
app.post('/api/invoice/items', (req, res) => {
    const { name, price } = req.body;
    if (!name || !price) {
        return res.status(400).json({ error: "Name and Price are required" });
    }

    const stmt = db.prepare("INSERT INTO InvoiceItems (InvoiceID, Name, Price) VALUES (?, ?, ?)");
    stmt.run(1, name, price, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Item added", id: this.lastID, name, price });
    });
    stmt.finalize();
});

// Swagger Setup
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "Invoice API",
            version: "1.0.0",
            description: "API for managing invoices"
        },
        basePath: "/"
    },
    apis: ["server.js"]
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Fallback to index.html for non-API routes
app.get(/(.*)/, (req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/api-docs')) {
        return res.status(404).json({ error: "Not Found" });
    }
    res.sendFile(path.join(__dirname, '../ui', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Swagger Docs available at http://localhost:${port}/api-docs`);
});
