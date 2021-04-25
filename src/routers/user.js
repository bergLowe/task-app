const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/authentication');
const multer = require('multer');
const sharp = require('sharp');
const { sendWelcomeMail, sendDeleteMail } = require('../emails/account');
const router = new express.Router();

// Currently, sending POST data from Postman.
router.post('/users', async (req, res) => {
    const user = new User(req.body);
    // By default it sets the 200 - Ok, but to be precise
    // 201 - Created, is more relevant.
    try {
        await user.save();
        sendWelcomeMail(user.email, user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (err){
        res.status(400).send(err);
    }
});

// Checking for login details.
router.post('/users/login', async (req, res) => {
    try {
        // findByCredentials is a custom fucnction defined with Schema during creating User model.
        const user = await User.findByCredentials(req.body.email, req.body.password);

        const token = await user.generateAuthToken();

        res.send({ user, token });
    } catch (err) {
        res.status(400).send();
    }
});

router.post('/users/logout', auth, async (req, res) => {
    try {
        // token.token because token is the name for the object, it has a property that we need.
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
        await req.user.save();

        res.send();
    } catch (err) {
        res.status(500).send();
    }
});

router.post('/users/logoutall', auth, async (req, res) => {
    try {
        // Deleting all tokens that is removing a person from all devices.
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (err) {
        res.status(500).send();
    }
});

// router.get('/users', auth, (req, res) => {
//     User.find({}).then((users) => {
//         res.send(users);
//     }).catch(err => res.status(500).send());
// });

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});

// router.get('/users/:id', (req, res) => {
//     const _id = req.params.id;

//     User.findById(_id).then(user => {
//         // Sometimes we might not get what we want, like data might not be there in user.
//         // That's why we use condition case here.
//         if (!user) {
//             res.status(404).send();
//         }
//         res.send(user);
//     }).catch(err => {
//         res.status(500).send();
//     })
// });

// router.patch('/users/:id', async (req, res) => {
//     // We will get the array of keys in updates variable.
//     const updates = Object.keys(req.body);
//     const allowedUpdates = ['name', 'email', 'password', 'age'];
//     // every - if for every element in updates array we get true,
//     //          then it will be true otherwise false.
//     const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

//     // We are doing isValidOperation, because if user request to update height
//     // and that property is not in it, then it should throw error as Bad Request,
//     // anyways if we don't do that it won't throw error but it won't update anything either.
//     if (!isValidOperation) {
//         return res.status(400).send({ error: 'Invalid Request' });
//     }

//     try {
//         // new: true - Here we get updated value from db.
//         // runValidators - Runs validation specified in the Model for the value
//         //                  that is being updated.
//         // Here in req.body we are dynamically updating the value. If we want to statically 
//         // update the value, we can replace it with {name: "Demo"}.

//         // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
//         //     new: true,
//         //     runValidators: true
//         // });

//         /* Instead of the above code, we are going to use the below one. 
//         Its because of the mongoose middleware, as we won't be applicable to 
//         patch() / updating values. */

//         const user = await User.findById(req.params.id);
//         updates.forEach(update => user[update] = req.body[update]);
//         await user.save();

//         // If no such user is there.
//         if (!user) {
//             return res.status(404).send();
//         }
//         res.send(user);
//     } catch (err) {
//         // The user may get validation issue or
//         // something went wrong, so 400 - Bad Request.
//         res.status(400).send(err);
//     }
// });

// Updating values in DB. Refer above comment section for reference.
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid Request' });
    }

    try {
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        res.send(req.user);
    } catch (err) {
        res.status(400).send(err);
    }
});

router.delete('/users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id);

        // if (!user) {
        //     return res.status(404).send();
        // }

        /* The above part is not needed anymore, as the user will be authenticated before performing
        delete operation. */

        await req.user.remove();
        sendDeleteMail(req.user.email, req.user.name);
        res.send(req.user);
    } catch (err) {
        res.status(500).send(err);
    }
});

const upload = multer({
    // dest: 'avatars', // Where the send file will be saved.
    limits: {
        // File size should be <= 1MB only. (Its in bytes).
        fileSize: 1000000
    },
    // req file contain information about request and file uploaded.
    // callback here is function, which we have to tell it that we are done filtering.
    fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return callback(new Error('Please upload an image.'))
        }
        // Successfully sending data.   
        callback(undefined, true);
    }
});
// upload.single is the middleware and single here defines that it accepts single file.
// The upload middleware used to handle the file and save it in specified dest folder,
// but when we remove dest property then it will pass the file to the function.
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    // The above 4 arguments are must, as they tell express that this function is for
    // uncaught error. And here are sending the error in object.
    res.status(400).send({ error: error.message });
});

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error();
        }  

        // Generally in set, we have to specify type of image.
        // Example: image/jpeg 'or' image/jpg 'or' image/png
        // Here we are always working with png.
        res.set('Content-Type', 'image/png')
        res.send(user.avatar);
    } catch (err) {
        res.status(404).send();
    }
});

// Deleting avatar from user.
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

module.exports = router;