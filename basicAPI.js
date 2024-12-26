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
    res.send([1, 2, 3]);
});


// The following feature allows us to add a new item to the array. We can make a POST request
// with the body updated with a raw json containing something like this:
// {
//      name: 'newData'
// }
// It will update the array with an item with id: 4 and name: 'newData'
app.post('/api/testData', (req, res) => {
if(!req.body.name || req.body.name.lenght > 3) {
    //If no object name has beed added in the body, or it is shorter than 3 characters then
    //throw error 400 Bad Request
    res.status(400).send('Name is required and should be minimum 3 characters long')
    return;
}

    const test = {
        id: testData.length + 1,
        name: req.body.name
    };
    testData.push(test);
    res.send(test)
});



app.get('/api/testData/:id', (req, res) => {
    res.send(req.params.id);
});

app.get('/api/testData/:id', (req, res) => {
    const test = testData.find(c => c.id === parseInt(req.params.id));
    if (!test) res.status(404).send('The test with the given ID was not found');
    res.send(test);
})

const port = 2999; // Hardcoded port
app.listen(port, () => console.log(`Listening on http://localhost:${port}...`));
