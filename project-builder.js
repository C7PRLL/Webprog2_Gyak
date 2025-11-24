const fs = require('fs');
const path = require('path');

// Segédfüggvény fájlok írásához
function write(relativePath, content) {
    const fullPath = path.join(__dirname, relativePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, content.trim());
    console.log(`✅ Létrehozva: ${relativePath}`);
}

console.log('🚀 Projekt építése folyamatban...');

// ==============================================
// 1. CSS STÍLUSOK (f1-styles.css)
// ==============================================
const cssContent = `
/* F1 Tech Solutions - Generált Stíluslap */
:root {
    --f1-red: #e10600;
    --f1-dark: #15151e;
    --f1-dark-gray: #38383f;
    --f1-light-gray: #f3f3f3;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f8f9fa;
    margin: 0;
    padding: 0;
}

/* --- HERO SECTIONS --- */
.hero-section {
    background: linear-gradient(135deg, var(--f1-dark) 0%, #2c3e50 100%);
    color: white;
    padding: 60px 0;
    text-align: center;
    margin-bottom: 30px;
    border-radius: 0 0 20px 20px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}

.hero-title {
    font-size: 2.8rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 10px;
    color: white;
}

.hero-title strong { color: var(--f1-red); }

/* --- KÁRTYÁK --- */
.card-f1 {
    background: white;
    border-radius: 12px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.08);
    padding: 25px;
    margin-bottom: 20px;
    border-top: 4px solid var(--f1-red);
    transition: transform 0.3s ease;
}

.card-f1:hover { transform: translateY(-2px); }

/* --- GOMBOK --- */
.btn-f1 {
    background-color: var(--f1-red);
    color: white;
    padding: 10px 25px;
    border-radius: 25px;
    font-weight: bold;
    border: none;
    text-transform: uppercase;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-block;
}

.btn-f1:hover {
    background-color: #b30000;
    color: white;
    box-shadow: 0 4px 10px rgba(225, 6, 0, 0.4);
}

.btn-outline-f1 {
    border: 2px solid var(--f1-red);
    color: var(--f1-red);
    background: transparent;
    padding: 8px 20px;
    border-radius: 25px;
    font-weight: bold;
    text-decoration: none;
    display: inline-block;
}

.btn-outline-f1:hover {
    background-color: var(--f1-red);
    color: white;
}

/* --- TÁBLÁZATOK --- */
.table-f1 { width: 100%; border-collapse: separate; border-spacing: 0 5px; }
.table-f1 thead th { background-color: var(--f1-dark); color: white; padding: 15px; border: none; }
.table-f1 tbody tr { background-color: white; box-shadow: 0 2px 5px rgba(0,0,0,0.05); transition: transform 0.2s; }
.table-f1 tbody tr:hover { transform: scale(1.01); z-index: 10; position: relative; }
.table-f1 td { padding: 15px; vertical-align: middle; border-top: 1px solid #eee; }

/* --- BADGES --- */
.pilot-id-badge { background-color: var(--f1-dark); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; }
.team-badge { background-color: #eee; color: #333; padding: 4px 10px; border-radius: 15px; font-size: 0.9em; font-weight: 600; }

/* --- NAVIGÁCIÓ --- */
#header { background: var(--f1-dark); padding: 15px 0; color: white; }
#header nav ul { list-style: none; padding: 0; margin: 0; display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }
#header nav a { color: rgba(255,255,255,0.7); text-decoration: none; font-weight: 500; transition: color 0.3s; }
#header nav a:hover, #header nav a.active { color: var(--f1-red); }
.logo { text-align: center; margin-bottom: 15px; }

/* --- ÜZENETEK --- */
.alert-f1 { border-radius: 8px; padding: 15px; border-left: 5px solid; }
.alert-success { border-color: #28a745; background-color: #d4edda; color: #155724; }
.alert-danger { border-color: #dc3545; background-color: #f8d7da; color: #721c24; }

/* --- WELCOME PAGE SPECIFICS --- */
.white-content-wrapper { background: white; padding-bottom: 50px; }
.welcome-logo-container { text-align: center; padding: 40px 0; background: #f4f4f4; }
.welcome-logo { max-width: 150px; }
.content-section { padding: 40px 20px; max-width: 1200px; margin: 0 auto; }
.welcome-subtitle { font-size: 1.1rem; line-height: 1.6; color: #444; text-align: center; max-width: 900px; margin: 0 auto 40px; }
.red-title { color: var(--f1-red); font-size: 1.5rem; }
.full-width-image img { width: 100%; height: auto; border-radius: 10px; margin: 30px 0; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
.content-with-image { display: flex; align-items: center; gap: 40px; margin: 60px 0; flex-wrap: wrap; }
.content-text { flex: 1; min-width: 300px; }
.content-image { flex: 1; min-width: 300px; }
.content-image img { width: 100%; border-radius: 15px; box-shadow: -10px 10px 0 var(--f1-red); }
.welcome-features { background: var(--f1-dark); padding: 60px 0; color: white; }
.features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.feature-card { background: rgba(255,255,255,0.1); padding: 30px; border-radius: 10px; text-align: center; transition: background 0.3s; }
.feature-card:hover { background: rgba(255,255,255,0.15); }
.feature-title { color: var(--f1-red); font-size: 1.4rem; margin-bottom: 15px; }
.feature-link { color: white; text-decoration: none; font-weight: bold; border-bottom: 2px solid var(--f1-red); padding-bottom: 2px; }

/* --- INPUTS --- */
.form-control { border: 1px solid #ddd; padding: 10px; border-radius: 8px; width: 100%; }
.form-control:focus { border-color: var(--f1-red); outline: none; box-shadow: 0 0 0 3px rgba(225, 6, 0, 0.1); }

/* --- ADMIN --- */
.admin-nav .btn-group { display: flex; gap: 10px; margin-bottom: 20px; }
`;

write('public/css/f1-styles.css', cssContent);

// ==============================================
// 2. PARTIALS (Layout, Header, Footer, Pagination)
// ==============================================

const layoutHeader = `
<!DOCTYPE HTML>
<html lang="hu">
<head>
    <title><%= typeof title !== 'undefined' ? title : 'F1 Tech Solutions' %></title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link href="/css/f1-styles.css" rel="stylesheet">
</head>
<body class="is-preload">
    <header id="header">
        <div class="container">
            <div class="logo mb-3">
                <% if (!user) { %>
                    <form method="POST" action="/login" class="d-flex justify-content-center gap-2" id="headerLoginForm">
                        <input type="email" name="email" placeholder="Email" required class="form-control form-control-sm w-auto">
                        <input type="password" name="password" placeholder="Jelszó" required class="form-control form-control-sm w-auto">
                        <button type="submit" class="btn btn-sm btn-f1">Belépés</button>
                    </form>
                <% } else { %>
                    <div class="user-info-display text-center">
                        Üdv, <strong><%= user.name %></strong>! 
                        <form method="POST" action="/logout" style="display:inline;">
                            <button type="submit" class="btn btn-sm btn-outline-light border-0">(Kilépés)</button>
                        </form>
                    </div>
                <% } %>
            </div>
            <nav>
                <ul>
                    <li><a href="/" class="<%= path === '/' ? 'active' : '' %>">Főoldal</a></li>
                    <li><a href="/pilots" class="<%= path && path.startsWith('/pilots') ? 'active' : '' %>">Jelenlegi pilóták</a></li>
                    <li><a href="/diagrams" class="<%= path === '/diagrams' ? 'active' : '' %>">Diagramok</a></li>
                    <li><a href="/database" class="<%= path === '/database' ? 'active' : '' %>">Bajnokok Csarnoka</a></li>
                    <li><a href="/contact" class="<%= path === '/contact' ? 'active' : '' %>">Kapcsolat</a></li>
                    <% if (user && user.is_admin) { %>
                        <li><a href="/admin/contact-messages" class="<%= path && path.startsWith('/admin') ? 'active' : '' %>">🛡️ Admin</a></li>
                    <% } %>
                </ul>
            </nav>
        </div>
    </header>
    <main id="main">
`;

const layoutFooter = `
    </main>
    <footer id="footer" class="py-4 mt-5 text-center" style="background: #111; color: #777;">
        <div class="container">
            <p>&copy; 2025 F1 Akadémia. All rights reserved.</p>
            <p><small>Powered by Node.js & Express</small></p>
        </div>
    </footer>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Egyszerű header login kezelés (ha van hiba, alert)
        const urlParams = new URLSearchParams(window.location.search);
        if(urlParams.has('login_error')) alert('Helytelen email vagy jelszó!');
    </script>
</body>
</html>
`;

const pagination = `
<% 
    const curr = typeof currentPage !== 'undefined' ? currentPage : 1;
    const total = typeof totalPages !== 'undefined' ? totalPages : 1;
    if (total > 1) { 
%>
    <nav class="mt-4">
        <ul class="pagination justify-content-center">
            <li class="page-item <%= curr === 1 ? 'disabled' : '' %>">
                <a class="page-link" href="?page=<%= curr - 1 %>">&laquo; Előző</a>
            </li>
            <% for(let i = 1; i <= total; i++) { %>
                <li class="page-item <%= curr === i ? 'active' : '' %>">
                    <a class="page-link" href="?page=<%= i %>"><%= i %></a>
                </li>
            <% } %>
            <li class="page-item <%= curr === total ? 'disabled' : '' %>">
                <a class="page-link" href="?page=<%= curr + 1 %>">Következő &raquo;</a>
            </li>
        </ul>
    </nav>
<% } %>
`;

const adminHeader = `
<h2 class="text-center mb-4 text-f1"><i class="fas fa-shield-alt"></i> Admin Felület</h2>
<div class="admin-nav mb-4 d-flex justify-content-center gap-3">
    <a href="/admin/contact-messages" class="btn <%= activePage === 'messages' ? 'btn-f1' : 'btn-outline-secondary' %>">
        <i class="fas fa-envelope"></i> Üzenetek
    </a>
    <a href="/admin/registered-users" class="btn <%= activePage === 'users' ? 'btn-f1' : 'btn-outline-secondary' %>">
        <i class="fas fa-users"></i> Felhasználók
    </a>
</div>
<h3 class="mb-4 text-center"><i class="fas <%= icon %>"></i> <%= title %></h3>
`;

write('views/partials/layout-header.ejs', layoutHeader);
write('views/partials/layout-footer.ejs', layoutFooter);
write('views/partials/pagination.ejs', pagination);
write('views/partials/admin-header.ejs', adminHeader);

// ==============================================
// 3. NÉZETEK (Views)
// ==============================================

// --- INDEX (WELCOME) ---
const indexContent = `
<%- include('partials/layout-header', { title: 'Főoldal - F1 Tech' }) %>
<div class="white-content-wrapper">
    <div class="welcome-logo-container">
        <!-- Helyőrző logó, ha nincs meg a fájl -->
        <div style="font-size: 3rem; color: #e10600; font-weight: bold;">F1 <span style="color:#333">TECH</span></div>
    </div>
    
    <div class="content-section">
        <p class="welcome-subtitle">
            <strong class="red-title">Üdvözlünk az F1 Akadémián, ahol a sebesség, a szenvedély és a történelem találkozik!</strong><br><br>
            <span class="normal-text">Oldalunk célja, hogy elhozzuk neked a Formula–1 aranykorának minden pillanatát...</span>
        </p>
        
        <div class="text-center my-5">
            <img src="https://media.formula1.com/image/upload/f_auto/q_auto/v1677244985/content/dam/fom-website/manual/Misc/2023-Season-Launch/Ferrari_SF-23.jpg" alt="F1 Car" style="width: 100%; max-width: 800px; border-radius: 10px;">
        </div>
        
        <div class="content-with-image">
            <div class="content-text">
                <p class="welcome-subtitle" style="text-align: left;">
                    <strong>A hősöd Ayrton Senna, Michael Schumacher vagy Max Verstappen?</strong><br>
                    Csatlakozz az F1 Akadémiához!
                    <% if(!user) { %>
                        <br>Nincs más dolgod, mint regisztrálni <a href="/register" style="color: #e10600; font-weight: bold;">ITT</a>!
                    <% } %>
                </p>
            </div>
        </div>
    </div>
</div>

<section class="welcome-features">
    <div class="features-grid">
        <div class="feature-card">
            <h3 class="feature-title">Pilóták adatbázisa</h3>
            <p>Tekintse meg a Formula 1 pilóták részletes adatait és eredményeit.</p>
            <a href="/pilots" class="feature-link">Böngészés →</a>
        </div>
        <div class="feature-card">
            <h3 class="feature-title">Diagramok</h3>
            <p>Interaktív grafikonok és statisztikák a F1 eredményekről.</p>
            <a href="/diagrams" class="feature-link">Megtekintés →</a>
        </div>
        <div class="feature-card">
            <h3 class="feature-title">Bajnokok Csarnoka</h3>
            <p>Szűrhető történeti adatbázis.</p>
            <a href="/database" class="feature-link">Kezelés →</a>
        </div>
    </div>
</section>
<%- include('partials/layout-footer') %>
`;
write('views/index.ejs', indexContent);

// --- CONTACT ---
const contactContent = `
<%- include('partials/layout-header', { title: 'Kapcsolat' }) %>
<div class="content-section">
    <div class="container">
        <div class="hero-section"><h1 class="hero-title">Kapcsolat</h1></div>
        <div class="row justify-content-center">
            <div class="col-lg-8">
                <div class="card-f1">
                    <% if (typeof success !== 'undefined' && success) { %><div class="alert alert-success"><%= success %></div><% } %>
                    <% if (typeof errors !== 'undefined' && errors.general) { %><div class="alert alert-danger"><%= errors.general %></div><% } %>
                    
                    <form method="post" action="/contact">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">Név *</label>
                                <input type="text" name="name" class="form-control" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Email *</label>
                                <input type="email" name="email" class="form-control" required>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Tárgy *</label>
                            <select name="subject" class="form-control">
                                <option>Általános</option><option>Technikai</option><option>Egyéb</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Üzenet *</label>
                            <textarea name="message" rows="5" class="form-control" required></textarea>
                        </div>
                        <div class="text-center">
                            <button type="submit" class="btn btn-f1">Küldés</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
<%- include('partials/layout-footer') %>
`;
write('views/contact.ejs', contactContent);

// --- DATABASE (Bajnokok Csarnoka) ---
const databaseContent = `
<%- include('partials/layout-header', { title: 'Bajnokok Csarnoka' }) %>
<div class="content-section">
    <div class="container">
        <div class="hero-section">
            <h1 class="hero-title">Bajnokok Csarnoka</h1>
            <p>Történelmi adatok szűrése</p>
        </div>
        <div class="card-f1">
            <h2 class="text-f1 mb-3">Pilóták</h2>
            <form method="GET" action="/database" class="d-flex gap-2 mb-4">
                <input type="text" name="search" class="form-control w-auto" placeholder="Név keresés..." value="<%= query.search || '' %>">
                <select name="nationality" class="form-control w-auto">
                    <option value="">Minden nemzetiség</option>
                    <% nationalities.forEach(n => { %>
                        <option value="<%= n %>" <%= query.nationality === n ? 'selected' : '' %>><%= n %></option>
                    <% }) %>
                </select>
                <button class="btn btn-f1">Szűrés</button>
            </form>
            <div class="table-responsive" style="max-height:400px; overflow:auto;">
                <table class="table table-f1">
                    <thead><tr><th>Név</th><th>Nemzetiség</th><th>Csapat</th></tr></thead>
                    <tbody>
                        <% pilots.forEach(p => { %>
                            <tr><td><%= p.name %></td><td><%= p.nationality %></td><td><%= p.team || '-' %></td></tr>
                        <% }) %>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
<%- include('partials/layout-footer') %>
`;
write('views/database.ejs', databaseContent);

// --- DIAGRAMS ---
const diagramsContent = `
<%- include('partials/layout-header', { title: 'Diagramok' }) %>
<div class="content-section">
    <div class="container">
        <div class="hero-section"><h1 class="hero-title">Statisztikák</h1></div>
        <div class="row">
            <div class="col-md-6">
                <div class="card-f1">
                    <h3>DNF (Kiesések) Csapatonként</h3>
                    <canvas id="dnfChart"></canvas>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card-f1">
                    <h3>Futamok Helyszínenként</h3>
                    <canvas id="locChart"></canvas>
                </div>
            </div>
        </div>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    const dnfData = JSON.parse('<%- JSON.stringify(dnfData) %>');
    const locData = JSON.parse('<%- JSON.stringify(locationData) %>');
    
    new Chart(document.getElementById('dnfChart'), {
        type: 'bar',
        data: {
            labels: dnfData.teams,
            datasets: [{ label: 'DNF', data: Object.values(dnfData.teamDNFCounts), backgroundColor: '#e10600' }]
        }
    });
    new Chart(document.getElementById('locChart'), {
        type: 'pie',
        data: {
            labels: locData.locations.slice(0, 10),
            datasets: [{ label: 'Futamok', data: locData.raceCounts.slice(0, 10), backgroundColor: ['#e10600', '#15151e', '#333', '#666', '#999'] }]
        }
    });
</script>
<%- include('partials/layout-footer') %>
`;
write('views/diagrams.ejs', diagramsContent);

// --- AUTH: REGISTER ---
const registerContent = `
<%- include('partials/layout-header', { title: 'Regisztráció' }) %>
<div class="content-section">
    <div class="container">
        <div class="hero-section"><h1 class="hero-title">Regisztráció</h1></div>
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card-f1">
                    <% if (typeof errors !== 'undefined' && errors.general) { %><div class="alert alert-danger"><%= errors.general %></div><% } %>
                    <form action="/register" method="POST">
                        <div class="mb-3">
                            <label>Név</label>
                            <input type="text" name="name" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label>Email</label>
                            <input type="email" name="email" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label>Jelszó (min 8)</label>
                            <input type="password" name="password" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label>Jelszó megerősítés</label>
                            <input type="password" name="password_confirmation" class="form-control" required>
                        </div>
                        <button class="btn btn-f1 w-100">Regisztráció</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
<%- include('partials/layout-footer') %>
`;
write('views/auth/register.ejs', registerContent);

// --- PILOTS: INDEX ---
const pilotsIndexContent = `
<%- include('../partials/layout-header', { title: 'Pilóták Kezelése' }) %>
<div class="content-section">
    <div class="container">
        <div class="hero-section"><h1 class="hero-title">Jelenlegi Pilóták</h1></div>
        <div class="mb-4 text-end">
            <a href="/pilots/create" class="btn btn-f1">Új Pilóta +</a>
        </div>
        <div class="card-f1">
            <table class="table table-f1">
                <thead><tr><th>ID</th><th>Név</th><th>Csapat</th><th>Műveletek</th></tr></thead>
                <tbody>
                    <% pilots.forEach(p => { %>
                        <tr>
                            <td><span class="pilot-id-badge"><%= p.pilot_id %></span></td>
                            <td><strong><%= p.name %></strong></td>
                            <td><%= p.team || '-' %></td>
                            <td>
                                <a href="/pilots/show/<%= p.pilot_id %>" class="btn btn-sm btn-info text-white">Megtekint</a>
                                <a href="/pilots/edit/<%= p.pilot_id %>" class="btn btn-sm btn-warning">Szerk</a>
                                <form action="/pilots/delete/<%= p.pilot_id %>" method="POST" style="display:inline;" onsubmit="return confirm('Biztos?')">
                                    <button class="btn btn-sm btn-danger">Töröl</button>
                                </form>
                            </td>
                        </tr>
                    <% }) %>
                </tbody>
            </table>
            <%- include('../partials/pagination', { currentPage: currentPage, totalPages: totalPages }) %>
        </div>
    </div>
</div>
<%- include('../partials/layout-footer') %>
`;
write('views/pilots/index.ejs', pilotsIndexContent);

// --- PILOTS: SHOW ---
const pilotsShowContent = `
<%- include('../partials/layout-header', { title: pilot.name }) %>
<div class="content-section">
    <div class="container">
        <div class="hero-section"><h1 class="hero-title"><%= pilot.name %></h1></div>
        <div class="row g-4">
            <div class="col-md-4"><div class="card-f1 text-center"><h4>Csapat</h4><p><strong><%= pilot.team %></strong></p></div></div>
            <div class="col-md-4"><div class="card-f1 text-center"><h4>Nemzetiség</h4><p><strong><%= pilot.nationality %></strong></p></div></div>
            <div class="col-md-4"><div class="card-f1 text-center"><h4>ID</h4><p class="pilot-id-badge"><%= pilot.pilot_id %></p></div></div>
        </div>
        <div class="card-f1 mt-4">
            <h3>Eredmények</h3>
            <table class="table table-f1">
                <thead><tr><th>Dátum</th><th>Futam</th><th>Helyezés</th></tr></thead>
                <tbody>
                    <% results.forEach(r => { %>
                        <tr>
                            <td><%= new Date(r.race_date).toLocaleDateString('hu-HU') %></td>
                            <td><%= r.GrandPrix ? r.GrandPrix.name : '?' %></td>
                            <td><%= r.position ? 'P'+r.position : 'DNF (' + (r.issue||'-') + ')' %></td>
                        </tr>
                    <% }) %>
                </tbody>
            </table>
        </div>
        <div class="mt-4 text-center"><a href="/pilots" class="btn btn-outline-f1">Vissza a listához</a></div>
    </div>
</div>
<%- include('../partials/layout-footer') %>
`;
write('views/pilots/show.ejs', pilotsShowContent);

// --- PILOTS: CREATE ---
const pilotsCreateContent = `
<%- include('../partials/layout-header', { title: 'Új Pilóta' }) %>
<div class="content-section">
    <div class="container">
        <div class="hero-section"><h1 class="hero-title">Új Pilóta</h1></div>
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card-f1">
                    <form action="/pilots" method="POST">
                        <div class="mb-3"><label>Név</label><input type="text" name="name" class="form-control" required></div>
                        <div class="mb-3"><label>Csapat</label><input type="text" name="team" class="form-control"></div>
                        <div class="mb-3"><label>Nemzetiség</label><input type="text" name="nationality" class="form-control"></div>
                        <button class="btn btn-f1">Mentés</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
<%- include('../partials/layout-footer') %>
`;
write('views/pilots/create.ejs', pilotsCreateContent);

// --- PILOTS: EDIT ---
const pilotsEditContent = `
<%- include('../partials/layout-header', { title: 'Szerkesztés' }) %>
<div class="content-section">
    <div class="container">
        <div class="hero-section"><h1 class="hero-title">Szerkesztés: <%= pilot.name %></h1></div>
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card-f1">
                    <form action="/pilots/edit/<%= pilot.pilot_id %>" method="POST">
                        <div class="mb-3"><label>Név</label><input type="text" name="name" class="form-control" value="<%= pilot.name %>" required></div>
                        <div class="mb-3"><label>Csapat</label><input type="text" name="team" class="form-control" value="<%= pilot.team %>"></div>
                        <div class="mb-3"><label>Nemzetiség</label><input type="text" name="nationality" class="form-control" value="<%= pilot.nationality %>"></div>
                        <button class="btn btn-f1">Frissítés</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
<%- include('../partials/layout-footer') %>
`;
write('views/pilots/edit.ejs', pilotsEditContent);

// --- ADMIN PAGES ---
const adminMessages = `
<%- include('../partials/layout-header', { title: 'Üzenetek' }) %>
<div class="content-section">
    <div class="container">
        <%- include('../partials/admin-header', { title: 'Kontakt Üzenetek', icon: 'fa-envelope', activePage: 'messages' }) %>
        <div class="card-f1">
            <table class="table table-f1">
                <thead><tr><th>Név</th><th>Email</th><th>Tárgy</th><th>Művelet</th></tr></thead>
                <tbody>
                    <% messages.forEach(m => { %>
                        <tr class="<%= m.is_read ? '' : 'fw-bold' %>">
                            <td><%= m.name %></td><td><%= m.email %></td><td><%= m.subject %></td>
                            <td>
                                <% if(!m.is_read) { %>
                                    <form action="/admin/contact-messages/<%= m.id %>/mark-read" method="POST" style="display:inline;"><button class="btn btn-sm btn-success">Olvasva</button></form>
                                <% } %>
                                <form action="/admin/contact-messages/<%= m.id %>/delete" method="POST" style="display:inline;"><button class="btn btn-sm btn-danger">Töröl</button></form>
                            </td>
                        </tr>
                    <% }) %>
                </tbody>
            </table>
        </div>
    </div>
</div>
<%- include('../partials/layout-footer') %>
`;
write('views/admin/contact_messages.ejs', adminMessages);

const adminUsers = `
<%- include('../partials/layout-header', { title: 'Felhasználók' }) %>
<div class="content-section">
    <div class="container">
        <%- include('../partials/admin-header', { title: 'Felhasználók', icon: 'fa-users', activePage: 'users' }) %>
        <div class="card-f1">
            <table class="table table-f1">
                <thead><tr><th>ID</th><th>Név</th><th>Email</th><th>Regisztrált</th></tr></thead>
                <tbody>
                    <% users.forEach(u => { %>
                        <tr><td><%= u.id %></td><td><%= u.name %></td><td><%= u.email %></td><td><%= new Date(u.created_at).toLocaleDateString('hu-HU') %></td></tr>
                    <% }) %>
                </tbody>
            </table>
        </div>
    </div>
</div>
<%- include('../partials/layout-footer') %>
`;
write('views/admin/registered_users.ejs', adminUsers);

console.log('✨ KÉSZ! Minden fájl generálva.');