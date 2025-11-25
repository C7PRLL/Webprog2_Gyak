const db = require('../models');
const sequelize = db.sequelize;
const Result = db.Result;
const GrandPrix = db.GrandPrix;

exports.index = async (req, res) => {
    try {
        // 1. DNF Statisztika (Results táblából, ahol van 'issue')
        const dnfStats = await Result.findAll({
            attributes: ['team', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            where: { issue: { [db.Sequelize.Op.not]: null } }, // Ahol van hiba
            group: ['team']
        });

        // 2. Helyszínek (GrandPrix táblából)
        const locationStats = await GrandPrix.findAll({
            attributes: ['location', [sequelize.fn('COUNT', sequelize.col('race_date')), 'count']],
            group: ['location']
        });

        // Adatok előkészítése
        const dnfLabels = dnfStats.map(d => d.team);
        const dnfData = dnfStats.map(d => d.dataValues.count);
        
        const locLabels = locationStats.map(l => l.location);
        const locData = locationStats.map(l => l.dataValues.count);

        res.render('diagrams', {
            // Átadjuk JSON stringként a Chart.js-nek
            chartDnfLabels: JSON.stringify(dnfLabels),
            chartDnfData: JSON.stringify(dnfData),
            chartLocLabels: JSON.stringify(locLabels),
            chartLocData: JSON.stringify(locData),
            
            // Szűrőhöz szükséges üres adatok (hogy ne dobjon hibát az EJS)
            teams: [], years: [], selectedTeam: '', selectedYear: '',
            dnfData: { detailedData: [], teamDNFCounts: {}, teams: [], isFiltered: false },
            locationData: { locations: [], raceCounts: [] }
        });
    } catch (e) { res.status(500).send(e.message); }
};