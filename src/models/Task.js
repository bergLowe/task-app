const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        trim: true
    },

    completed: {
        type: Boolean,
        default: false,
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Create a reference for the task that belongs to a User.
    }
}, {
    timestamps: true
});

taskSchema.pre('save', function (next) {
    this.title = this.title.trim()[0].toUpperCase() + this.title.slice(1).toLowerCase();
    next();
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;