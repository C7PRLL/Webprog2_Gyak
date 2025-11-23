const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

// ==========================================
// 1. BEÁLLÍTÁSOK (ÚJ ADATBÁZIS NÉVVEL!)
// ==========================================
const DB_CONFIG = {
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'webprog2_f1tech' // <--- JAVÍTVA
};

// Segédfüggvények
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
    if (!fs.existsSync(filePath)) {
        console.error(`⚠️  Nincs meg a fájl: ${filename}`);
        return [];
    }
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

async function setupDatabase() {
    try {
        console.log(`🚀 Rendszer előkészítése a '${DB_CONFIG.database}' adatbázishoz...`);

        // 1. ADATBÁZIS LÉTREHOZÁSA (Ha mégsem létezne)
        const connection = await mysql.createConnection({ host: DB_CONFIG.host, user: DB_CONFIG.user, password: DB_CONFIG.password });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\`;`);
        await connection.end();

        // 2. KAPCSOLÓDÁS
        const sequelize = new Sequelize(DB_CONFIG.database, DB_CONFIG.user, DB_CONFIG.password, {
            host: DB_CONFIG.host,
            dialect: 'mysql',
            logging: false,
        });

        // 3. TÁBLÁK DEFINIÁLÁSA
        const User = sequelize.define('User', {
            id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
            name: { type: DataTypes.STRING, allowNull: false },
            email: { type: DataTypes.STRING, allowNull: false, unique: true },
            email_verified_at: { type: DataTypes.DATE, allowNull: true },
            password: { type: DataTypes.STRING, allowNull: false },
            remember_token: { type: DataTypes.STRING(100), allowNull: true },
            is_admin: { type: DataTypes.BOOLEAN, defaultValue: false }
        }, { tableName: 'users', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

        const Pilot = sequelize.define('Pilot', {
            az: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: false, allowNull: false },
            name: { type: DataTypes.STRING, allowNull: false },
            gender: { type: DataTypes.CHAR(1), allowNull: true },
            birth_date: { type: DataTypes.DATEONLY, allowNull: true },
            nationality: { type: DataTypes.STRING, allowNull: true },
            team: { type: DataTypes.STRING, allowNull: true }
        }, { tableName: 'pilots', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

        const PilotCurrent = sequelize.define('PilotCurrent', {
            pilot_id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
            name: { type: DataTypes.STRING, allowNull: false },
            gender: { type: DataTypes.ENUM('M', 'F', 'N'), allowNull: true },
            nationality: { type: DataTypes.STRING, allowNull: true },
            team: { type: DataTypes.STRING(100), allowNull: true }
        }, { tableName: 'pilotsCurrent', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

        const GrandPrix = sequelize.define('GrandPrix', {
            id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
            race_date: { type: DataTypes.DATEONLY, allowNull: false },
            name: { type: DataTypes.STRING, allowNull: false },
            location: { type: DataTypes.STRING, allowNull: false }
        }, { tableName: 'grand_prix', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

        const Result = sequelize.define('Result', {
            id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
            race_date: { type: DataTypes.DATEONLY, allowNull: false },
            pilotaaz: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
            position: { type: DataTypes.INTEGER, allowNull: true },
            issue: { type: DataTypes.STRING, allowNull: true },
            team: { type: DataTypes.STRING, allowNull: false },
            car_type: { type: DataTypes.STRING, allowNull: false },
            engine: { type: DataTypes.STRING, allowNull: false }
        }, { tableName: 'results', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

        // Egyéb technikai táblák
        sequelize.define('Session', { id: { type: DataTypes.STRING, primaryKey: true }, user_id: { type: DataTypes.BIGINT }, payload: { type: DataTypes.TEXT }, last_activity: { type: DataTypes.INTEGER } }, { timestamps: false });
        sequelize.define('Cache', { key: { type: DataTypes.STRING, primaryKey: true }, value: { type: DataTypes.TEXT }, expiration: { type: DataTypes.INTEGER } }, { timestamps: false });
        sequelize.define('ContactMessage', { id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true }, name: DataTypes.STRING, email: DataTypes.STRING, subject: DataTypes.STRING, message: DataTypes.TEXT, is_read: { type: DataTypes.BOOLEAN, defaultValue: false } }, { timestamps: true });

        // Kapcsolatok
        Pilot.hasMany(Result, { foreignKey: 'pilotaaz', sourceKey: 'az' });
        Result.belongsTo(Pilot, { foreignKey: 'pilotaaz', targetKey: 'az' });

        // 4. SZINKRONIZÁLÁS
        console.log('⏳ Táblák létrehozása...');
        await sequelize.sync({ force: true }); // Törli és újrahúzza a táblákat
        console.log('✅ Táblák kész.');

        // 5. ADATBETÖLTÉS
        
        // Admin
        const hashedPassword = await bcrypt.hash('admin', 10);
        await User.create({ name: 'admin', email: 'admin@f1tech.hu', password: hashedPassword, is_admin: true, email_verified_at: new Date() });
        console.log('👤 Admin kész.');

        // PilotsCurrent
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
        await PilotCurrent.bulkCreate(currentPilotsData);
        console.log('🏎️  PilotsCurrent kész.');

        // TXT: Pilots
        const pilotLines = readEncodedFile('pilota.txt');
        for (let i = 1; i < pilotLines.length; i++) {
            const data = pilotLines[i].split('\t');
            if (data.length >= 5) {
                await Pilot.create({
                    az: data[0].trim(),
                    name: data[1].trim(),
                    gender: data[2].trim(),
                    birth_date: parseDate(data[3]),
                    nationality: data[4].trim() || null
                });
            }
        }
        console.log('📄 Pilots betöltve.');

        // TXT: GrandPrix
        const gpLines = readEncodedFile('gp.txt');
        for (let i = 1; i < gpLines.length; i++) {
            let line = gpLines[i];
            if (line.includes('Ã')) line = fixMojibake(line);
            const data = line.split('\t');
            if (data.length >= 3) {
                const parsedDate = parseDate(data[0]);
                if (parsedDate) {
                    await GrandPrix.create({ race_date: parsedDate, name: data[1].trim(), location: data[2].trim() });
                }
            }
        }
        console.log('🏁 Grand Prix betöltve.');

        // TXT: Results
        const resultLines = readEncodedFile('eredmeny.txt');
        for (let i = 1; i < resultLines.length; i++) {
            const data = resultLines[i].split('\t');
            if (data.length >= 7) {
                const pilotId = parseInt(data[1].trim());
                const pilotExists = await Pilot.findByPk(pilotId);
                if (pilotExists) {
                    await Result.create({
                        race_date: parseDate(data[0]) || data[0].trim().replace(/\./g, '-'),
                        pilotaaz: pilotId,
                        position: data[2].trim() === '' ? null : parseInt(data[2].trim()),
                        issue: data[3].trim() === '' ? null : data[3].trim(),
                        team: data[4].trim(),
                        car_type: data[5].trim(),
                        engine: data[6].trim()
                    });
                }
            }
        }
        console.log('🏆 Results betöltve.');
        console.log('✨ Minden kész a webprog2_f1tech adatbázisban!');

    } catch (error) {
        console.error('❌ HIBA:', error);
    } finally {
        process.exit();
    }
}

setupDatabase();