const environment = process.env.NODE_ENV;
const supabaseEnv = 'testSupabase';
const config = require('../knexfile')['development'];
const knexPostgis = require('knex-postgis');
const { Model } = require('objection');

const db = require('knex')(config);
const { attachPaginate } = require('knex-paginate');
attachPaginate();
const gis = knexPostgis(db);
Model.knex(db);

console.log(`db config: ${JSON.stringify(config)}`);
db.migrate
	.latest()
	.then(() => console.log('Migration complete'))
	.catch((error) => console.error('Migration failed:', error));

module.exports = {
	db,
	gis,
};
