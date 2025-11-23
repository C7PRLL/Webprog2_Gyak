const { Sequelize, DataTypes } = require('sequelize');

// Adatbázis konfig
const sequelize = new Sequelize('webprog2_f1tech', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

// Importáljuk és inicializáljuk a modelleket
// (Ezeket mindjárt létrehozzuk külön fájlokban, vagy definiálhatjuk itt egyben is, 
// de a szép megoldás a külön fájl. Most az egyszerűség kedvéért itt definiálom őket, 
// hogy ne kelljen 8 fájlt létrehoznod, de később szétszedheted.)

const User = sequelize.define('User', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    is_admin: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: 'users', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

const Pilot = sequelize.define('Pilot', {
    az: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: false },
    name: { type: DataTypes.STRING },
    gender: { type: DataTypes.CHAR(1) },
    birth_date: { type: DataTypes.DATEONLY },
    nationality: { type: DataTypes.STRING },
    team: { type: DataTypes.STRING }
}, { tableName: 'pilots', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

const GrandPrix = sequelize.define('GrandPrix', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    race_date: { type: DataTypes.DATEONLY },
    name: { type: DataTypes.STRING },
    location: { type: DataTypes.STRING }
}, { tableName: 'grand_prix', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

const Result = sequelize.define('Result', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    race_date: { type: DataTypes.DATEONLY },
    pilotaaz: { type: DataTypes.BIGINT.UNSIGNED },
    position: { type: DataTypes.INTEGER },
    issue: { type: DataTypes.STRING },
    team: { type: DataTypes.STRING },
    car_type: { type: DataTypes.STRING },
    engine: { type: DataTypes.STRING }
}, { tableName: 'results', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

const PilotCurrent = sequelize.define('PilotCurrent', {
    pilot_id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING },
    gender: { type: DataTypes.ENUM('M', 'F', 'N') },
    nationality: { type: DataTypes.STRING },
    team: { type: DataTypes.STRING }
}, { tableName: 'pilotsCurrent', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

const ContactMessage = sequelize.define('ContactMessage', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    subject: DataTypes.STRING,
    message: DataTypes.TEXT,
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: 'contact_messages', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

// Kapcsolatok
Pilot.hasMany(Result, { foreignKey: 'pilotaaz', sourceKey: 'az' });
Result.belongsTo(Pilot, { foreignKey: 'pilotaaz', targetKey: 'az' });

// Exportálás
module.exports = {
    sequelize,
    User,
    Pilot,
    GrandPrix,
    Result,
    PilotCurrent,
    ContactMessage
};