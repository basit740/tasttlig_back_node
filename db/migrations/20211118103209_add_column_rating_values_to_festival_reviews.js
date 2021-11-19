exports.up = function (knex) {
  return knex.schema.alterTable("festival_reviews", (table) => {
    table.integer("excellence");
    table.integer("xenial");
    table.integer("polite");
    table.integer("ethical");
    table.integer("receptive");
    table.integer("impressive");
    table.integer("ecofriendly");
    table.integer("novel");
    table.integer("clean");
    table.integer("enjoyable");
  });
};
exports.down = function (knex) {
  return knex.schema.alterTable("festival_reviews", (table) => {
    table.dropColumn("excellence");
    table.dropColumn("xenial");
    table.dropColumn("polite");
    table.dropColumn("ethical");
    table.dropColumn("receptive");
    table.dropColumn("impressive");
    table.dropColumn("ecofriendly");
    table.dropColumn("novel");
    table.dropColumn("clean");
    table.dropColumn("enjoyable");
  });
};
