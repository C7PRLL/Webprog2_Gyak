const db = require('../models');
const User = db.User;
const bcrypt = require('bcrypt');

// Bejelentkezés űrlap
exports.loginForm = (req, res) => {
    res.render('auth/login');
};

// Bejelentkezés logika
exports.login = async (req, res) => {
    try {
        const user = await User.findOne({ where: { email: req.body.email } });
        
        if (user && await bcrypt.compare(req.body.password, user.password)) {
            req.session.user = user;
            return res.redirect('/');
        }
        
        res.render('auth/login', { error: 'Hibás email vagy jelszó' });
    } catch (e) {
        res.status(500).send(e.message);
    }
};

// Regisztráció űrlap
exports.registerForm = (req, res) => {
    res.render('auth/register');
};

// Regisztráció logika
exports.register = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });
        res.redirect('/login');
    } catch (e) {
        res.render('auth/register', { error: 'Hiba történt (pl. foglalt email)' });
    }
};

// Kijelentkezés
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};