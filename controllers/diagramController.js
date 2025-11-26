const db = require('../models');
const sequelize = db.sequelize;
const Result = db.Result;
const GrandPrix = db.GrandPrix;
const { Op } = require('sequelize');

exports.index = async (req, res) => {
    try {
        const { team, year } = req.query;

        // 1. Szűrők előkészítése
        const whereClause = {};
        // Csak azokat keressük, ahol volt hiba (DNF)
        whereClause.issue = { [Op.not]: null, [Op.ne]: '' };
        
        if (team) whereClause.team = team;
        if (year) whereClause.race_date = { [Op.startsWith]: year };

        // 2. DNF Adatok lekérése (Részletes lista a táblázathoz)
        const dnfDetails = await Result.findAll({
            where: whereClause,
            order: [['race_date', 'DESC']]
        });

        // 3. DNF Statisztika (Chart-hoz)
        // Csapatonként összeszámoljuk JS-ben (egyszerűbb, mint a GROUP BY query variálása)
        const teamCounts = {};
        dnfDetails.forEach(r => {
            teamCounts[r.team] = (teamCounts[r.team] || 0) + 1;
        });

        // 4. Helyszínek lekérése
        const locations = await GrandPrix.findAll();
        const locCounts = {};
        locations.forEach(l => {
            locCounts[l.location] = (locCounts[l.location] || 0) + 1;
        });

        // 5. Szűrő listák (Dropdownokhoz)
        const distinctTeams = await Result.findAll({
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('team')), 'team']],
            order: [['team', 'ASC']]
        });
        
        const distinctYears = await GrandPrix.findAll({
            attributes: [[sequelize.fn('DISTINCT', sequelize.fn('YEAR', sequelize.col('race_date'))), 'year']],
            order: [[sequelize.col('year'), 'DESC']]
        });

        // ADATOK ÁTADÁSA A VIEW-NEK
        res.render('diagrams', {
            // DNF Objektum
            dnfData: {
                detailedData: dnfDetails, // Táblázathoz
                teamDNFCounts: teamCounts, // Chart-hoz
                teams: Object.keys(teamCounts), // Chart címkék
                isFiltered: !!(team || year)
            },
            // Location Objektum
            locationData: {
                locations: Object.keys(locCounts),
                raceCounts: Object.values(locCounts)
            },
            // Dropdown adatok
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