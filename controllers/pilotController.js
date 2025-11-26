const db = require('../models');
const Pilot = db.PilotsCurrent; 
const { Op } = require('sequelize');

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
            order: [['pilot_id', 'ASC']] // <--- JAVÍTVA: id helyett pilot_id
        });

        res.render('pilots/index', { pilots, nationalities, query: req.query || {} });
    } catch (e) {
        console.error(e);
        res.status(500).send("Hiba: " + e.message);
    }
};

exports.create = (req, res) => res.render('pilots/create');

exports.store = async (req, res) => {
    await Pilot.create(req.body);
    res.redirect('/pilots');
};

// show, edit, update, destroy -> MINDENHOL 'pilot_id' kell 'id' helyett a where-ben!

exports.show = async (req, res) => {
    const pilot = await Pilot.findByPk(req.params.id);
    res.render('pilots/show', { pilot });
};

exports.edit = async (req, res) => {
    const pilot = await Pilot.findByPk(req.params.id);
    res.render('pilots/edit', { pilot });
};

exports.update = async (req, res) => {
    // JAVÍTVA: where: { pilot_id: ... }
    await Pilot.update(req.body, { where: { pilot_id: req.params.id } });
    res.redirect('/pilots');
};

exports.destroy = async (req, res) => {
    // JAVÍTVA: where: { pilot_id: ... }
    await Pilot.destroy({ where: { pilot_id: req.params.id } });
    res.redirect('/pilots');
};