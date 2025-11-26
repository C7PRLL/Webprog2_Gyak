const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const db = require('./models');
require('dotenv').config();

// 1. PORT BEÁLLÍTÁSA
const PORT = process.env.PORT || 4125;

// 2. ALAP ÚTVONAL (PREFIX)
const BASE_URL = '/app125';

// Config
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 3. STATIKUS FÁJLOK PREFIXELÉSE

app.use(BASE_URL, express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({ 
    secret: process.env.SESSION_SECRET || 'titkos_f1_kulcs', 
    resave: false, 
    saveUninitialized: true 
}));

// Globális változók (User, Page, BaseUrl)
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.page = req.path.split('/')[1] || 'home';
    
    // 4. EZT HASZNÁLJUK A VIEW-KBAN A LINKEKHEZ (<%= baseUrl %>)
    res.locals.baseUrl = BASE_URL; 
    
    next();
});

// Útvonalak betöltése
const webRoutes = require('./routes/web');

// 5. ROUTE-OK BEKÖTÉSE A PREFIX-SZEL
app.use(BASE_URL, webRoutes);

// Biztonsági átirányítás: Ha valaki a gyökérre téved, dobjuk a jó helyre
app.get('/', (req, res) => res.redirect(BASE_URL));

// Indítás és Adatbázis ellenőrzés
db.sequelize.sync({ alter: true }).then(async () => {
    console.log('✅ Adatbázis szinkronizálva.');


    app.listen(PORT, () => {
        console.log(`--------------------------------------------------`);
        console.log(`🚀 Szerver fut a Linux környezetben:`);
        console.log(`🔗 URL: http://143.47.98.96${BASE_URL}`);
        console.log(`🔌 Port: ${PORT}`);
        console.log(`--------------------------------------------------`);
    });
}).catch(err => console.error('Kritikus Hiba:', err));