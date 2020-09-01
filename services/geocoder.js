const NodeGeocoder = require('node-geocoder');
const geocoder = NodeGeocoder({
    provider: 'mapquest',
    httpAdapter: 'https',
    apiKey: process.env.MAPQUEST_KEY,
    formatter: null
});

module.exports = geocoder;