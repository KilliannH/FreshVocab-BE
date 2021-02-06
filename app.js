const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";

app.use(cors());
app.use(bodyparser.json());

Vocab = require('./models/vocabs');
User = require('./models/users');

mongoose.connect('mongodb://localhost/freshvocab-db', {
    useUnifiedTopology: true,
    useNewUrlParser: true
}, () => {
  console.log("Db connected...");
});

/// DEFAULT GET ///
app.get('/',(req, res) => {
    res.send('Please use /api/vocabs');
});

/// GET VOCABS ///
app.get('/api/vocabs', (req, res) => {
    Vocab.getVocabs((err, vocabs) => {
        if(err) {
            throw err;
        }
        res.json(vocabs);
    });
});

/// GET VOCAB ///
app.get('/api/vocabs/:_id', (req, res) => {
    Vocab.getVocabById(req.params._id,(err, vocab) => {
        if(err) {
            throw err;
        }
        res.json(vocab);
    });
});

/// POST VOCAB ///
app.post('/api/vocabs', (req, res) => {
    const vocab = req.body;
    Vocab.addVocab(vocab, (err, vocab) => {
        if(err) {
            throw err;
        }
        res.json(vocab);
    });

});

/// PUT VOCAB ///
app.put('/api/vocabs/:_id', (req, res) => {
    const id = req.params._id;
    const vocab = req.body;
    Vocab.updateVocab(id, vocab, {}, function (err, book) {
        if(err) {
            throw err;
        }
        res.json(vocab);
    });
});

/// DELETE VOCAB ///
app.delete('/api/vocabs/:_id', (req, res) => {
    var id = req.params._id;

    Vocab.deleteVocab(id, (err, vocab) => {
        if(err) {
            throw err;
        }
        res.json(vocab._id);
    });

});

/// GET USERS ///
app.get('/api/users', (req, res) => {
    User.getUsers((err, users) => {
        if(err) {
            throw err;
        }
        res.json(users);
    });
});

/// GET USER ///
app.get('/api/users/:_id', (req, res) => {
    User.getUserById(req.params._id,(err, user) => {
        if(err) {
            throw err;
        }
        res.json(user);
    });
});

/// POST USER ///
app.post('/api/users', (req, res) => {
    const user = req.body;
    USer.addUser(user, (err, user) => {
        if(err) {
            throw err;
        }
        res.json(user);
    });
});

/// PUT USER ///
app.put('/api/users/:_id', (req, res) => {
    const id = req.params._id;
    const user = req.body;
    User.updateUser(id, user, {}, function (err, book) {
        if(err) {
            throw err;
        }
        res.json(user);
    });
});

/// DELETE USER ///
app.delete('/api/users/:_id', (req, res) => {
    var id = req.params._id;

    User.deleteUser(id, (err, user) => {
        if(err) {
            throw err;
        }
        res.json(user._id);
    });

});

app.listen(PORT, HOST, () => {
   console.log(`Running on ${HOST}:${PORT}`);
});
