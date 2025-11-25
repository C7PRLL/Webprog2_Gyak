const db = require('../models');
// HIBAKEZELÉS: Ha véletlenül undefined lenne, fallbackelünk a sima Pilot-ra, de logoljuk a hibát
const Pilot = db.PilotsCurrent || db.Pilot; 
const { Op } = require('sequelize');

exports.index = async (req, res) => {
    try {
        // Debug: Ellenőrizzük, hogy megvan-e a modell
        if (!Pilot) {
            throw new Error("A 'PilotCurrent' modell nem található a db objektumban!");
        }

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
            order: [['id', 'ASC']]
        });

        res.render('pilots/index', { pilots, nationalities, query: req.query || {} });
    } catch (e) {
        console.error("CONTROLLER HIBA:", e); // Látni fogod a konzolon a pontos hibát
        res.status(500).send("Hiba: " + e.message);
    }
};

exports.create = (req, res) => res.render('pilots/create');

exports.store = async (req, res) => {
    await Pilot.create(req.body);
    res.redirect('/pilots');
};

exports.show = async (req, res) => {
    const pilot = await Pilot.findByPk(req.params.id);
    res.render('pilots/show', { pilot });
};

exports.edit = async (req, res) => {
    const pilot = await Pilot.findByPk(req.params.id);
    res.render('pilots/edit', { pilot });
};

exports.update = async (req, res) => {
    await Pilot.update(req.body, { where: { id: req.params.id } });
    res.redirect('/pilots');
};

exports.destroy = async (req, res) => {
    await Pilot.destroy({ where: { id: req.params.id } });
    res.redirect('/pilots');
};