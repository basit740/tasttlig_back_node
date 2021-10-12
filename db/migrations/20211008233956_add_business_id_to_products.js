<<<<<<< HEAD
exports.up = function (knex) {
  return knex.schema.table("products", async (table) => {
    await knex.raw(`UPDATE products p SET product_business_id = business_details_id FROM business_details b WHERE b.business_details_user_id=p.product_user_id`);
    return knex.schema.table("products", (t) => {
      t.dropColumn("product_user_id")
    })
  });
};

exports.down = function (knex) {
  return knex.schema.table("products", async (table) => {
    await knex.raw(`UPDATE products p SET product_user_id = business_details_user_id FROM business_details b WHERE b.business_details_id=p.product_business_details_id`);
    return knex.schema.table("products", (t) => {
      t.dropColumn("product_business_id")
    })
=======
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
>>>>>>> 1729640c94a06ae00bf32a6fb08fdecab945f0b2
  });
};
