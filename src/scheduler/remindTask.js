const Task = require('../models/Task');
const User = require('../models/User');
const sgMail = require('@sendgrid/mail');

const sendReminderMail = (email) => {
    sgMail.send({
        to: email,
        from: 'sumer2000pasin@gmail.com',
        subject: 'Task Manger: Tasks',
        text: `Reminder, your tasks are incomplete!. Please login to see the unfinished tasks.`
    })
}

const remindTask = async () => {
    let task = await Task.find({ completed: false });
    if (task.length === 0) {
        // console.log("All tasks are completed!")
        setTimeout(() => { remindTask() }, 21600000)
        return ;
    } else {
        let list = [];
        task.forEach(async (el) => {
            if (!(list.includes(el.owner.toString()))) {
                list.push(el.owner.toString());
                let user = await User.findById(el.owner);
                sendReminderMail(user.email);
            }
        });
        setTimeout(() => { remindTask() }, 43200000)
        // console.log(list)
    }
}

module.exports = {
    remindTask
}