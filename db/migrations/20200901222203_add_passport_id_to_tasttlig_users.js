const { generateRandomString } = require("../../functions/functions");
exports.up = async function(knex) {
  return knex.select("tasttlig_user_id", "role")
    .from("tasttlig_users")
    .then((tasttlig_users) => {
      const new_tasttlig_users_details = tasttlig_users.map((user) => {
        return { tasttlig_user_id: user.tasttlig_user_id, passport_id: "M" + generateRandomString(6) };
      });
      return knex.transaction((trx) => {
        return trx.schema.table("tasttlig_users", (table) => table.string("passport_id"))
          .then(() => {
            return Promise.all(
              new_tasttlig_users_details.map((row) => {
                return knex('tasttlig_users')
                  .update({ passport_id: row.passport_id })
                  .where('tasttlig_user_id', row.tasttlig_user_id)
                  .transacting(trx);
              })
            );
          })
          .then(trx.commit)
          .catch(trx.rollback);
      });
    })
};

exports.down = function(knex) {
  return knex.schema.table("tasttlig_users", tableBuilder => {
    tableBuilder.dropColumn("passport_id");
  })
};
