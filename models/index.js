const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_DATABASE || 'webprog2_f1tech',
    process.env.DB_USERNAME || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || '127.0.0.1',
        dialect: 'mysql',
        logging: false
    }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// --- ITT A LÉNYEG: A hiányzó modellek definíciója ---

// 1. PilotCurrent (Ami miatt a hiba van - CRUD)
db.PilotCurrent = sequelize.define('PilotCurrent', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    team: { type: Sequelize.STRING },
    nationality: { type: Sequelize.STRING }
}, { tableName: 'pilotscurrent', timestamps: true });

// 2. Pilot (Történelmi - Adatbázis oldalhoz)
db.Pilot = sequelize.define('Pilot', {
    az: { type: Sequelize.INTEGER, primaryKey: true },
    name: { type: Sequelize.STRING },
    gender: { type: Sequelize.STRING },
    birth_date: { type: Sequelize.DATEONLY },
    nationality: { type: Sequelize.STRING }
}, { tableName: 'pilots', timestamps: false });

// 3. GrandPrix
db.GrandPrix = sequelize.define('GrandPrix', {
    race_date: { type: Sequelize.DATEONLY, primaryKey: true },
    name: { type: Sequelize.STRING },
    location: { type: Sequelize.STRING }
}, { tableName: 'grand_prix', timestamps: false });

// 4. Result
db.Result = sequelize.define('Result', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    race_date: { type: Sequelize.DATEONLY },
    pilotaaz: { type: Sequelize.INTEGER },
    position: { type: Sequelize.INTEGER },
    issue: { type: Sequelize.STRING },
    team: { type: Sequelize.STRING },
    car_type: { type: Sequelize.STRING },
    engine: { type: Sequelize.STRING }
}, { tableName: 'results', timestamps: false });

// 5. User (Auth)
db.User = sequelize.define('User', {
    name: { type: Sequelize.STRING, allowNull: false },
    email: { type: Sequelize.STRING, allowNull: false, unique: true },
    password: { type: Sequelize.STRING, allowNull: false },
    is_admin: { type: Sequelize.BOOLEAN, defaultValue: false }
}, { tableName: 'users', timestamps: true });

// 6. ContactMessage
db.ContactMessage = sequelize.define('ContactMessage', {
    name: Sequelize.STRING,
    email: Sequelize.STRING,
    message: Sequelize.TEXT,
    newsletter: { type: Sequelize.BOOLEAN, defaultValue: false },
    is_read: { type: Sequelize.BOOLEAN, defaultValue: false }
}, { tableName: 'contact_messages', timestamps: true });

module.exports = db;