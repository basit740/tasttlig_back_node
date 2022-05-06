exports.up = function (knex) {
return knex.schema.table("cart_items", (table) => {
    table
      .integer("user_id")
      .references("tasttlig_user_id")
      .inTable("tasttlig_users");
    table.integer("item_id");
    table.string("item_type");
    table.decimal("amount");
    table.dropColumn("status");
    table.dropColumn("experience_id");
    table.dropColumn("created_at");
    table.dropColumn("updated_at");
    });
};

exports.down = function (knex) {
return knex.schema.table("cart_items", (table) => {
    table.dropColumn("user_id");
    table.dropColumn("item_id");
    table.dropColumn("item_type");
    table.dropColumn("amount");
    table.string("status").notNullable();
    table.integer("experience_id").defaultTo(null);
    table.string("created_at").notNullable();
    table.string("updated_at").notNullable();
    });
};