const express = require('express');
const app = express();

app.use(express.json());

// State for test data and next ID counter
let testData = [];
let nextId = 1; // Explicit counter for the next ID

// Reset endpoint
app.post('/reset', (req, res) => {
    testData = [
        { id: 1, name: 'data1' },
        { id: 2, name: 'data2' },
        { id: 3, name: 'data3' }
    ];
    nextId = 4; // Reset the counter to the next ID after the reset state
    res.send(testData);
});

// Fetch all IDs
app.get('/api/testData', (req, res) => {
    const ids = testData.map((item) => item.id);
    res.send(ids);
});

// Fetch a single item by ID
app.get('/api/testData/:id', (req, res) => {
    const test = testData.find((c) => c.id === parseInt(req.params.id));
    if (!test) return res.status(404).send('The test with the given ID was not found');
    res.send(test);
});

// Add a new item
app.post('/api/testData', (req, res) => {
    if (!req.body.name || req.body.name.length < 3) {
        res.status(400).send('Name is required and should be minimum 3 characters long');
        return;
    }

    const test = {
        id: nextId, // Use the explicit counter for the ID
        name: req.body.name
    };
    testData.push(test);
    nextId++; // Increment the counter for the next item
    res.send(test);
});

const port = 2999;
app.listen(port, () => console.log(`Listening on http://localhost:${port}...`));
