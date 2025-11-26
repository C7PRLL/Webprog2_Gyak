const express = require('express');
const router = express.Router();

// Kontrollerek importálása
const pilotCtrl = require('../controllers/pilotController');
const diagramCtrl = require('../controllers/diagramController');
const dbCtrl = require('../controllers/databaseController'); // Ha ezt létrehoztad
const contactCtrl = require('../controllers/contactController');
const adminCtrl = require('../controllers/adminController');
const settingsCtrl = require('../controllers/settingsController');
const authCtrl = require('../controllers/authController');

// --- FŐOLDAL ---
router.get('/', (req, res) => res.render('index'));

// --- PILÓTÁK (CRUD) ---
router.get('/pilots', pilotCtrl.index);
router.get('/pilots/create', pilotCtrl.create);
router.post('/pilots', pilotCtrl.store);
router.get('/pilots/edit/:id', pilotCtrl.edit);
router.post('/pilots/edit/:id', pilotCtrl.update);
router.post('/pilots/delete/:id', pilotCtrl.destroy);
router.get('/pilots/:id', pilotCtrl.show);

// --- DIAGRAMOK ---
router.get('/diagrams', diagramCtrl.index);

// --- ADATBÁZIS OLDAL ---
router.get('/database', dbCtrl.index);

// --- KAPCSOLAT (Public) ---
router.get('/contact', contactCtrl.showForm);
router.post('/contact', contactCtrl.sendMessage);

// --- ADMIN (Védett) ---
router.get('/admin/messages', adminCtrl.messages);
router.post('/admin/messages/mark-read/:id', adminCtrl.markRead);
router.post('/admin/messages/delete/:id', adminCtrl.deleteMessage);
router.get('/admin/users', adminCtrl.users);

// --- SETTINGS (Profil) ---
router.get('/settings/profile', settingsCtrl.profile);
router.post('/settings/profile', settingsCtrl.updateProfile);

// --- AUTH ---
router.get('/login', authCtrl.loginForm);
router.post('/login', authCtrl.login);
router.get('/logout', authCtrl.logout);
router.get('/register', authCtrl.registerForm);
router.post('/register', authCtrl.register);



module.exports = router;