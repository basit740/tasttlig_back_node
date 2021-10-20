exports.up = async function (knex) {
    const exists = await knex.schema.hasColumn("experiences", "deal_id");
    if (!exists) {
      return knex.schema.table("experiences", (table) => {
        table.integer("deal_id");
      });
    }
  };
  
  exports.down = function (knex) {
    return knex.schema.table("experiences", (table) => {
       table.dropColumn("deal_id");
    });
  };
  