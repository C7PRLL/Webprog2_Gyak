const db = require('../models');
const ContactMessage = db.ContactMessage;
const User = db.User;

// Üzenetek listázása
exports.messages = async (req, res) => {
    // Admin ellenőrzés
    if (!req.session.user || !req.session.user.is_admin) {
        return res.redirect('/');
    }

    const messages = await ContactMessage.findAll({ order: [['createdAt', 'DESC']] });
    
    res.render('admin/messages', { messages });
};

// Felhasználók listázása
exports.users = async (req, res) => {
    if (!req.session.user || !req.session.user.is_admin) {
        return res.redirect('/');
    }

    const users = await User.findAll({ order: [['createdAt', 'DESC']] });
    
    res.render('admin/users', { users });
};

// Üzenet törlése (Opcionális)
exports.deleteMessage = async (req, res) => {
    if (req.session.user?.is_admin) {
        await ContactMessage.destroy({ where: { id: req.params.id } });
    }
    res.redirect('/admin/messages');
};