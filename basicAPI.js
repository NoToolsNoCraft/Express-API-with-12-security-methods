const express = require('express');
const app = express();

app.use(express.json());

const testData = [
    {
        id: 1,
        name: 'data1'
    },
    {
        id: 2,
        name: 'data2'
    },
    {
        id: 3,
        name: 'data3'
    }
];

app.get('/', (req, res) => {
    res.send('This is the initial response');
});

app.get('/api/testData', (req, res) => {
    res.send(testData);
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

    const test = {
        id: testData.length + 1,
        name: req.body.name
    };
    testData.push(test);
    res.send(test);
});

app.post('/reset', (req, res) => {
    testData.splice(0, testData.length,
        { id: 1, name: 'data1' },
        { id: 2, name: 'data2' },
        { id: 3, name: 'data3' }
    );
    res.send(testData);
});

const port = 2999;
app.listen(port, () => console.log(`Listening on http://localhost:${port}...`));
