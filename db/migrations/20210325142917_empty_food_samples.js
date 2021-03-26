<<<<<<< HEAD
exports.up = function (knex){
    return knex("food_samples")
    .where('food_sample_id', '>', 0)
    .del()

  };
    

exports.down = function (knex) {
    return knex.schema.table("food_samples", () => {});
  };


  
=======
exports.up = async function (knex){
    //  await knex.raw("update food_sample_claims set food_sample_id = null")
    //  return knex("food_samples")
    //  .where('food_sample_id', '>', 0)
    //  .del()
  };
exports.down = function (knex) {
    // return knex.schema.table("food_samples", () => {});
  };
>>>>>>> 43a4ceb74336840fb13065a39d1ac4b0c9e44340
