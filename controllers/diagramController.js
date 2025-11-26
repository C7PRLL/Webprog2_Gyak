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
        whereClause.issue = { [Op.not]: null, [Op.ne]: '' };
        
        if (team) whereClause.team = team;
        if (year) whereClause.race_date = { [Op.startsWith]: year };

        // 2. DNF Adatok lekérése
        const dnfDetails = await Result.findAll({
            where: whereClause,
            order: [['race_date', 'DESC']]
        });

        // 3. DNF Statisztika összeszámolása
        const teamCounts = {};
        dnfDetails.forEach(r => {
            teamCounts[r.team] = (teamCounts[r.team] || 0) + 1;
        });

        // --- ITT A RENDEZÉS (DNF) ---
        // Átalakítjuk tömbbé, sorba rendezzük érték szerint (csökkenő), majd vissza
        const sortedDnfEntries = Object.entries(teamCounts)
            .sort((a, b) => b[1] - a[1]); // b[1] a darabszám, csökkenő sorrend

        const sortedTeams = sortedDnfEntries.map(entry => entry[0]); // Csapatnevek sorban

        // 4. Helyszínek lekérése
        const locations = await GrandPrix.findAll();
        const locCounts = {};
        locations.forEach(l => {
            locCounts[l.location] = (locCounts[l.location] || 0) + 1;
        });

        // --- ITT A RENDEZÉS (Helyszínek) ---
        const sortedLocEntries = Object.entries(locCounts)
            .sort((a, b) => b[1] - a[1]); // Csökkenő sorrend

        const sortedLocations = sortedLocEntries.map(entry => entry[0]); // Helyszínek
        const sortedRaceCounts = sortedLocEntries.map(entry => entry[1]); // Darabszámok

        // 5. Szűrő listák (Dropdownokhoz) - Ezek maradjanak ABC sorrendben
        const distinctTeams = await Result.findAll({
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('team')), 'team']],
            order: [['team', 'ASC']]
        });
        
        const distinctYears = await GrandPrix.findAll({
            attributes: [[sequelize.fn('DISTINCT', sequelize.fn('YEAR', sequelize.col('race_date'))), 'year']],
            order: [[sequelize.col('year'), 'DESC']]
        });

        // ADATOK ÁTADÁSA
        res.render('diagrams', {
            dnfData: {
                detailedData: dnfDetails,
                teamDNFCounts: teamCounts, // Ez marad objektum a gyors kereséshez
                teams: sortedTeams,        // EZT KÜLDJÜK RENDEZVE A DIAGRAMNAK!
                isFiltered: !!(team || year)
            },
            locationData: {
                locations: sortedLocations,   // Rendezett helyszínek
                raceCounts: sortedRaceCounts  // Rendezett adatok
            },
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