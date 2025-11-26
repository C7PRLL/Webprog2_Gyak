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

        // DNF Összesítés és Rendezés
        const teamCounts = {};
        dnfDetails.forEach(r => {
            teamCounts[r.team] = (teamCounts[r.team] || 0) + 1;
        });

        // Rendezés: csökkenő sorrend (b - a)
        const sortedDnf = Object.entries(teamCounts).sort((a, b) => b[1] - a[1]);
        
        // --- 2. HELYSZÍN ADATOK (RENDEZVE!) ---
        const locations = await GrandPrix.findAll();
        const locCounts = {};
        
        // Megszámoljuk, melyik helyszín hányszor szerepel
        locations.forEach(l => {
            locCounts[l.location] = (locCounts[l.location] || 0) + 1;
        });

        // ITT A LÉNYEG: Rendezés gyakoriság szerint (Csökkenő)
        const sortedLoc = Object.entries(locCounts).sort((a, b) => b[1] - a[1]);
        
        // Szétbontjuk nevek és számok tömbjére (hogy a Chart.js értse)
        const locLabels = sortedLoc.map(item => item[0]); // Pl. ['Monza', 'Monaco'...]
        const locValues = sortedLoc.map(item => item[1]); // Pl. [70, 68...]

        // --- 3. DROPDOWN LISTÁK ---
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
                teams: sortedDnf.map(i => i[0]), // Rendezett nevek a chartnak
                isFiltered: !!(team || year)
            },
            // Helyszín Adatok (A te View kódodhoz igazítva)
            locationData: {
                locations: locLabels,   // Ez megy a chart labels-be
                raceCounts: locValues   // Ez megy a chart data-ba
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