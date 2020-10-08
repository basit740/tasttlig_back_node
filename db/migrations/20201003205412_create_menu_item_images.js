exports.up = function (knex) {
  return knex.schema.createTable("menu_item_images", table => {
    table.increments("menu_item_image_id").unsigned().primary();
    table.integer("menu_item_id").unsigned().index()
      .references("menu_item_id").inTable("menu_items");
    table.string("image_url").notNullable();
  }).then(() => {
    return knex.schema.raw(`
    with m as
         (select menu_items.menu_item_id as id, menu_items.image_url as image from menu_items where menu_items.image_url is not null)
    insert
    into menu_item_images(menu_item_id, image_url)
    select m.id, m.image
    from m
    `);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("menu_item_images");
};
