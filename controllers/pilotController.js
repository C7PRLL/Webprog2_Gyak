const db = require('../models');
const Pilot = db.PilotsCurrent; 
const { Op } = require('sequelize');

// 1. Lista
exports.index = async (req, res) => {
    try {
        const where = {};
        if (req.query.search) where.name = { [Op.like]: `%${req.query.search}%` };
        if (req.query.nationality) where.nationality = req.query.nationality;

        const allNats = await Pilot.findAll({
            attributes: ['nationality'],
            group: ['nationality']
        });
        const nationalities = allNats.map(p => p.nationality).filter(n => n).sort();

        const pilots = await Pilot.findAll({ 
            where,
            order: [['pilot_id', 'ASC']] // ID szerinti rendezés
        });

        res.render('pilots/index', { pilots, nationalities, query: req.query || {} });
    } catch (e) {
        console.error(e);
        res.status(500).send("Hiba: " + e.message);
    }
};

// 2. Létrehozás űrlap
exports.create = (req, res) => {
    res.render('pilots/create');
};

// 3. Mentés
exports.store = async (req, res) => {
    try {
        await Pilot.create(req.body);
        
        res.redirect(req.baseUrl + '/pilots');
    } catch (e) {
        res.status(500).send("Hiba a mentéskor: " + e.message);
    }
};

// 4. Megtekintés (Info)
exports.show = async (req, res) => {
    try {
        const pilot = await Pilot.findByPk(req.params.id);
        if (!pilot) return res.status(404).send('Nincs ilyen pilóta');
        res.render('pilots/show', { pilot });
    } catch (e) {
        res.status(500).send(e.message);
    }
};

// 5. Szerkesztés űrlap
exports.edit = async (req, res) => {
    try {
        const pilot = await Pilot.findByPk(req.params.id);
        if (!pilot) return res.status(404).send('Nincs ilyen pilóta');
        res.render('pilots/edit', { pilot });
    } catch (e) {
        res.status(500).send(e.message);
    }
};

// 6. Frissítés
exports.update = async (req, res) => {
    try {
      
        await Pilot.update(req.body, { where: { pilot_id: req.params.id } });
        
       
        res.redirect(req.baseUrl + '/pilots');
    } catch (e) {
        res.status(500).send("Hiba a frissítéskor: " + e.message);
    }
};

// 7. Törlés
exports.destroy = async (req, res) => {
    try {
      
        await Pilot.destroy({ where: { pilot_id: req.params.id } });
        
       
        res.redirect(req.baseUrl + '/pilots');
    } catch (e) {
        res.status(500).send("Hiba a törléskor: " + e.message);
    }
};