const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./Task');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is Invalid');
            }
        }
    },

    password: {
        type: String,
        required: true,
        minLength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"');
            }
        }
    },  

    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number.');
            }
        }
    },

    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],

    avatar: {
        type: Buffer
    }
}, {
    // createdAt and updatedAt property is added for each document in DB.
    timestamps: true
});

// virtual property - Its called virtual because we are not actually changing this model,
// its just a way for mongoose to find relation.
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

// The below method add authorization token to tokens in db.
// token here handles the login or create user, wherever and whenever the user logs in.
userSchema.methods.generateAuthToken = async function () {
    const user = this;

    // "tokenValue" should be same everywhere when verification is needed for
    // jsonwebtoken.
    // Generates token. (Below code)
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    
    // Adding token to tokens array.
    user.tokens = user.tokens.concat({ token });
    await user.save();
    
    return token;
}

// This method allows to hide the information for each user, whichever info is not needed.
// toJSON is a JS property which is called just before showing result.
userSchema.methods.toJSON = function () {
    const userObject = this.toObject();

    // Removing information that is not needed to show.
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Unable To Login!');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Unable To Login!');
    }

    return user;
}

// We use normal function here, because this plays a role here.
// pre & save - Performing operation just before saving in DB.
// Middleware. Hashing the password before saving.
userSchema.pre('save', async function (next) {
    // this refers to the user that has been created.
    if (this.isModified('password')) {
        // 8 is the number of times hash algo to be applied on password
        // and 8 is the number which is between speed and security, as told by creator.
        this.password = await bcrypt.hash(this.password, 8);
    }

    // next() ends the function, otherwise it will never end and hangs here.
    next();
});

// Before deleting user, delete their task too.
userSchema.pre('remove', async function (next) {
    const user = this;

    await Task.deleteMany({ owner: user._id });

    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;