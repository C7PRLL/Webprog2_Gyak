const db = require('../models');
const Pilot = db.Pilot; 
const GrandPrix = db.GrandPrix;
const sequelize = db.sequelize;
const { Op } = require('sequelize');

exports.index = async (req, res) => {
    try {
        // --- 1. PILÓTA SZŰRÉS ---
        const wherePilot = {};
        if (req.query.search) wherePilot.name = { [Op.like]: `%${req.query.search}%` };
        if (req.query.nationality) wherePilot.nationality = req.query.nationality;

        // Nemzetiségek lekérése a legördülőhöz
        const allNats = await Pilot.findAll({
            attributes: ['nationality'],
            group: ['nationality'],
            where: { nationality: { [Op.ne]: null } }
        });
        const nationalities = allNats.map(p => p.nationality).sort();

        // --- 2. NAGYDÍJ SZŰRÉS ---
        const whereGP = {};
        
        // Helyszín keresés
        if (req.query.location) whereGP.location = { [Op.like]: `%${req.query.location}%` };
        
        // Év szűrés (Ha van kiválasztva év, akkor azzal kezdődő dátumokat keresünk)
        if (req.query.year) {
            whereGP.race_date = { [Op.startsWith]: req.query.year };
        }

        // Évek lekérése a legördülőhöz (SQL-ből kinyerjük az éveket)
        // Mivel a race_date DATE típusú, nyers lekérdezéssel vagy JS map-el szedjük ki
        const allGPs = await GrandPrix.findAll({ attributes: ['race_date'] });
        const years = [...new Set(allGPs.map(gp => gp.race_date.substring(0, 4)))].sort((a, b) => b - a);

        // --- 3. ADATOK LEKÉRÉSE ---
        
        // Pilóták (Max 50, hogy ne legyen lassú)
        const pilots = await Pilot.findAll({ 
            where: wherePilot, 
            limit: 50,
            order: [['name', 'ASC']]
        });

        // Nagydíjak (Rendezés: Dátum szerint növekvő)
        const grandPrixList = await GrandPrix.findAll({ 
            where: whereGP, 
            limit: 50,
            order: [['race_date', 'ASC']] 
        });

        // Renderelés
        res.render('database', { 
            pilots, 
            grandPrix: grandPrixList, 
            nationalities,
            years,
            query: req.query || {} 
        });

    } catch (e) {
        console.error(e);
        res.status(500).send("Hiba az adatbázis betöltésekor: " + e.message);
    }
};