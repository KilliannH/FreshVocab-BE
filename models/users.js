var mongoose = require('mongoose');

//Users Schema
var usersSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
      type: String,
      required: true
    },
    role: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

User = module.exports = mongoose.model('Users', usersSchema);

// Get users
module.exports.getUsers = function (callback, limit) {
    User.find(callback).limit(limit);
}

// Get user by ID
module.exports.getUserById = function (id, callback) {
    User.findById(id, callback)
}

// Get user by email
module.exports.getUserByEmail = function (email, callback) {
    User.findOne({'email': email}, callback)
}

// Add user
module.exports.addUser = function (user, callback) {
    User.create(user, callback);
}

// Update user
module.exports.updateUser = function (id, user, options, callback) {
    var query = {_id: id};
    var update = {
        username: user.username,
        email: user.email,
        role: user.role,
        password: user.password
    }
    User.findOneAndUpdate(query, update, options, callback);
}

// Delete user
module.exports.deleteUser = function (id, callback) {
    var query = {_id: id};
    User.remove(query, callback);
}
