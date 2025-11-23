const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const fs = require('fs');
const iconv = require('iconv-lite'); 
const bcrypt = require('bcrypt');

// Modellek importálása
const { sequelize, User, Pilot, GrandPrix, Result, PilotCurrent, ContactMessage } = require('./models');

// --- APP KONFIGURÁCIÓ ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'titkos_kulcs_f1', resave: false, saveUninitialized: false }));

// --- SEGÉDFÜGGVÉNYEK ADATBETÖLTÉSHEZ ---
function parseDate(dateStr) {
    if (!dateStr) return null;
    try {
        const parts = dateStr.trim().split('.');
        if (parts.length !== 3) return null;
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    } catch (e) { return null; }
}

function readEncodedFile(filename) {
    const filePath = path.join(__dirname, 'data', filename);
    if (!fs.existsSync(filePath)) return [];
    const buffer = fs.readFileSync(filePath);
    const content = iconv.decode(buffer, 'win1252');
    return content.split(/\r?\n/).filter(line => line.trim() !== '');
}

function fixMojibake(text) {
    const charMap = {
        'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í', 'Ã³': 'ó', 'Ãµ': 'ő', 'Ã¶': 'ö', 'Ãº': 'ú', 'Å±': 'ű', 'Ã¼': 'ü',
        'Ã': 'Á', 'Ã‰': 'É', 'ÃŽ': 'Í', 'Ã"': 'Ó', 'Å': 'Ő', 'Ã–': 'Ö', 'Ãš': 'Ú', 'Å°': 'Ű', 'Ãœ': 'Ü',
        'NÃ©metorszÃ¡g': 'Németország', 'MagyarorszÃ¡g': 'Magyarország'
    };
    let fixed = text;
    for (const [bad, good] of Object.entries(charMap)) {
        fixed = fixed.split(bad).join(good);
    }
    return fixed;
}

// --- AUTOMATIKUS SEEDER ---
async function seedDatabaseIfNeeded() {
    try {
        const count = await Pilot.count();
        if (count > 0) return; 

        console.log('♻️  Adatbázis üres. Automatikus feltöltés indítása...');

        const adminExists = await User.findOne({ where: { email: 'admin@f1tech.hu' } });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin', 10);
            await User.create({ name: 'admin', email: 'admin@f1tech.hu', password: hashedPassword, is_admin: true, email_verified_at: new Date() });
            console.log('👤 Admin létrehozva.');
        }

        const currentPilotsData = [
            { pilot_id: 1001, name: 'Max Verstappen', nationality: 'holland', team: 'Red Bull Racing' },
            { pilot_id: 1002, name: 'Yuki Tsunoda', nationality: 'japán', team: 'Red Bull Racing' },
            { pilot_id: 1003, name: 'Lewis Hamilton', nationality: 'brit', team: 'Ferrari' },
            { pilot_id: 1004, name: 'Charles Leclerc', nationality: 'monacói', team: 'Ferrari' },
            { pilot_id: 1005, name: 'George Russell', nationality: 'brit', team: 'Mercedes' },
            { pilot_id: 1006, name: 'Kimi Antonelli', nationality: 'olasz', team: 'Mercedes' },
            { pilot_id: 1007, name: 'Lando Norris', nationality: 'brit', team: 'McLaren' },
            { pilot_id: 1008, name: 'Oscar Piastri', nationality: 'ausztrál', team: 'McLaren' },
            { pilot_id: 1009, name: 'Fernando Alonso', nationality: 'spanyol', team: 'Aston Martin' },
            { pilot_id: 1010, name: 'Lance Stroll', nationality: 'kanadai', team: 'Aston Martin' },
            { pilot_id: 1011, name: 'Pierre Gasly', nationality: 'francia', team: 'Alpine' },
            { pilot_id: 1012, name: 'Jack Doohan', nationality: 'ausztrál', team: 'Alpine' },
            { pilot_id: 1013, name: 'Carlos Sainz Jr.', nationality: 'spanyol', team: 'Williams' },
            { pilot_id: 1014, name: 'Alex Albon', nationality: 'thai', team: 'Williams' },
            { pilot_id: 1015, name: 'Nico Hülkenberg', nationality: 'német', team: 'Kick Sauber' },
            { pilot_id: 1016, name: 'Gabriel Bortoleto', nationality: 'brazil', team: 'Kick Sauber' },
            { pilot_id: 1017, name: 'Oliver Bearman', nationality: 'brit', team: 'Haas' },
            { pilot_id: 1018, name: 'Esteban Ocon', nationality: 'francia', team: 'Haas' },
            { pilot_id: 1019, name: 'Isack Hadjar', nationality: 'francia', team: 'Racing Bulls' },
            { pilot_id: 1020, name: 'Liam Lawson', nationality: 'új-zélandi', team: 'Racing Bulls' },
        ];
        await PilotCurrent.bulkCreate(currentPilotsData, { ignoreDuplicates: true });

        const pilotLines = readEncodedFile('pilota.txt');
        for (let i = 1; i < pilotLines.length; i++) {
            const data = pilotLines[i].split('\t');
            if (data.length >= 5) {
                await Pilot.create({
                    az: data[0].trim(), name: data[1].trim(), gender: data[2].trim(),
                    birth_date: parseDate(data[3]), nationality: data[4].trim() || null
                });
            }
        }

        const gpLines = readEncodedFile('gp.txt');
        for (let i = 1; i < gpLines.length; i++) {
            let line = gpLines[i];
            if (line.includes('Ã')) line = fixMojibake(line);
            const data = line.split('\t');
            if (data.length >= 3) {
                const pd = parseDate(data[0]);
                if (pd) await GrandPrix.create({ race_date: pd, name: data[1].trim(), location: data[2].trim() });
            }
        }

        const resultLines = readEncodedFile('eredmeny.txt');
        for (let i = 1; i < resultLines.length; i++) {
            const data = resultLines[i].split('\t');
            if (data.length >= 7) {
                const pid = parseInt(data[1].trim());
                if (await Pilot.findByPk(pid)) {
                    await Result.create({
                        race_date: parseDate(data[0]) || data[0].trim().replace(/\./g, '-'),
                        pilotaaz: pid, position: data[2].trim() ? parseInt(data[2]) : null,
                        issue: data[3].trim() || null, team: data[4].trim(), car_type: data[5].trim(), engine: data[6].trim()
                    });
                }
            }
        }
        console.log('✅ Adatok betöltve.');
    } catch (error) { console.error('❌ Hiba:', error); }
}

// ==========================================
// ÚTVONALAK (ROUTES)
// ==========================================

// 1. Főoldal (Dashboard)
app.get('/', async (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; padding: 40px; text-align: center;">
            <h1>🏎️ F1 Node.js Rendszer</h1>
            <p style="color: green; font-weight: bold;">✅ Szerver aktív.</p>
            <hr>
            <div style="margin-top: 30px;">
                <a href="/register" style="display: inline-block; padding: 15px 30px; background: #e10600; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px;">
                    📝 Regisztráció
                </a>
                <a href="/admin/contact-messages" style="display: inline-block; padding: 15px 30px; background: #333; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px;">
                    ✉️ Admin / Üzenetek
                </a>
                <a href="/admin/registered-users" style="display: inline-block; padding: 15px 30px; background: #333; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px;">
                    👥 Admin / Felhasználók
                </a>
            </div>
        </div>
    `);
});

// 2. AUTHENTIKÁCIÓ (Regisztráció)
app.get('/register', (req, res) => {
    res.render('auth/register', { errors: {}, oldInput: {} });
});

app.post('/register', async (req, res) => {
    const { name, email, password, password_confirmation } = req.body;
    let errors = {};

    // Validáció
    if (!name || name.trim() === '') errors.name = 'A név megadása kötelező.';
    if (!email || !email.includes('@')) errors.email = 'Érvényes email cím szükséges.';
    if (!password || password.length < 8) errors.password = 'A jelszó legalább 8 karakter legyen.';
    if (password !== password_confirmation) errors.password = 'A jelszavak nem egyeznek.';

    // Email ellenőrzés DB-ben
    const existingUser = await User.findOne({ where: { email: email } });
    if (existingUser) errors.email = 'Ez az email cím már foglalt.';

    if (Object.keys(errors).length > 0) {
        return res.render('auth/register', { errors: errors, oldInput: req.body });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            name: name,
            email: email,
            password: hashedPassword,
            is_admin: false
        });
        
        // Sikeres regisztráció -> irány a Login (egyelőre főoldal, mert nincs login oldal)
        res.redirect('/?registered=true');
    } catch (error) {
        console.error(error);
        res.render('auth/register', { 
            errors: { general: 'Hiba történt a regisztráció során.' }, 
            oldInput: req.body 
        });
    }
});

// Login placeholder (hogy ne legyen 404 a linkre kattintva)
app.get('/login', (req, res) => {
    res.send('<h1>Login oldal</h1><p>(Még nincs implementálva, de a Regisztráció kész!)</p><a href="/">Vissza</a>');
});

// 3. ADMIN: Üzenetek
app.get('/admin/contact-messages', async (req, res) => {
    try {
        const messages = await ContactMessage.findAll({ order: [['created_at', 'DESC']] });
        const stats = {
            total: messages.length,
            read: messages.filter(m => m.is_read).length,
            unread: messages.filter(m => !m.is_read).length
        };
        res.render('admin/contact_messages', { messages: messages, stats: stats });
    } catch (error) { res.status(500).send('Hiba.'); }
});

app.post('/admin/contact-messages/:id/mark-read', async (req, res) => {
    try {
        await ContactMessage.update({ is_read: true }, { where: { id: req.params.id } });
        res.redirect('/admin/contact-messages');
    } catch (error) { res.status(500).send('Hiba.'); }
});

app.post('/admin/contact-messages/:id/delete', async (req, res) => {
    try {
        await ContactMessage.destroy({ where: { id: req.params.id } });
        res.redirect('/admin/contact-messages');
    } catch (error) { res.status(500).send('Hiba.'); }
});

// 4. ADMIN: Felhasználók
app.get('/admin/registered-users', async (req, res) => {
    try {
        const users = await User.findAll({ order: [['created_at', 'DESC']] });
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const stats = {
            total: users.length,
            verified: users.filter(u => u.email_verified_at !== null).length,
            today: users.filter(u => new Date(u.created_at) >= today).length
        };
        res.render('admin/registered_users', { users: users, stats: stats });
    } catch (error) { res.status(500).send('Hiba.'); }
});

// --- SZERVER INDÍTÁSA ---
const PORT = 3000;
async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('✅ Adatbázis OK.');
        await sequelize.sync({ alter: true });
        await seedDatabaseIfNeeded();
        app.listen(PORT, () => { console.log(`🚀 SZERVER FUT: http://localhost:${PORT}`); });
    } catch (error) { console.error('❌ Hiba:', error); }
}

startServer();