
exports.up = function(knex) {
    return knex.schema.alterTable("experiences", (table) => {
        table.specificType("experience_business_list", "INT[]");
        table.string("experience_theme");
        table.string("experience_rule");
    });
    
};

exports.down = function(knex) {
    return knex.schema.alterTable("experiences", (table) => {
        table.dropColumn("experience_business_list");
        table.dropColumn("experience_theme");
        table.dropColumn("experience_rule");
    });
};
