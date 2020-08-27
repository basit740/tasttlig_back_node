exports.up = function(knex) {
    return knex.schema.table("food_samples", table => {
        table
            .integer("nationality_id")
            .unsigned()
            .index()
            .references("id")
            .inTable("nationalities");
    });
};

exports.down = function(knex) {
    return knex.schema.table("food_samples", table => {
        table.dropColumn("nationality_id");
    });
};