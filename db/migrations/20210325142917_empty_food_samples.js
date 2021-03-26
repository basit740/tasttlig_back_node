exports.up = function (knex){
    return knex("food_samples")
    .where('food_sample_id', '>', 0)
    .del()

  };
    

exports.down = function (knex) {
    return knex.schema.table("food_samples", () => {});
  };


  