const db = require('../models');
const ContactMessage = db.ContactMessage;
const User = db.User;

// Üzenetek listázása
exports.messages = async (req, res) => {
    if (!req.session.user || !req.session.user.is_admin) {
        return res.redirect('/');
    }

    try {
        const messages = await ContactMessage.findAll({ 
            order: [['created_at', 'DESC']] // JAVÍTVA: created_at
        });
        
        res.render('admin/messages', { messages });
    } catch (e) {
        res.status(500).send("Hiba: " + e.message);
    }
};

// Felhasználók listázása
exports.users = async (req, res) => {
    if (!req.session.user || !req.session.user.is_admin) {
        return res.redirect('/');
    }

    try {
        const users = await User.findAll({ 
            order: [['created_at', 'DESC']] 
        });
        
        // JAVÍTVA: Ha a fájl neve 'registered_users.ejs', akkor így hívjuk:
           res.render('admin/users', { users });
    } catch (e) {
        res.status(500).send("Hiba: " + e.message);
    }
};
// Üzenet törlése
exports.deleteMessage = async (req, res) => {
    if (req.session.user?.is_admin) {
        await ContactMessage.destroy({ where: { id: req.params.id } });
    }
    res.redirect('/admin/messages');
};

// Olvasottnak jelölés
exports.markRead = async (req, res) => {
    if (req.session.user?.is_admin) {
        await ContactMessage.update({ is_read: true }, { where: { id: req.params.id } });
    }
    res.redirect('/admin/messages');
};