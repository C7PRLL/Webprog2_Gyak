const db = require('../models');
const ContactMessage = db.ContactMessage;
const User = db.User;

// Üzenetek listázása
exports.messages = async (req, res) => {
    // Admin ellenőrzés + Redirect javítás
    if (!req.session.user || !req.session.user.is_admin) {
        return res.redirect(req.baseUrl + '/');
    }

    try {
        const messages = await ContactMessage.findAll({ 
            order: [['created_at', 'DESC']] 
        });
        
        res.render('admin/messages', { messages });
    } catch (e) {
        res.status(500).send("Hiba: " + e.message);
    }
};

// Felhasználók listázása
exports.users = async (req, res) => {
    // Admin ellenőrzés
    if (!req.session.user || !req.session.user.is_admin) {
        return res.redirect(req.baseUrl + '/');
    }

    try {
        const users = await User.findAll({ 
            order: [['created_at', 'DESC']] 
        });
        
        res.render('admin/users', { users });
    } catch (e) {
        res.status(500).send("Hiba: " + e.message);
    }
};

// Üzenet törlése
exports.deleteMessage = async (req, res) => {
    if (req.session.user?.is_admin) {
        try {
            await ContactMessage.destroy({ where: { id: req.params.id } });
        } catch (e) {
            console.error("Törlési hiba:", e);
        }
    }
   
    res.redirect(req.baseUrl + '/admin/messages');
};

// Olvasottnak jelölés
exports.markRead = async (req, res) => {
    if (req.session.user?.is_admin) {
        try {
            await ContactMessage.update({ is_read: true }, { where: { id: req.params.id } });
        } catch (e) {
            console.error("Update hiba:", e);
        }
    }
   
    res.redirect(req.baseUrl + '/admin/messages');
};