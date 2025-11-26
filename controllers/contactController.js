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
            // A HTML checkbox 'on' értéket küld, ha be van pipálva, egyébként undefined
            newsletter: req.body.newsletter === 'on' 
        });
        
        // Sikeres mentés után visszajelzés
        res.render('contact', { 
            success: 'Köszönjük! Üzenetét megkaptuk.', 
            errors: {}, 
            oldInput: {} 
        });
    } catch (e) {
        console.error("Kapcsolat hiba:", e); // Ez fontos a szerver logokhoz!
        
        res.render('contact', { 
            success: null, 
            errors: { general: 'Hiba történt a küldéskor.' }, 
            oldInput: req.body 
        });
    }
};