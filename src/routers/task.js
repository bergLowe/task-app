const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/authentication');
const router = new express.Router();

// Refer user.js for any given line code to understand.
// Documented in that. Mostly similar. 

// Using async and await, similar work as in users.
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save();
        res.status(201).send(task);
    } catch (err) {
        res.status(400).send(err);
    }
})

// Examples:
// GET /tasks?completed=true
// GET /tasks?limit=5&skip=5    | skip here helps to iterate. If I write 5 it will get second page
//                              | and if 10 then third page.
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    // match is the name of object to be given to populate();
    // If match has some related key: value pair, then it will give data
    // that will match with specified criteria, otherwise all.
    const match = {};

    const sort = {};

    // If the link has ?completed=true/false,
    // then it will be in match, that is we want data that has task to true/false.
    // We are getting query.completed in string format.
    if (req.query.completed) {
        match.completed = req.query.completed === 'true';
    }

    // sorting the data. When its 1, ascending and -1, descending.
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(":");
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    try {
        // 'tasks' below is a virtual connection built in the model User.
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                // limit and skip allows for pagination.
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.tasks);

        /* ***OR*** - There are two methods to get all tasks for a user. */

        // const tasks = await Task.find({ owner: req.user._id })
        // res.send(tasks);
    } catch (err) {
        res.status(500).send();
    }
});

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {
        // Task that is being fetched is the task that a particular user has created.
        const task = await Task.findOne({ _id, owner: req.user._id });

        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch (err) {
        res.status(500).send();
    }
});

// router.patch('/tasks/:id', async (req, res) => {
//     const updates = Object.keys(req.body);
//     const allowedUpdates = ['completed', 'description'];
//     const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
//     if (!isValidOperation) {
//         return res.status(400).send({ error: "Invalid Operation" });
//     }

//     try {
//         // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
//         //     new: true,
//         //     runValidators: true
//         // });

//         const task = await Task.findById(req.params.id);
//         updates.forEach(update => task[update] = req.body[update]);
//         await task.save();
        
//         if (!task) {
//             return res.status(404).send();
//         }

//         res.send(task);
//     } catch (err) {
//         res.status(400).send(err);
//     }
// });

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['title', 'completed', 'description'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid Operation" });
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
        
        // If task not found.
        if (!task) {
            return res.status(404).send();
        }
        
        updates.forEach(update => task[update] = req.body[update]);
        await task.save();
        res.send(task);
    } catch (err) {
        res.status(400).send(err);
    }
});

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        // const task = await Task.findByIdAndDelete(req.params.id);
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch (err) {
        res.status(500).send(err);
    }
});

module.exports = router;