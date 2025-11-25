const db = require('../models');
const ContactMessage = db.ContactMessage;

// Űrlap megjelenítése
exports.showForm = (req, res) => {
    res.render('contact', { 
        success: null, 
        errors: {}, 
        oldInput: {} 
    });
};

// Üzenet mentése
exports.sendMessage = async (req, res) => {
    try {
        await ContactMessage.create({
            name: req.body.name,
            email: req.body.email,
            message: req.body.message,
            newsletter: req.body.newsletter === 'on' // Checkbox kezelés
        });
        
        res.render('contact', { 
            success: 'Köszönjük! Üzenetét megkaptuk.', 
            errors: {}, 
            oldInput: {} 
        });
    } catch (e) {
        res.render('contact', { 
            success: null, 
            errors: { general: 'Hiba történt a küldéskor.' }, 
            oldInput: req.body 
        });
    }
};