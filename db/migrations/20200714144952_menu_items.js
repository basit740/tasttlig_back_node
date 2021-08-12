exports.up = function (knex) {
  return knex.schema.createTable("menu_items", (table) => {
    table.increments("menu_item_id").unsigned().primary();
    table
      .integer("menu_id")
      .unsigned()
      .index()
      .references("menu_id")
      .inTable("menus");
    table.string("menu_item_code");
    table.string("image_url");
    table.string("name");
    table.decimal("price");
    table.decimal("quantity");
    table.string("quantity_type");
    table.boolean("is_vegetartian");
    table.boolean("is_vegan");
    table.boolean("is_gluten_free");
    table.boolean("is_halal");
    table.integer("spice_level");
    table.text("description");
    table.integer("discount");
    table.string("discount_type");
    table.boolean("is_verified");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("menu_items");
};
