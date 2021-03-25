exports.up = function(knex) {
    return knex.schema.alterTable("all_products", table => {
      table.renameColumn("food_sample_id", "product_id");
      table.renameColumn("food_sample_creater_user_id", "product_user_id");
      table.integer("product_business_id").unsigned().index()
      .references("business_details_id").inTable("business_details");
      table.renameColumn("food_sample_type", "product_type");
           

    });
  };
  exports.down = function(knex) {
    return knex.schema.alterTable("all_products", table => {
        table.renameColumn("product_id","food_sample_id");
        table.renameColumn("product_user_id","food_sample_creater_user_id");
        table.dropColumn("product_business_id");
        table.renameColumn("product_type", "food_sample_type");
    });
  };