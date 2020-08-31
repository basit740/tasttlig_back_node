exports.up = function(knex) {
    return knex.schema.table("food_samples", table => {
        table.specificType("coordinates", "geometry(point, 4326)");
    });
};

exports.down = function(knex) {
    return knex.schema.table("food_samples", table => {
        table.dropColumn("coordinates");
    });
};
