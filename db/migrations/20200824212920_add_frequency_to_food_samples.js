
exports.up = function(knex) {
    return knex.schema.table("food_samples", table => {
        table.string("frequency");
    });
};

exports.down = function(knex) {
    return knex.schema.table("food_samples", table => {
        table.dropColumn("frequency");
    });
};
