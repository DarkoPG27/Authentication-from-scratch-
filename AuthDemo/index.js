const express = require('express');
const app = express();
const User = require('./models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');

mongoose.connect('mongodb://localhost:27017/loginDemo',
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTON ERROR!!!")
        console.log(err)
    })

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.urlencoded({ extended: true })); //parse req body
app.use(session({ secret: 'notagodsecret' }))

//reqire login middleware
const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect('/login')
    }
    next();
}

app.get('/', (req, res) => {
    res.send('HOME PAGE')
})

//REGISTER
app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    // res.send(req.body); //  vratice {"username":"Darko","password":"123456"}
    const { password, username } = req.body;
    const hash = await bcrypt.hash(password, 12); //$2b$12$YEjsi0bUhdYUENRmummVn.K/XJB9dADwZDhAL6.LRTIRHuoY/F2NC
    const user = new User({
        username,
        password: hash
    })
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/')
})

//LOGIN
app.get('/login', (req, res) => {
    res.render('login')
})
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const validPassword = await bcrypt.compare(password, user.password)
    if (validPassword) {
        req.session.user_id = user._id;
        res.redirect('/secret');
    } else {
        res.redirect('/login')
    }
})

app.post('/logout', (req, res) => {
    //  req.session.user_id = null;
    req.session.destroy();
    res.redirect('/login');
})

app.get('/secret', requireLogin, (req, res) => {
    res.render('secret')
})

app.listen(3000, () => {
    console.log("SERVING YOUR APP!")
})