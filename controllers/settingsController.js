const db = require('../models');
const User = db.User;
const bcrypt = require('bcrypt');

// Profil oldal
exports.profile = (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.render('settings/profile', { user: req.session.user });
};

// Profil frissítése
exports.updateProfile = async (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    
    try {
        await User.update(
            { name: req.body.name, email: req.body.email },
            { where: { id: req.session.user.id } }
        );
        
        // Session frissítése
        req.session.user.name = req.body.name;
        req.session.user.email = req.body.email;
        
        res.redirect('/settings/profile');
    } catch (e) {
        res.status(500).send('Hiba a frissítéskor');
    }
};