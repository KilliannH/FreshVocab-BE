const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const config = require('./config.js.example');

const app = express();

app.use(cors());

app.use(bodyParser.json());

const port = config.PORT || process.env.PORT;
const host = config.HOST || process.env.HOST;

Vocab = require('./models/vocabs');
User = require('./models/users');

const checkAuth = (req, res, next) => {
    const token = req.get('Authorization');

    if(token) {
        jwt.verify(token, config.TOKEN_SECRET, (err, decoded) => {
            if(decoded) {
                next();
            } else {
                res.status(401).send('Unauthorized')
            }
        })
    }
}

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

app.post('/login', (req, res) => {
    var credentials = req.body;
    User.getUserByEmail(credentials.email, (err, user) => {
        if(err) {
            res.status(404).send(err);
        }

        // todo - hash password before send it to db
        if(user.password === credentials.password) {
            jwt.sign({
                data: {
                    username: user.username,
                    email: user.email,
                }
            },config.TOKEN_SECRET, {expiresIn: 60*60*24*7, algorithm: config.TOKEN_ALGORITHM}, (err, token) => {
             res.json(token);
            }); // 7 days
        } else {
            res.status(401).send('Unauthorized')
        }
    })
});

/// GET VOCABS ///
app.get('/api/vocabs', checkAuth, (req, res) => {
    Vocab.getVocabs((err, vocabs) => {
        if(err) {
            throw err;
        }
        res.json(vocabs);
    });
});

/// GET VOCAB ///
app.get('/api/vocabs/:_id', checkAuth, (req, res) => {
    Vocab.getVocabById(req.params._id,(err, vocab) => {
        if(err) {
            throw err;
        }
        res.json(vocab);
    });
});

/// POST VOCAB ///
app.post('/api/vocabs', checkAuth, (req, res) => {
    const vocab = req.body;
    Vocab.addVocab(vocab, (err, vocab) => {
        if(err) {
            throw err;
        }
        res.json(vocab);
    });

});

/// PUT VOCAB ///
app.put('/api/vocabs/:_id', checkAuth, (req, res) => {
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
app.delete('/api/vocabs/:_id', checkAuth, (req, res) => {
    var id = req.params._id;

    Vocab.deleteVocab(id, (err, vocab) => {
        if(err) {
            throw err;
        }
        res.json(vocab._id);
    });

});

/// GET USERS ///
app.get('/api/users', checkAuth, (req, res) => {
    User.getUsers((err, users) => {
        if(err) {
            throw err;
        }
        res.json(users);
    });
});

/// GET USER ///
app.get('/api/users/:_id', checkAuth, (req, res) => {
    User.getUserById(req.params._id,(err, user) => {
        if(err) {
            throw err;
        }
        res.json(user);
    });
});

/// POST USER ///
app.post('/api/users', checkAuth, (req, res) => {
    const user = req.body;
    USer.addUser(user, (err, user) => {
        if(err) {
            throw err;
        }
        res.json(user);
    });
});

/// PUT USER ///
app.put('/api/users/:_id', checkAuth, (req, res) => {
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
app.delete('/api/users/:_id', checkAuth, (req, res) => {
    var id = req.params._id;

    User.deleteUser(id, (err, user) => {
        if(err) {
            throw err;
        }
        res.json(user._id);
    });

});

app.listen(port, host, () => {
   console.log(`Running on ${host}:${port}`);
});
