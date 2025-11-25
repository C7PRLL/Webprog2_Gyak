const db = require('../models');
const Pilot = db.Pilot; // Történelmi pilóták
const GrandPrix = db.GrandPrix;
const { Op } = require('sequelize');

exports.index = async (req, res) => {
    try {
        const wherePilot = {};
        if (req.query.search) wherePilot.name = { [Op.like]: `%${req.query.search}%` };
        if (req.query.nationality) wherePilot.nationality = req.query.nationality;

        // 1. Nemzetiségek lekérése a lenyílóhoz (HIÁNYZOTT!)
        const allNats = await Pilot.findAll({
            attributes: ['nationality'],
            group: ['nationality'],
            where: { nationality: { [Op.ne]: null } } // Csak ahol van adat
        });
        const nationalities = allNats.map(p => p.nationality).sort();

        // 2. Pilóták és Futamok lekérése
        const pilots = await Pilot.findAll({ where: wherePilot, limit: 100 });
        const grandPrix = await GrandPrix.findAll({ limit: 100 });

        res.render('database', { 
            pilots, 
            grandPrix, 
            nationalities, // <--- EZT KELL ÁTADNI!
            query: req.query || {} 
        });
    } catch (e) {
        res.status(500).send("Hiba az adatbázis oldal betöltésekor: " + e.message);
    }
};