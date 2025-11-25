const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const db = require('./models');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Config
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));

// Globális változók
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.page = req.path.split('/')[1] || 'home';
    next();
});

// Útvonalak betöltése (A routes/web.js-ből)
const webRoutes = require('./routes/web');
app.use('/', webRoutes);

// Indítás
db.sequelize.sync().then(() => {
    console.log('✅ Adatbázis szinkronizálva.');
    app.listen(PORT, () => console.log(`🚀 Szerver fut: http://localhost:${PORT}`));
}).catch(err => console.error('Hiba:', err));