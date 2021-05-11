exports.up = function (knex) {
  return knex.schema.alterTable("hosts", (table) => {
    table.string("approval_status");
    table.string("cuisine_type");
    table.boolean("has_hosted_anything_before");
    table.boolean("have_a_restaurant ");
    table.boolean("seating_option");
    table.boolean("want_people_to_discover_your_cuisine");
    table.boolean("able_to_provide_food_samples");
    table.boolean("able_to_explain_the_origins_of_tasting_samples");
    table.boolean("able_to_proudly_showcase_your_culture");
    table.boolean("able_to_provie_private_dining_experience");
    table.boolean("able_to_provide_3_or_more_course_meals_to_guests");
    table.boolean("able_to_provide_live_entertainment");
    table.boolean("able_to_provide_other_form_of_entertainment");
    table.boolean("able_to_provide_games_about_culture_cuisine");
    table.boolean("able_to_provide_excellent_customer_service");
    table.boolean("hosted_tasttlig_festival_before");
    table.boolean("able_to_abide_by_health_safety_regulations");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("hosts", (table) => {
    table.dropColumn("approval_status");
    table.dropColumn("cuisine_type");
    table.dropColumn("has_hosted_anything_before");
    table.dropColumn("have_a_restaurant ");
    table.dropColumn("seating_option");
    table.dropColumn("want_people_to_discover_your_cuisine");
    table.dropColumn("able_to_provide_food_samples");
    table.dropColumn("able_to_explain_the_origins_of_tasting_samples");
    table.dropColumn("able_to_proudly_showcase_your_culture");
    table.dropColumn("able_to_provie_private_dining_experience");
    table.dropColumn("able_to_provide_3_or_more_course_meals_to_guests");
    table.dropColumn("able_to_provide_live_entertainment");
    table.dropColumn("able_to_provide_other_form_of_entertainment");
    table.dropColumn("able_to_provide_games_about_culture_cuisine");
    table.dropColumn("able_to_provide_excellent_customer_service");
    table.dropColumn("hosted_tasttlig_festival_before");
    table.dropColumn("able_to_abide_by_health_safety_regulations");
  });
};
