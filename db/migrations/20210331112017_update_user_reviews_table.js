
exports.up = async function(knex) {
    await knex.raw("update user_reviews set overall_user_experience_rating = null")
    return knex.schema.alterTable("user_reviews", table => {
      table.double("overall_user_experience_rating").alter();
  });
  };
  exports.down = function(knex) {
    return knex.schema.alterTable("user_reviews", table => {
    table.integer("overall_user_experience_rating").alter();
    })
  };
