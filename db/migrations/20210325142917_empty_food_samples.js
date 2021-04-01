<<<<<<< HEAD
<<<<<<< HEAD
exports.up = async function (knex) {
  await knex.raw("update food_sample_claims set food_sample_id = null");
  return knex("food_samples").where("food_sample_id", ">", 0).del();
};
=======
=======
>>>>>>> 6586c5f1ea7be9135c49dbad5d18f96a4c787de5
exports.up = async function (knex){
    //  await knex.raw("update food_sample_claims set food_sample_id = null")
    //  return knex("food_samples")
    //  .where('food_sample_id', '>', 0)
    //  .del()
​
  };
<<<<<<< HEAD
>>>>>>> 91539a3257e4a433529d0bbdf4b8ba7a38f8ce6b
=======
>>>>>>> 6586c5f1ea7be9135c49dbad5d18f96a4c787de5
exports.down = function (knex) {
  return knex.schema.table("food_samples", () => {});
};
