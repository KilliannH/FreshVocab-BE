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
    authMethod: {
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
        authMethod: user.authMethod
    }
    User.findOneAndUpdate(query, update, options, callback);
}

// Delete user
module.exports.deleteUser = function (id, callback) {
    var query = {_id: id};
    User.remove(query, callback);
}
