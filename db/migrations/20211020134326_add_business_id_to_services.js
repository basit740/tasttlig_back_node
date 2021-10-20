exports.up = async function (knex) {
    const exists = await knex.schema.hasColumn("services", "deal_id");
    if (!exists) {
      return knex.schema.table("services", (table) => {
        table.integer("deal_id");
      });
    }
  };
  
  exports.down = function (knex) {
    return knex.schema.table("services", (table) => {
      table.dropColumn("deal_id");
    });
  };
  