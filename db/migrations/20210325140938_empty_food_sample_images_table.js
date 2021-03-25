exports.up = function (knex){
    return knex("food_sample_images")
    .where('food_sample_image_id', '>', 0)
    .del()

  };
    

exports.down = function (knex) {
    return knex.schema.table("food_sample_images", () => {});
  };


  