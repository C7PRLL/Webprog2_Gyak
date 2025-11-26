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

// --- 1. JELENLEGI PILÓTÁK ---
db.PilotsCurrent = sequelize.define('PilotsCurrent', {
    // ID helyett pilot_id
    pilot_id: { 
        type: Sequelize.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    name: { type: Sequelize.STRING, allowNull: false },
    team: { type: Sequelize.STRING },
    nationality: { type: Sequelize.STRING },
    gender: { type: Sequelize.STRING } // A képen láttam, hogy van gender is
}, { 
    tableName: 'pilotscurrent', 
    timestamps: true,           // Vannak időbélyegek a képen!
    createdAt: 'created_at',    // Megmondjuk, hogy az adatbázisban így hívják
    updatedAt: 'updated_at',
    freezeTableName: true
});

// --- 2. RÉGI ADATOK (Database oldal) ---
db.Pilot = sequelize.define('Pilot', {
    az: { type: Sequelize.INTEGER, primaryKey: true },
    name: { type: Sequelize.STRING },
    gender: { type: Sequelize.STRING },
    birth_date: { type: Sequelize.DATEONLY },
    nationality: { type: Sequelize.STRING }
}, { tableName: 'pilots', timestamps: false });

// --- 3. GRAND PRIX ---
db.GrandPrix = sequelize.define('GrandPrix', {
    race_date: { type: Sequelize.DATEONLY, primaryKey: true },
    name: { type: Sequelize.STRING },
    location: { type: Sequelize.STRING }
}, { tableName: 'grand_prix', timestamps: false });

// --- 4. RESULT ---
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

// --- 5. USER ---
db.User = sequelize.define('User', {
    name: { type: Sequelize.STRING, allowNull: false },
    email: { type: Sequelize.STRING, allowNull: false, unique: true },
    password: { type: Sequelize.STRING, allowNull: false },
    is_admin: { type: Sequelize.BOOLEAN, defaultValue: false }
}, { 
    tableName: 'users', 
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// --- 6. CONTACT ---
db.ContactMessage = sequelize.define('ContactMessage', {
    name: Sequelize.STRING,
    email: Sequelize.STRING,
    message: Sequelize.TEXT,
    newsletter: { type: Sequelize.BOOLEAN, defaultValue: false },
    is_read: { type: Sequelize.BOOLEAN, defaultValue: false }
}, { tableName: 'contact_messages', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });


module.exports = db;