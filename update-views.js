const fs = require('fs');
const path = require('path');

// Mappák biztosítása
const viewsDir = path.join(__dirname, 'views');
const partialsDir = path.join(viewsDir, 'partials');
const adminDir = path.join(viewsDir, 'admin');

if (!fs.existsSync(partialsDir)) fs.mkdirSync(partialsDir, { recursive: true });
if (!fs.existsSync(adminDir)) fs.mkdirSync(adminDir, { recursive: true });

console.log('🔄 Nézetek frissítése...');

// ==========================================
// 1. ADMIN HEADER PARTIAL (admin-header.ejs)
// ==========================================
const headerContent = `
<h2 class="text-center mb-4">
    <i class="fas fa-shield-alt"></i> Admin Felület
</h2>

<div class="admin-nav mb-4">
    <div class="btn-group w-100" role="group">
        <a href="/admin/contact-messages" 
           class="add-pilot-button <%= (typeof activePage !== 'undefined' && activePage === 'messages') ? '' : 'btn-outline' %>">
            <i class="fas fa-envelope"></i> Kontakt Üzenetek
        </a>
        <a href="/admin/registered-users" 
           class="add-pilot-button <%= (typeof activePage !== 'undefined' && activePage === 'users') ? '' : 'btn-outline' %>">
            <i class="fas fa-users"></i> Felhasználók
        </a>
    </div>
</div>

<h3 class="mb-4">
    <i class="fas <%= icon %>"></i> <%= title %>
</h3>

<% if (typeof success !== 'undefined' && success) { %>
    <div class="alert alert-success" role="alert">
        <strong>Siker!</strong> <%= success %>
    </div>
<% } %>

<% if (typeof error !== 'undefined' && error) { %>
    <div class="alert alert-danger" role="alert">
        <strong>Hiba!</strong> <%= error %>
    </div>
<% } %>

<style>
    .add-pilot-button {
        display: inline-block;
        padding: 10px 20px;
        background-color: #e10600;
        color: white;
        text-decoration: none;
        font-weight: bold;
        border: 2px solid #e10600;
        flex: 1;
        text-align: center;
    }
    .add-pilot-button:hover {
        background-color: #b30000;
        border-color: #b30000;
        color: white;
    }
    .add-pilot-button.btn-outline {
        background-color: transparent;
        color: #e10600;
    }
    .add-pilot-button.btn-outline:hover {
        background-color: #e10600;
        color: white;
    }
</style>
`;

fs.writeFileSync(path.join(partialsDir, 'admin-header.ejs'), headerContent);
console.log('✅ views/partials/admin-header.ejs létrehozva.');

// ==========================================
// 2. CONTACT MESSAGES VIEW FRISSÍTÉSE
// ==========================================
const contactContent = `
<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kontakt Üzenetek - Admin</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        .card-f1 { border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px; margin-top: 20px; }
        .unread-message { background-color: #fff3cd; font-weight: bold; }
        .bg-f1-red { background-color: #e10600; }
        .bg-f1-dark { background-color: #15151e; }
        .bg-f1-silver { background-color: #d0d0d2; }
        .pilot-id-badge { background: #333; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.8em; }
    </style>
</head>
<body>
    <nav class="navbar navbar-dark bg-dark mb-4">
        <div class="container"><a class="navbar-brand" href="/">F1 Tech Admin</a></div>
    </nav>
    <div class="container">
        <div class="row">
            <div class="col-12">
                <div class="contact-form">
                    
                    <!-- PARTIAL BEHÚZÁSA -->
                    <%- include('../partials/admin-header', { title: 'Kontakt Üzenetek', icon: 'fa-envelope', activePage: 'messages' }) %>
                    
                    <% if (messages && messages.length > 0) { %>
                        <div class="card-f1">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead class="table-light">
                                        <tr>
                                            <th>ID</th> <th>Név</th> <th>Email</th> <th>Tárgy</th> <th>Üzenet</th> <th>Hírlevél</th> <th>Dátum</th> <th>Műveletek</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <% messages.forEach(function(msg) { %>
                                        <tr class="<%= msg.is_read ? '' : 'table-warning' %>">
                                            <td><span class="pilot-id-badge"><%= msg.id %></span></td>
                                            <td><%= msg.name %></td>
                                            <td><%= msg.email %></td>
                                            <td><%= msg.subject.length > 30 ? msg.subject.substring(0, 30) + '...' : msg.subject %></td>
                                            <td><%= msg.message.length > 50 ? msg.message.substring(0, 50) + '...' : msg.message %></td>
                                            <td><% if (msg.newsletter) { %><span class="badge bg-success">Igen</span><% } else { %><span class="badge bg-secondary">Nem</span><% } %></td>
                                            <td><%= new Date(msg.created_at).toLocaleDateString('hu-HU') %></td>
                                            <td>
                                                <div class="btn-group btn-group-sm">
                                                    <% if (!msg.is_read) { %>
                                                        <form action="/admin/contact-messages/<%= msg.id %>/mark-read" method="POST" style="display: inline;">
                                                            <button type="submit" class="btn btn-outline-primary" title="Olvasott"><i class="fas fa-check"></i></button>
                                                        </form>
                                                    <% } else { %><span class="badge bg-success me-2">Olvasva</span><% } %>
                                                    <form action="/admin/contact-messages/<%= msg.id %>/delete" method="POST" style="display: inline;" onsubmit="return confirm('Törlöd?')">
                                                        <button type="submit" class="btn btn-outline-danger" title="Törlés"><i class="fas fa-trash"></i></button>
                                                    </form>
                                                </div>
                                            </td>
                                        </tr>
                                        <% }); %>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="row mt-4">
                            <div class="col-md-4"><div class="card bg-danger text-white mb-3"><div class="card-body text-center"><h3><%= stats.total %></h3><p class="m-0">Összes üzenet</p></div></div></div>
                            <div class="col-md-4"><div class="card bg-dark text-white mb-3"><div class="card-body text-center"><h3><%= stats.read %></h3><p class="m-0">Olvasott</p></div></div></div>
                            <div class="col-md-4"><div class="card bg-secondary text-white mb-3"><div class="card-body text-center"><h3><%= stats.unread %></h3><p class="m-0">Új üzenetek</p></div></div></div>
                        </div>
                    <% } else { %>
                        <div class="alert alert-info text-center mt-4"><i class="fas fa-info-circle me-2"></i> Még nincsenek kontakt üzenetek.</div>
                    <% } %>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
`;
fs.writeFileSync(path.join(adminDir, 'contact_messages.ejs'), contactContent);
console.log('✅ views/admin/contact_messages.ejs frissítve.');

// ==========================================
// 3. REGISTERED USERS VIEW FRISSÍTÉSE
// ==========================================
const usersContent = `
<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Regisztrált Felhasználók - Admin</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        .card-f1 { border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px; margin-top: 20px; }
        .bg-f1-red { background-color: #e10600; }
        .bg-f1-dark { background-color: #15151e; }
        .bg-f1-silver { background-color: #d0d0d2; }
        .pilot-id-badge { background: #333; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.8em; }
        .pilot-name-cell { font-weight: bold; color: #e10600; }
    </style>
</head>
<body>
    <nav class="navbar navbar-dark bg-dark mb-4">
        <div class="container"><a class="navbar-brand" href="/">F1 Tech Admin</a></div>
    </nav>
    <div class="container">
        <div class="row">
            <div class="col-12">
                <div class="contact-form">
                    
                    <!-- PARTIAL BEHÚZÁSA -->
                    <%- include('../partials/admin-header', { title: 'Regisztrált Felhasználók', icon: 'fa-users', activePage: 'users' }) %>
                    
                    <% if (users && users.length > 0) { %>
                        <div class="card-f1">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead class="table-light">
                                        <tr>
                                            <th>ID</th> <th>Név</th> <th>Email</th> <th>Email Megerősítve</th> <th>Regisztráció Dátuma</th> <th>Utolsó Módosítás</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <% users.forEach(function(user) { %>
                                        <tr>
                                            <td><span class="pilot-id-badge"><%= user.id %></span></td>
                                            <td class="pilot-name-cell"><%= user.name %></td>
                                            <td><%= user.email %></td>
                                            <td>
                                                <% if (user.email_verified_at) { %>
                                                    <span class="badge bg-success"><i class="fas fa-check"></i> Megerősítve</span><br>
                                                    <small class="text-muted"><%= new Date(user.email_verified_at).toLocaleDateString('hu-HU') %></small>
                                                <% } else { %>
                                                    <span class="badge bg-warning text-dark"><i class="fas fa-clock"></i> Nem megerősített</span>
                                                <% } %>
                                            </td>
                                            <td><%= new Date(user.created_at).toLocaleDateString('hu-HU') %> <%= new Date(user.created_at).toLocaleTimeString('hu-HU', {hour:'2-digit', minute:'2-digit'}) %></td>
                                            <td><%= new Date(user.updated_at).toLocaleDateString('hu-HU') %></td>
                                        </tr>
                                        <% }); %>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="row mt-4">
                            <div class="col-md-4"><div class="card bg-f1-red text-white mb-3"><div class="card-body text-center"><h3><%= stats.total %></h3><p class="m-0">Összes felhasználó</p></div></div></div>
                            <div class="col-md-4"><div class="card bg-f1-dark text-white mb-3"><div class="card-body text-center"><h3><%= stats.verified %></h3><p class="m-0">Megerősített email</p></div></div></div>
                            <div class="col-md-4"><div class="card bg-f1-silver text-dark mb-3"><div class="card-body text-center"><h3><%= stats.today %></h3><p class="m-0">Mai regisztrációk</p></div></div></div>
                        </div>
                    <% } else { %>
                        <div class="alert alert-info text-center mt-4"><i class="fas fa-info-circle me-2"></i> Még nincsenek regisztrált felhasználók.</div>
                    <% } %>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
`;
fs.writeFileSync(path.join(adminDir, 'registered_users.ejs'), usersContent);
console.log('✅ views/admin/registered_users.ejs frissítve.');
console.log('✨ Minden admin nézet sikeresen frissült!');