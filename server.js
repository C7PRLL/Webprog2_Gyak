const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const fs = require('fs');
const iconv = require('iconv-lite');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

const { sequelize, User, Pilot, GrandPrix, Result, PilotCurrent, ContactMessage } = require('./models');

// --- JAVÍTOTT KAPCSOLATOK ---
Result.belongsTo(GrandPrix, { foreignKey: 'race_date', targetKey: 'race_date', constraints: false });
GrandPrix.hasMany(Result, { foreignKey: 'race_date', sourceKey: 'race_date', constraints: false });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'titkos_kulcs_f1_2025', resave: false, saveUninitialized: false }));

app.use(async (req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.path = req.path;
    next();
});

// --- SEGÉDFÜGGVÉNYEK ---
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
    const charMap = { 'Ã¡':'á', 'Ã©':'é', 'Ã­':'í', 'Ã³':'ó', 'Ãµ':'ő', 'Ã¶':'ö', 'Ãº':'ú', 'Å±':'ű', 'Ã¼':'ü', 'Ã':'Á', 'Ã‰':'É', 'ÃŽ':'Í', 'Ã"':'Ó', 'Å':'Ő', 'Ã–':'Ö', 'Ãš':'Ú', 'Å°':'Ű', 'Ãœ':'Ü' };
    let fixed = text;
    for (const [bad, good] of Object.entries(charMap)) fixed = fixed.split(bad).join(good);
    return fixed;
}

// --- SEEDER ---
async function seedDatabaseIfNeeded() {
    try {
        const count = await Pilot.count();
        if (count > 0) return; 
        console.log('♻️  Adatbázis üres. Automatikus feltöltés...');

        const adminExists = await User.findOne({ where: { email: 'admin@f1tech.hu' } });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin', 10);
            await User.create({ name: 'admin', email: 'admin@f1tech.hu', password: hashedPassword, is_admin: true, email_verified_at: new Date() });
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
            if (data.length >= 5) await Pilot.create({ az: data[0].trim(), name: data[1].trim(), gender: data[2].trim(), birth_date: parseDate(data[3]), nationality: data[4].trim() || null });
        }
        const gpLines = readEncodedFile('gp.txt');
        for (let i = 1; i < gpLines.length; i++) {
            let line = gpLines[i]; if (line.includes('Ã')) line = fixMojibake(line); const data = line.split('\t');
            if (data.length >= 3) { const pd = parseDate(data[0]); if (pd) await GrandPrix.create({ race_date: pd, name: data[1].trim(), location: data[2].trim() }); }
        }
        const resultLines = readEncodedFile('eredmeny.txt');
        for (let i = 1; i < resultLines.length; i++) {
            const data = resultLines[i].split('\t');
            if (data.length >= 7) { const pid = parseInt(data[1].trim()); if (await Pilot.findByPk(pid)) await Result.create({ race_date: parseDate(data[0]) || data[0].trim().replace(/\./g, '-'), pilotaaz: pid, position: data[2].trim() ? parseInt(data[2]) : null, issue: data[3].trim() || null, team: data[4].trim(), car_type: data[5].trim(), engine: data[6].trim() }); }
        }
        console.log('✅ Adatbetöltés kész.');
    } catch (error) { console.error('❌ Hiba:', error); }
}

// --- ÚTVONALAK ---

app.get('/', (req, res) => res.render('index', { title: 'Főoldal' }));

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.user = user;
            if (req.xhr) return res.json({ success: true });
            return res.redirect('/');
        }
        if (req.xhr) return res.status(401).json({ success: false });
        res.send('<script>alert("Helytelen adatok!"); window.location.href="/";</script>');
    } catch (e) { res.status(500).json({ success: false }); }
});

app.post('/logout', (req, res) => { req.session.destroy(() => res.redirect('/')); });

app.get('/register', (req, res) => res.render('auth/register', { errors: {}, oldInput: {} }));
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashed = await bcrypt.hash(password, 10);
        await User.create({ name, email, password: hashed });
        res.redirect('/');
    } catch (e) { res.render('auth/register', { errors: { general: 'Hiba' }, oldInput: req.body }); }
});

// --- PILÓTÁK LISTÁZÁSA (LAPOZÁSSAL) ---
app.get('/pilots', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10; // 10 pilóta per oldal
        const offset = (page - 1) * limit;

        const { count, rows: pilots } = await PilotCurrent.findAndCountAll({
            order: [['name', 'ASC']],
            limit: limit,
            offset: offset
        });

        const totalPages = Math.ceil(count / limit);

        res.render('pilots/index', { 
            pilots, 
            currentPage: page, 
            totalPages: totalPages,
            totalItems: count
        });
    } catch (e) { res.status(500).send('Hiba: ' + e.message); }
});

app.get('/pilots/show/:id', async (req, res) => {
    try {
        const pilot = await PilotCurrent.findByPk(req.params.id);
        if(!pilot) return res.status(404).send('Nincs ilyen pilóta.');
        const results = await Result.findAll({
            where: { pilotaaz: req.params.id },
            include: [{ model: GrandPrix }],
            order: [['race_date', 'DESC']]
        });
        res.render('pilots/show', { pilot, results });
    } catch (e) { res.status(500).send('Hiba'); }
});

app.get('/pilots/create', (req, res) => res.render('pilots/create', { errors: {}, oldInput: {} }));
app.post('/pilots', async (req, res) => {
    try {
        await PilotCurrent.create(req.body);
        res.redirect('/pilots');
    } catch (e) { res.render('pilots/create', { errors: {general: 'Hiba'}, oldInput: req.body }); }
});

app.get('/pilots/edit/:id', async (req, res) => {
    const pilot = await PilotCurrent.findByPk(req.params.id);
    res.render('pilots/edit', { pilot, errors: {}, oldInput: {} });
});
app.post('/pilots/edit/:id', async (req, res) => {
    await PilotCurrent.update(req.body, { where: { pilot_id: req.params.id } });
    res.redirect('/pilots');
});
app.post('/pilots/delete/:id', async (req, res) => {
    await PilotCurrent.destroy({ where: { pilot_id: req.params.id } });
    res.redirect('/pilots');
});

// --- EGYÉB OLDALAK ---
app.get('/database', async (req, res) => {
    try {
        const { search, nationality, year, location } = req.query;
        const pilotWhere = {}; if(search) pilotWhere.name = {[Op.like]:`%${search}%`}; if(nationality) pilotWhere.nationality=nationality;
        const gpWhere = {}; if(location) gpWhere.location = {[Op.like]:`%${location}%`}; if(year) gpWhere.race_date = {[Op.startsWith]:year};
        
        const pilots = await Pilot.findAll({ where: pilotWhere, order: [['name', 'ASC']] });
        const grandPrix = await GrandPrix.findAll({ where: gpWhere, order: [['race_date', 'ASC']] });
        
        const allPilots = await Pilot.findAll({ attributes: ['nationality'] });
        const nationalities = [...new Set(allPilots.map(p => p.nationality).filter(n => n))].sort();
        const allGPs = await GrandPrix.findAll({ attributes: ['race_date'] });
        const years = [...new Set(allGPs.map(gp => new Date(gp.race_date).getFullYear()))].sort((a, b) => b - a);

        res.render('database', { pilots, grandPrix, nationalities, years, query: req.query });
    } catch (e) { res.status(500).send('Hiba: ' + e.message); }
});

app.get('/diagrams', async (req, res) => {
    try {
        const { team, year } = req.query;
        const dnfWhere = { issue: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: '' }] } };
        if (team) dnfWhere.team = team; if (year) dnfWhere.race_date = { [Op.startsWith]: year };
        
        const dnfResults = await Result.findAll({ where: dnfWhere, order: [['race_date', 'DESC']] });
        const teamDNFCounts = {}; dnfResults.forEach(r => { teamDNFCounts[r.team] = (teamDNFCounts[r.team] || 0) + 1; });
        
        const allGPs = await GrandPrix.findAll();
        const locCounts = {}; 
        allGPs.forEach(gp => { locCounts[gp.location] = (locCounts[gp.location] || 0) + 1; });
        const sortedLocs = Object.keys(locCounts).sort((a, b) => locCounts[b] - locCounts[a]);
        
        const allTeamsRaw = await Result.findAll({ attributes: ['team'], group: ['team'] });
        const allYearsRaw = await GrandPrix.findAll({ attributes: ['race_date'] });
        
        res.render('diagrams', { 
            dnfData: { teams: Object.keys(teamDNFCounts).sort(), teamDNFCounts, detailedData: dnfResults, isFiltered: !!(team || year) },
            locationData: { locations: sortedLocs, raceCounts: sortedLocs.map(l => locCounts[l]), details: [] },
            teams: allTeamsRaw.map(t => t.team).sort(), 
            years: [...new Set(allYearsRaw.map(gp => new Date(gp.race_date).getFullYear()))].sort((a, b) => b - a),
            selectedTeam: team || '', selectedYear: year || '' 
        });
    } catch (e) { res.status(500).send('Hiba'); }
});

app.get('/admin/contact-messages', async (req, res) => {
    const messages = await ContactMessage.findAll({ order: [['created_at', 'DESC']] });
    const stats = { total: messages.length, read: messages.filter(m => m.is_read).length, unread: messages.filter(m => !m.is_read).length };
    res.render('admin/contact_messages', { messages, stats, activePage: 'messages' });
});
app.get('/admin/registered-users', async (req, res) => {
    const users = await User.findAll({ order: [['created_at', 'DESC']] });
    const stats = { total: users.length, verified: users.filter(u => u.email_verified_at).length, today: 0 };
    res.render('admin/registered_users', { users, stats, activePage: 'users' });
});
app.get('/contact', (req, res) => res.send('Kapcsolat (WIP) <a href="/">Vissza</a>'));

// INDÍTÁS
const PORT = 3000;
async function startServer() {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });
        await seedDatabaseIfNeeded();
        app.listen(PORT, () => console.log(`🚀 SZERVER FUT: http://localhost:${PORT}`));
    } catch (error) { console.error('❌ HIBA:', error); }
}
startServer();