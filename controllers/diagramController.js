const db = require('../models');
const sequelize = db.sequelize;
const Result = db.Result;
const GrandPrix = db.GrandPrix;
const { Op } = require('sequelize');

exports.index = async (req, res) => {
    try {
        const { team, year } = req.query;

        // --- 1. DNF ADATOK (Szűrőkkel) ---
        const whereClause = {};
        whereClause.issue = { [Op.not]: null, [Op.ne]: '' };
        
        if (team) whereClause.team = team;
        if (year) whereClause.race_date = { [Op.startsWith]: year };

        const dnfDetails = await Result.findAll({
            where: whereClause,
            order: [['race_date', 'DESC']]
        });

        // DNF Összesítés
        const teamCounts = {};
        dnfDetails.forEach(r => {
            teamCounts[r.team] = (teamCounts[r.team] || 0) + 1;
        });

        // RENDEZÉS: Csökkenő sorrend
        const sortedDnf = Object.entries(teamCounts).sort((a, b) => b[1] - a[1]);
        
        // JAVÍTÁS: Szétbontjuk tömbökre a DNF adatokat is (hogy a chart értse)
        const dnfLabels = sortedDnf.map(item => item[0]); // Nevek
        const dnfValues = sortedDnf.map(item => item[1]); // Számok

        // --- 2. HELYSZÍN ADATOK ---
        const locations = await GrandPrix.findAll();
        const locCounts = {};
        
        locations.forEach(l => {
            locCounts[l.location] = (locCounts[l.location] || 0) + 1;
        });

        // RENDEZÉS: Csökkenő sorrend
        const sortedLoc = Object.entries(locCounts).sort((a, b) => b[1] - a[1]);
        
        const locLabels = sortedLoc.map(item => item[0]);
        const locValues = sortedLoc.map(item => item[1]);

        // --- 3. SZŰRŐ LISTÁK ---
        const distinctTeams = await Result.findAll({
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('team')), 'team']],
            order: [['team', 'ASC']]
        });
        
        const distinctYears = await GrandPrix.findAll({
            attributes: [[sequelize.fn('DISTINCT', sequelize.fn('YEAR', sequelize.col('race_date'))), 'year']],
            order: [[sequelize.col('year'), 'DESC']]
        });

        // --- 4. RENDERELÉS ---
        res.render('diagrams', {
            // DNF Adatok
            dnfData: {
                detailedData: dnfDetails,
                teamDNFCounts: teamCounts,
                isFiltered: !!(team || year),
                // JAVÍTÁS: Ezeket a kulcsokat várja a View scriptje!
                labels: dnfLabels,
                values: dnfValues
            },
            // Helyszín Adatok
            locationData: {
                locations: locLabels,
                raceCounts: locValues
            },
            // Szűrők
            teams: distinctTeams.map(t => t.team),
            years: distinctYears.map(y => y.get('year')),
            selectedTeam: team || '',
            selectedYear: year || ''
        });

    } catch (e) {
        console.error(e);
        res.status(500).send("Hiba a diagramok betöltésekor: " + e.message);
    }
};