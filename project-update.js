const fs = require('fs');
const path = require('path');

function write(relativePath, content) {
    const fullPath = path.join(__dirname, relativePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, content.trim());
    console.log(`✅ Frissítve: ${relativePath}`);
}

console.log('🚀 Rendszer javítása (Pilóta szűrők és változók)...');

// =============================================================================
// 1. SERVER.JS (Javított /pilots route)
// =============================================================================
const serverContent = `
const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const fs = require('fs');
const iconv = require('iconv-lite');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

// Modellek
const { sequelize, User, Pilot, GrandPrix, Result, PilotCurrent, ContactMessage } = require('./models');

// Kapcsolatok
Result.belongsTo(GrandPrix, { foreignKey: 'race_date', targetKey: 'race_date', constraints: false });
GrandPrix.hasMany(Result, { foreignKey: 'race_date', sourceKey: 'race_date', constraints: false });
Result.belongsTo(Pilot, { foreignKey: 'pilotaaz', targetKey: 'az', constraints: false });

// Config
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'f1_secret_key_2025', resave: false, saveUninitialized: false }));

// Middleware
app.use(async (req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.path = req.path;
    res.locals.query = req.query || {};
    next();
});

// Helpers
function parseDate(d) { try { const p=d.trim().split('.'); return p.length===3?\`\${p[0]}-\${p[1].padStart(2,'0')}-\${p[2].padStart(2,'0')}\`:null; } catch{return null;} }
function readTxt(f) { const p=path.join(__dirname,'data',f); return fs.existsSync(p)?iconv.decode(fs.readFileSync(p),'win1252').split(/\\r?\\n/).filter(l=>l.trim()):[]; }

// Seeder
async function seed() {
    if(await Pilot.count()>0) return;
    console.log('♻️  Adatbetöltés...');
    if(!await User.findOne({where:{email:'admin@f1tech.hu'}})) await User.create({name:'admin',email:'admin@f1tech.hu',password:await bcrypt.hash('admin',10),is_admin:true});
    
    const currentPilots = [
        {pilot_id:1001,name:'Max Verstappen',nationality:'holland',team:'Red Bull Racing'},
        {pilot_id:1002,name:'Yuki Tsunoda',nationality:'japán',team:'Red Bull Racing'},
        {pilot_id:1003,name:'Lewis Hamilton',nationality:'brit',team:'Ferrari'},
        {pilot_id:1004,name:'Charles Leclerc',nationality:'monacói',team:'Ferrari'},
        {pilot_id:1005,name:'George Russell',nationality:'brit',team:'Mercedes'},
        {pilot_id:1006,name:'Kimi Antonelli',nationality:'olasz',team:'Mercedes'},
        {pilot_id:1007,name:'Lando Norris',nationality:'brit',team:'McLaren'},
        {pilot_id:1008,name:'Oscar Piastri',nationality:'ausztrál',team:'McLaren'},
        {pilot_id:1009,name:'Fernando Alonso',nationality:'spanyol',team:'Aston Martin'},
        {pilot_id:1010,name:'Lance Stroll',nationality:'kanadai',team:'Aston Martin'},
        {pilot_id:1011,name:'Pierre Gasly',nationality:'francia',team:'Alpine'},
        {pilot_id:1012,name:'Jack Doohan',nationality:'ausztrál',team:'Alpine'},
        {pilot_id:1013,name:'Carlos Sainz Jr.',nationality:'spanyol',team:'Williams'},
        {pilot_id:1014,name:'Alex Albon',nationality:'thai',team:'Williams'},
        {pilot_id:1015,name:'Nico Hülkenberg',nationality:'német',team:'Kick Sauber'},
        {pilot_id:1016,name:'Gabriel Bortoleto',nationality:'brazil',team:'Kick Sauber'},
        {pilot_id:1017,name:'Oliver Bearman',nationality:'brit',team:'Haas'},
        {pilot_id:1018,name:'Esteban Ocon',nationality:'francia',team:'Haas'},
        {pilot_id:1019,name:'Isack Hadjar',nationality:'francia',team:'Racing Bulls'},
        {pilot_id:1020,name:'Liam Lawson',nationality:'új-zélandi',team:'Racing Bulls'}
    ];
    await PilotCurrent.bulkCreate(currentPilots,{ignoreDuplicates:true});

    const pl=readTxt('pilota.txt'); for(let i=1;i<pl.length;i++){const d=pl[i].split('\\t'); if(d.length>=5) await Pilot.create({az:d[0].trim(),name:d[1].trim(),gender:d[2].trim(),birth_date:parseDate(d[3]),nationality:d[4].trim()||null}).catch(()=>{});}
    const gl=readTxt('gp.txt'); for(let i=1;i<gl.length;i++){const d=gl[i].split('\\t'); if(d.length>=3){const pd=parseDate(d[0]); if(pd) await GrandPrix.create({race_date:pd,name:d[1].trim(),location:d[2].trim()}).catch(()=>{});}}
    const rl=readTxt('eredmeny.txt'); for(let i=1;i<rl.length;i++){const d=rl[i].split('\\t'); if(d.length>=7){const pid=parseInt(d[1].trim()); if(await Pilot.findByPk(pid)) await Result.create({race_date:parseDate(d[0])||d[0].trim().replace(/\\./g,'-'),pilotaaz:pid,position:d[2].trim()?parseInt(d[2]):null,issue:d[3].trim()||null,team:d[4].trim(),car_type:d[5].trim(),engine:d[6].trim()}).catch(()=>{});}}
    console.log('✅ Kész.');
}

// --- ROUTES ---

app.get('/', (req, res) => res.render('index'));

app.post('/login', async (req, res) => {
    try {
        const u = await User.findOne({where:{email:req.body.email}});
        if(u && await bcrypt.compare(req.body.password, u.password)) {
            req.session.user = u;
            return req.xhr ? res.json({success:true}) : res.redirect('/');
        }
        if(req.xhr) return res.status(401).json({success:false});
        res.send('<script>alert("Hibás adatok!");window.location="/"</script>');
    } catch(e) { res.status(500).send('Hiba'); }
});
app.post('/logout', (req, res) => req.session.destroy(()=>res.redirect('/')));

app.get('/register', (req, res) => res.render('auth/register',{errors:{},oldInput:{}}));
app.post('/register', async (req, res) => {
    const {name,email,password,password_confirmation}=req.body;
    if(password.length<8 || password!==password_confirmation) return res.render('auth/register',{errors:{general:'Jelszó hiba'},oldInput:req.body});
    try {
        const u = await User.create({name,email,password:await bcrypt.hash(password,10)});
        req.session.user = u; res.redirect('/');
    } catch(e) { res.render('auth/register',{errors:{general:'Email foglalt'},oldInput:req.body}); }
});

app.get('/settings/profile', (req, res) => req.session.user ? res.render('settings/profile',{user:req.session.user,errors:{},success:null}) : res.redirect('/'));
app.post('/settings/profile', async (req, res) => {
    if(!req.session.user) return res.redirect('/');
    try {
        await User.update({name:req.body.name,email:req.body.email},{where:{id:req.session.user.id}});
        req.session.user = await User.findByPk(req.session.user.id);
        res.render('settings/profile',{user:req.session.user,errors:{},success:'Kész'});
    } catch(e) { res.render('settings/profile',{user:req.session.user,errors:{general:'Hiba'},success:null}); }
});
app.post('/settings/profile/delete', async (req, res) => {
    const u = await User.findByPk(req.session.user.id);
    if(await bcrypt.compare(req.body.password, u.password)) { await u.destroy(); req.session.destroy(()=>res.redirect('/')); }
    else res.render('settings/profile',{user:req.session.user,errors:{delete:'Rossz jelszó'},success:null});
});

app.get('/settings/password', (req, res) => req.session.user ? res.render('settings/password',{errors:{},success:null}) : res.redirect('/'));
app.post('/settings/password', async (req, res) => {
    const u = await User.findByPk(req.session.user.id);
    if(!await bcrypt.compare(req.body.current_password, u.password)) return res.render('settings/password',{errors:{current_password:'Rossz jelszó'},success:null});
    await u.update({password:await bcrypt.hash(req.body.password,10)});
    res.render('settings/password',{errors:{},success:'Kész'});
});

// --- PILOTS CRUD (JAVÍTVA) ---
app.get('/pilots', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 15;
        const where = {};
        if (req.query.search) where.name = { [Op.like]: \`%\${req.query.search}%\` };
        if (req.query.nationality) where.nationality = req.query.nationality;

        const { count, rows } = await PilotCurrent.findAndCountAll({ 
            where, 
            limit, 
            offset: (page - 1) * limit, 
            order: [['name', 'ASC']] 
        });
        
        // Nemzetiségek lekérdezése
        const allNats = await PilotCurrent.findAll({ attributes: ['nationality'], group: ['nationality'] });
        const nationalities = allNats.map(p => p.nationality).filter(n => n).sort();

        // Render, MINDEN változó átadásával
        res.render('pilots/index', {
            pilots: rows,
            nationalities: nationalities, // Ez hiányzott vagy volt rossz helyen
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            queryParams: \`&search=\${req.query.search||''}&nationality=\${req.query.nationality||''}\`,
            query: req.query
        });
    } catch(e) {
        console.error(e);
        res.status(500).send('Hiba a pilóták betöltésekor: ' + e.message);
    }
});

app.get('/pilots/create', (req, res) => res.render('pilots/create',{errors:{},oldInput:{}}));
app.post('/pilots', async (req, res) => { try{ await PilotCurrent.create(req.body); res.redirect('/pilots'); } catch(e){res.render('pilots/create',{errors:{general:'Hiba'},oldInput:req.body});} });
app.get('/pilots/show/:id', async (req, res) => { const p=await PilotCurrent.findByPk(req.params.id); const r=await Result.findAll({where:{pilotaaz:req.params.id},include:[{model:GrandPrix}],order:[['race_date','DESC']]}); res.render('pilots/show',{pilot:p,results:r}); });
app.get('/pilots/edit/:id', async (req, res) => { const p=await PilotCurrent.findByPk(req.params.id); res.render('pilots/edit',{pilot:p,errors:{},oldInput:{}}); });
app.post('/pilots/edit/:id', async (req, res) => { await PilotCurrent.update(req.body,{where:{pilot_id:req.params.id}}); res.redirect('/pilots'); });
app.post('/pilots/delete/:id', async (req, res) => { if(await Result.count({where:{pilotaaz:req.params.id}})>0) return res.send('<script>alert("Van eredménye!");window.location="/pilots"</script>'); await PilotCurrent.destroy({where:{pilot_id:req.params.id}}); res.redirect('/pilots'); });

app.get('/database', async (req, res) => {
    const {search,nationality,year,location} = req.query;
    const pw={}; if(search) pw.name={[Op.like]:\`%\${search}%\`}; if(nationality) pw.nationality=nationality;
    const gw={}; if(location) gw.location={[Op.like]:\`%\${location}%\`}; if(year) gw.race_date={[Op.startsWith]:year};
    
    const pilots = await Pilot.findAll({where:pw,order:[['name','ASC']]});
    const gps = await GrandPrix.findAll({where:gw,order:[['race_date','ASC']]});
    const nats = (await Pilot.findAll({attributes:['nationality'],group:['nationality']})).map(p=>p.nationality).sort();
    const years = [...new Set((await GrandPrix.findAll({attributes:['race_date']})).map(g=>new Date(g.race_date).getFullYear()))].sort((a,b)=>b-a);
    
    res.render('database',{pilots,grandPrix:gps,nationalities:nats,years,query:req.query});
});

app.get('/diagrams', async (req, res) => {
    const {team,year}=req.query;
    const dw={issue:{[Op.and]:[{[Op.ne]:null},{[Op.ne]:''}]}};
    if(team) dw.team=team; if(year) dw.race_date={[Op.startsWith]:year};
    
    const dr = await Result.findAll({where:dw,order:[['race_date','DESC']]});
    const dc={}; dr.forEach(r=>dc[r.team]=(dc[r.team]||0)+1);
    
    const allGPs = await GrandPrix.findAll();
    const lc={}; allGPs.forEach(g=>lc[g.location]=(lc[g.location]||0)+1);
    
    const teams = (await Result.findAll({attributes:['team'],group:['team']})).map(t=>t.team).sort();
    const years = [...new Set((await GrandPrix.findAll({attributes:['race_date']})).map(g=>new Date(g.race_date).getFullYear()))].sort((a,b)=>b-a);
    
    res.render('diagrams',{
        dnfData:{teams:Object.keys(dc).sort(),teamDNFCounts:dc,detailedData:dr,isFiltered:!!(team||year)},
        locationData:{locations:Object.keys(lc).sort((a,b)=>lc[b]-lc[a]),raceCounts:Object.keys(lc).sort((a,b)=>lc[b]-lc[a]).map(l=>lc[l])},
        teams,years,selectedTeam:team||'',selectedYear:year||''
    });
});

app.get('/contact', (req, res) => res.render('contact',{errors:{},oldInput:{}}));
app.post('/contact', async (req, res) => { await ContactMessage.create({...req.body,newsletter:!!req.body.newsletter}); res.render('contact',{success:'Kész',errors:{},oldInput:{}}); });

app.get('/admin/contact-messages', async (req, res) => {
    if(!req.session.user?.is_admin) return res.redirect('/');
    const m=await ContactMessage.findAll({order:[['created_at','DESC']]});
    res.render('admin/contact_messages',{messages:m,stats:{total:m.length,read:m.filter(x=>x.is_read).length,unread:m.filter(x=>!x.is_read).length},activePage:'messages'});
});
app.post('/admin/contact-messages/:id/mark-read', async (req,res) => { await ContactMessage.update({is_read:true},{where:{id:req.params.id}}); res.redirect('back'); });
app.post('/admin/contact-messages/:id/delete', async (req,res) => { await ContactMessage.destroy({where:{id:req.params.id}}); res.redirect('back'); });

app.get('/admin/registered-users', async (req, res) => {
    if(!req.session.user?.is_admin) return res.redirect('/');
    const page=parseInt(req.query.page)||1;
    const {count,rows}=await User.findAndCountAll({order:[['created_at','DESC']],limit:15,offset:(page-1)*15});
    res.render('admin/registered_users',{users:rows,stats:{total:await User.count(),verified:0},activePage:'users',currentPage:page,totalPages:Math.ceil(count/15)});
});

async function start() {
    await sequelize.authenticate(); await sequelize.sync({alter:true}); await seed();
    app.listen(3000,()=>console.log('🚀 Fut: http://localhost:3000'));
}
start();
`;
write('server.js', serverContent);

// =============================================================================
// 2. PILOTS INDEX VIEW (Javított: biztonsági ellenőrzés)
// =============================================================================
const pilotIndex = `
<%- include('../partials/layout-header', { title: 'Pilóták Kezelése' }) %>
<% 
    // BIZTONSÁGI VÁLTOZÓK (Ha véletlenül nem jönnének a szervertől)
    const q = (typeof query !== 'undefined') ? query : {}; 
    const nats = (typeof nationalities !== 'undefined') ? nationalities : [];
%>
<div class="content-section">
    <div class="container">
        <div class="hero-section"><h1 class="hero-title">Jelenlegi Pilóták</h1></div>
        <div class="text-end mb-3"><a href="/pilots/create" class="btn btn-f1">Új Pilóta +</a></div>
        <div class="card-f1">
            <form class="d-flex gap-2 mb-3" method="GET">
                <input name="search" class="form-control w-auto" placeholder="Keresés..." value="<%= q.search || '' %>">
                <select name="nationality" class="form-control w-auto">
                    <option value="">Minden</option>
                    <% nats.forEach(n=>{ %>
                        <option value="<%= n %>" <%= q.nationality==n?'selected':'' %>><%= n %></option>
                    <% }) %>
                </select>
                <button class="btn btn-f1">Szűr</button>
            </form>
            <table class="table table-f1">
                <thead><tr><th>Név</th><th>Csapat</th><th>Művelet</th></tr></thead>
                <tbody>
                    <% pilots.forEach(p => { %>
                        <tr>
                            <td><strong><%= p.name %></strong></td>
                            <td><%= p.team || '-' %></td>
                            <td>
                                <a href="/pilots/show/<%= p.pilot_id %>" class="btn btn-sm btn-info text-white">Info</a>
                                <a href="/pilots/edit/<%= p.pilot_id %>" class="btn btn-sm btn-warning">Szerk</a>
                                <form action="/pilots/delete/<%= p.pilot_id %>" method="POST" style="display:inline" onsubmit="return confirm('Biztos?')">
                                    <button class="btn btn-sm btn-danger">Töröl</button>
                                </form>
                            </td>
                        </tr>
                    <% }) %>
                </tbody>
            </table>
            <%- include('../partials/pagination', {currentPage, totalPages, queryParams}) %>
        </div>
    </div>
</div>
<%- include('../partials/layout-footer') %>
`;
write('views/pilots/index.ejs', pilotIndex);

console.log('✨ Minden kész! Indíthatod a szervert.');