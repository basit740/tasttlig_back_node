module.exports = {
	development: {
		client: 'pg',
		connection: {
			database: process.env.DEV_DB_NAME || 'tasttlig_back_node_development',
		},
		migrations: {
			directory: './db/migrations',
			disableMigrationsListValidation: true,
		},
		useNullAsDefault: true,
	},

	staging: {
		client: 'pg',
		connection: {
			database: 'tasttlig_back_node_staging',
		},
		migrations: {
			directory: './db/migrations',
		},
		useNullAsDefault: true,
	},

	production: {
		client: 'pg',
		connection: {
			host: process.env.DB_HOSTNAME,
			database: process.env.DB_NAME,
			user: process.env.DB_USERNAME,
			password: process.env.DB_PASSWORD,
			port: process.env.DB_PORT,
		},
		migrations: {
			directory: './db/migrations',
		},
		useNullAsDefault: true,
	},
	testSupabase: {
		client: 'pg',
		connection: {
			host: 'db.irhuerlohfshhjlpytpw.supabase.co',
			database: 'postgres',
			user: 'postgres',
			password: 'Z)D8wn?Um6ZgMyq',
			port: '5432',
			ssl: { rejectUnauthorized: false }, // if required by Supabase
		},
		migrations: {
			directory: './db/migrations',
			disableMigrationsListValidation: true,
		},
		useNullAsDefault: true,
	},

	test: {
		client: 'sqlite3',
		connection: ':memory:',
		useNullAsDefault: true,
		migrations: {
			directory: './db/migrations',
		},
	},
};
