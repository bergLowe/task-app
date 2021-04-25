const mongoose = require('mongoose');
const validator = require('validator');

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

/* ------------------------------------------------------------------------------------------ */
/* (BELOW IS LEARNING) */

/* Created a model. Its like a class, whose name is User and its instances. */
// const User = mongoose.model('User', {
//     name: {
//         type: String,
//         required: true,
//         trim: true
//     },
    
//     email: {
//         type: String,
//         required: true,
//         trim: true,
//         lowercase: true,
//         validate(value) {
//             if (!validator.isEmail(value)) {
//                 throw new Error('Email is Invalid');
//             }
//         }
//     },

//     password: {
//         type: String,
//         required: true,
//         minLength: 7,
//         trim: true,
//         validate(value) {
//             if (value.toLowerCase().includes('password')) {
//                 throw new Error('Password cannot contain "password"');
//             }
//         }
//     },  

//     age: {
//         type: Number,
//         default: 0,
//         validate(value) {
//             if (value < 0) {
//                 throw new Error('Age must be a positive number.');
//             }
//         }
//     }
// });

// const myInfo = new User({
//     name: '  Sumer',
//     email: 'SUMER2000SINGH@HOTMAIL.COM    ',
//     password: 'passwor123',
//     age: 35
// });

// myInfo.save().then(res => console.log(res + "\n\n\n\n" + myInfo)).catch(err => console.log(err));

/* ------------------------------------------------------------------------------------------ */

/* TASK */

// const Task = mongoose.model('Task', {
//     description: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     completed: {
//         type: Boolean,
//         default: false,
//     }
// });

// const firstTask = new Task({
//     description: 'New Task(with completed)',
//     completed: true
// });

// firstTask.save().then(res => console.log(res)).catch(err => console.log(err));

/* ------------------------------------------------------------------------------------------ */