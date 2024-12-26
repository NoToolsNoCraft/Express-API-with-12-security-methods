const express = require('express');
const app = express();

app.use(express.json());

const testData = [
    { id: 1, name: 'data1' },
    { id: 2, name: 'data2' },
    { id: 3, name: 'data3' }
];

app.get('/', (req, res) => {
    res.send('This is the initial response');
});

app.get('/api/testData', (req, res) => {
    const ids = testData.map((item) => item.id);
    res.send(ids);
});

app.get('/api/testData/:id', (req, res) => {
    const test = testData.find((c) => c.id === parseInt(req.params.id));
    if (!test) return res.status(404).send('The test with the given ID was not found');
    res.send(test);
});

app.post('/api/testData', (req, res) => {
    if (!req.body.name || req.body.name.length < 3) {
        res.status(400).send('Name is required and should be minimum 3 characters long');
        return;
    }

    // Always calculate the next ID based on the highest existing ID
    const maxId = testData.reduce((max, item) => (item.id > max ? item.id : max), 0);
    const test = {
        id: maxId + 1,
        name: req.body.name
    };
    testData.push(test);
    res.send(test);
});

app.post('/reset', (req, res) => {
    // Reset the array to the initial state
    testData.length = 0; 
    testData.push(
        { id: 1, name: 'data1' },
        { id: 2, name: 'data2' },
        { id: 3, name: 'data3' }
    );
    res.send(testData);
});

const port = 2999;
app.listen(port, () => console.log(`Listening on http://localhost:${port}...`));
