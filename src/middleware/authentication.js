const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        // Using Bearer authentication.
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // tokens.token is a string property. It will look in tokens array 
        // which have specified token value.
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });
        if (!user) {
            throw new Error();
        }

        // We are saving token and user in the request route handler.
        // So that we don't waste time requesting again from the db.
        req.token = token;
        req.user = user;
        next();
    } catch (err) {
        res.status(401).send({error: 'Please, Authenticate!'});
    }
}

module.exports = auth;