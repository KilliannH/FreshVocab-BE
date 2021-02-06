var mongoose = require('mongoose');

//Vocabs Schema
var vocabsSchema = mongoose.Schema({
    word: {
        type: String,
        required: true
    },
    translation: {
        type: String,
        required: true
    },
});

Vocab = module.exports = mongoose.model('Vocabs', vocabsSchema);

// Get vocabs
module.exports.getVocabs = function (callback, limit) {
    Vocab.find(callback).limit(limit);
}

// Get vocab by ID
module.exports.getVocabById = function (id, callback) {
    Vocab.findById(id, callback)
}

// Add vocab
module.exports.addVocab = function (vocab, callback) {
    Vocab.create(vocab, callback);
}

// Update vocab
module.exports.updateVocab = function (id, vocab, options, callback) {
    var query = {_id: id};
    var update = {
        word: vocab.word,
        translation: vocab.translation
    }
    Vocab.findOneAndUpdate(query, update, options, callback);
}

// Delete vocab
module.exports.deleteVocab = function (id, callback) {
    var query = {_id: id};
    Vocab.remove(query, callback);
}
