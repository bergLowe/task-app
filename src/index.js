const express = require('express');
// The below code just ensures that the file runs.
// That is a connection is establised with MongoDB.
require('./db/mongoose');
// Code for get, post or patch are divided into two files.
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
const  { remindTask } = require('./scheduler/remindTask');

const app = express();
const port = process.env.PORT;

// Express middleware.
// It gets new request, then it will perform some operation like below.
// If its valid then will go to next() operation, otherwise else.
// Without middleware its like, new request then the operation to route.
// app.use((req, res, next) => {
    // if (req.method === 'GET') {
    //     res.send('GET Requests are Disabled.')
    // } else {
    //     next();
    // }

    // res.status(503).send('Under Maintenance. Will be back shortly!');
// });

// Automatically parse incoming json into object.
app.use(express.json())

// Using those routed files.
app.use(userRouter);
app.use(taskRouter);

remindTask();

app.listen(port, () => {
    console.log("Port is running on " + port);
})