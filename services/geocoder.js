const NodeGeocoder = require('node-geocoder');
const geocoder = NodeGeocoder({
    provider: 'mapquest',
    httpAdapter: 'https',
    apiKey: 'TrIwDiPg5enADFGyxh80IS19jO2v1WUn',
    formatter: null
});

module.exports = geocoder;