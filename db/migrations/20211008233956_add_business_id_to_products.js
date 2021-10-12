exports.up = async function (knex) {
  const exists = await knex.schema.hasColumn("products", "product_business_id");
  if (!exists) {
    return knex.schema.table("products", (table) => {
      table.integer("product_business_id");
    });
  }
};

exports.down = function (knex) {
  return knex.schema.table("products", (table) => {
    table.dropColumn("product_business_id");
  });
};
