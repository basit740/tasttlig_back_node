const auth_server_service = require("../../services/authentication/auth_server_service");
const { generateRandomString } = require("../../functions/functions");

exports.up = function (knex) {
  return knex.schema
    .table("tasttlig_users", (table) => {
      table.integer("auth_user_id");
      table.dropColumn("password");
    })
    .then(() => {
      return knex("tasttlig_users")
        .select("tasttlig_user_id", "email", "passport_id")
        .then((db_users) => {
          return knex.transaction((trx) => {
            return Promise.all(
              db_users.map(async (db_user) => {
                const { success, user } = await auth_server_service.authSignup(
                  db_user.email,
                  generateRandomString(8),
                  db_user.passport_id
                );
                return trx("tasttlig_users")
                  .update({ auth_user_id: user.id })
                  .where("tasttlig_user_id", "=", db_user.tasttlig_user_id)
                  .transacting(trx);
              })
            )
              .then(() => {
                trx.commit();
                return knex
                  .select(
                    "tasttlig_users.auth_user_id",
                    "user_role_lookup.role_code"
                  )
                  .from("tasttlig_users")
                  .leftJoin(
                    "user_role_lookup",
                    "tasttlig_users.tasttlig_user_id",
                    "user_role_lookup.user_id"
                  )
                  .then(async (role_codes) => {
                    await role_codes.map(async (db_user_with_role_code) => {
                      const { success, user } =
                        await auth_server_service.authAddRole(
                          db_user_with_role_code.auth_user_id,
                          db_user_with_role_code.role_code
                        );
                    });
                  });
              })
              .catch(trx.rollback);
          });
        });
    });
};

exports.down = function (knex) {
  return knex.schema.table("tasttlig_users", (table) => {
    table.dropColumn("auth_user_id");
    table.string("password");
  });
};
