exports.up = function (knex) {
  return knex.schema.alterTable("menu_items", function (table) {
    table.renameColumn(
      "food_sample_creater_user_id",
      "menu_item_creator_user_id"
    );
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("menu_items", function (table) {
    table.renameColumn(
      "menu_item_creator_user_id",
      "food_sample_creater_user_id"
    );
  });
};
