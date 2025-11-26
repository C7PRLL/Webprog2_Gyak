const db = require('../models');
const Pilot = db.Pilot; 
const GrandPrix = db.GrandPrix;
const { Op } = require('sequelize');

exports.index = async (req, res) => {
    try {
        // --- 1. PILÓTA SZŰRÉS ---
        const wherePilot = {};
        if (req.query.search) wherePilot.name = { [Op.like]: `%${req.query.search}%` };
        if (req.query.nationality) wherePilot.nationality = req.query.nationality;

        // Nemzetiségek
        const allNats = await Pilot.findAll({
            attributes: ['nationality'],
            group: ['nationality'],
            where: { nationality: { [Op.ne]: null } }
        });
        const nationalities = allNats.map(p => p.nationality).sort();

        // --- 2. NAGYDÍJ SZŰRÉS ---
        const whereGP = {};
        
        if (req.query.location) whereGP.location = { [Op.like]: `%${req.query.location}%` };
        if (req.query.year) whereGP.race_date = { [Op.startsWith]: req.query.year };

        // --- ÉV KINYERÉS ---
       
        const allGPs = await GrandPrix.findAll({ attributes: ['race_date'] });
        const years = [...new Set(allGPs.map(gp => {
            // Biztonságos dátum konverzió
            return new Date(gp.race_date).getFullYear();
        }))].sort((a, b) => b - a);

        // --- 3. ADATOK LEKÉRÉSE ---
        const pilots = await Pilot.findAll({ 
            where: wherePilot, 
            limit: 50,
            order: [['name', 'ASC']]
        });

        const grandPrixList = await GrandPrix.findAll({ 
            where: whereGP, 
            limit: 50,
            order: [['race_date', 'ASC']] 
        });

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