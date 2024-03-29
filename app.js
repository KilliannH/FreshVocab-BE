const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const hmacSHA256 = require('crypto-js/hmac-sha256');
Base64 = require('crypto-js/enc-base64');
const config = require('./config.js');

const app = express();

app.use(cors());

app.use(bodyParser.json());

const port = config.PORT || process.env.PORT;
const host = config.HOST || process.env.HOST;

Vocab = require('./models/vocab');
User = require('./models/users');

const checkAuth = (req, res, next) => {
    const token = req.get('Authorization').split('Bearer ')[1];

    if(token) {
        jwt.verify(token, config.TOKEN_SECRET, (err, decoded) => {
            if(decoded) {
                next();
            } else {
                res.status(401).json({success: false, message: 'Unauthorized'})
            }
        });
    } else {
        res.status(400).json({success: false, message: 'Bad Request'});
    }
}

const checkAdmin = (req, res, next) => {
    const token = req.get('Authorization');

    if(token) {
        jwt.verify(token, config.TOKEN_SECRET, (err, decoded) => {
            if(decoded) {
                User.getUserByEmail(decoded.email, (err, user) => {
                    if (err) {
                        res.status(404).json({success: false, message: 'Not Found'});
                    }

                    if (user.role === 'Admin') {
                        next();
                    }
                });
            } else {
                res.status(401).json({success: false, message: 'Unauthorized'});
            }
        });
    }
    res.status(400).json({success: false, message: 'Bad Request'});
}

mongoose.connect('mongodb://localhost/' + config.DB_NAME, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}, () => {
  console.log("Db connected...");
});

/// DEFAULT GET ///

app.post('/api/login', (req, res) => {
    const credentials = req.body;
    if(credentials.email && credentials.password) {
        User.getUserByEmail(credentials.email, (err, user) => {
            if (err) {
                res.status(404).json({success: false, message: 'Not Found'});
            }

            let encrypt;
                try {
                    encrypt = Base64.stringify(hmacSHA256(credentials.password, config.HMAC_KEY));
                } catch (e) {
                    res.status(500).json({success: false, message: "Internal server error"});
                }

            if (user.password === encrypt) {
                jwt.sign({
                    username: user.username,
                    email: user.email
                }, config.TOKEN_SECRET, {
                    expiresIn: 60 * 60 * 24 * 7, // 7 days
                    algorithm: config.TOKEN_ALGORITHM
                }, (err, token) => {
                    if(err) {
                        res.status(500).json({success: false, message: "Internal Server Error"});
                    }
                    const decoded = jwt.decode(token);
                    res.json({
                        success: true,
                        data: {
                            token: token.replace(/^/, 'Bearer '),
                            decoded: decoded
                        }
                    });
                });
            } else {
                res.status(401).json({success: false, message: 'Unauthorized'});
            }
        })
    } else {
        res.status(400).send('Bad Request');
    }
});

app.post('/api/decode', (req, res) => {
    let token = req.body.token;
    let decoded
    if(token) {
        try {
            token = token.split('Bearer ')[1];
            decoded = jwt.decode(token);
            // todo - need to validate all user data here
            // why ? bcse we need to invalidate token if the user has changed his email / username
        } catch (e) {
            res.status(500).json({success: false, message: "Internal server error"});
        }
        res.json({success: true, decoded: decoded});
    } else {
        res.status(400).send('Bad Request');
    }
});

/// GET VOCABS ///
app.get('/api/vocab', checkAuth, (req, res) => {
    Vocab.getVocabs((err, vocabs) => {
        if(err) {
            res.status(404).json({success: false, message: "Not Found"});
        }
        res.json({success: true, vocab: vocabs});
    });
});

/// GET VOCAB BY ID ///
app.get('/api/vocab/:_id', checkAuth, (req, res) => {
    Vocab.getVocabById(req.params._id,(err, vocab) => {
        if(err) {
            res.status(404).json({success: false, message: "Not Found"});
        }
        res.json({success: true, vocab: vocab});
    });
});

/// POST VOCAB ///
app.post('/api/vocab', checkAuth, (req, res) => {
    const vocab = req.body;
    Vocab.addVocab(vocab, (err, vocab) => {
        if(err) {
            res.status(500).json({success: false, message: "Internal Server Error"});
        } else {
            res.json({success: true, vocab: vocab});
        }
    });

});

/// PUT VOCAB ///
app.put('/api/vocab/:_id', checkAuth, (req, res) => {
    const id = req.params._id;
    const vocab = req.body;
    Vocab.updateVocab(id, vocab, {}, function (err, updtVocab) {
        if(err) {
            res.status(500).json({success: false, message: "Internal Server Error"});
        } else {
            res.json({success: true, vocab: updtVocab});
        }
    });
});

/// DELETE VOCAB BY ID ///
app.delete('/api/vocab/:_id', checkAuth, (req, res) => {
    var id = req.params._id;

    Vocab.deleteVocab(id, (err, vocab) => {
        if(err) {
            res.status(404).json({success: false, message: "Not Found"});
        } else {
            res.json({success: true, vocab: vocab._id});
        }
    });

});

/// GET USERS ///
app.get('/api/users', checkAdmin, (req, res) => {
    User.getUsers((err, users) => {
        if(err) {
            res.status(404).json({success: false, message: "Not Found"});
        } else {
            res.json({success: true, users: users});
        }
    });
});

/// GET USER BY ID ///
app.get('/api/users/:_id', checkAdmin, (req, res) => {
    User.getUserById(req.params._id,(err, user) => {
        if(err) {
            res.status(404).json({success: false, message: "Not Found"});
        } else {
            res.json({success: true, user: user});
        }
    });
});

/// POST USER ///
app.post('/api/users', checkAdmin, (req, res) => {
    const user = req.body;
    User.addUser(user, (err, user) => {
        if(err) {
            res.status(500).json({success: false, message: "Internal Server Error"});
        } else {
            res.json({success: true, user: user});
        }
    });
});

/// PUT USER ///
app.put('/api/users/:_id', checkAdmin, (req, res) => {
    const id = req.params._id;
    const user = req.body;
    User.updateUser(id, user, {}, function (err, updtUser) {
        if(err) {
            res.status(404).json({success: false, message: "Not Found"});
        } else {
            res.json({success: true, user: updtUser});
        }
    });
});

/// DELETE USER BY ID ///
app.delete('/api/users/:_id', checkAdmin, (req, res) => {
    var id = req.params._id;

    User.deleteUser(id, (err, user) => {
        if(err) {
            res.status(404).json({success: false, message: "Not Found"});
        } else {
            res.json({success: true, user: user._id});
        }
    });

});

app.listen(port, host, () => {
   console.log(`Running on ${host}:${port}`);
});
