// Példa segédprogram
// src/utils/logger.js

const log = (message, level = 'INFO') => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${level}: ${message}`);
};

const error = (message) => log(message, 'ERROR');
const warn = (message) => log(message, 'WARN');
const info = (message) => log(message, 'INFO');

module.exports = { log, error, warn, info };