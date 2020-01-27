const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

module.exports = {
  createFood: async (food, user_id) => {
    const name = food.name;
    const food_ethnicity = food.food_ethnicity;
    const img_url_1 = food.img_url_1;
    const img_url_2 = food.img_url_2;
    const img_url_3 = food.img_url_3;
    const price = food.price;
    const postal_code = food.postal_code;
    const address_line_1 = food.address_line_1;
    const address_line_2 = food.address_line_2;
    const city = food.city;
    const province = food.province;
    const description = food.description;
    try {
      const returning = await db("foods")
        .insert({
          name,
          user_id,
          food_ethnicity,
          img_url_1,
          img_url_2,
          img_url_3,
          price,
          postal_code,
          address_line_1,
          address_line_2,
          city,
          province,
          description
        })
        .returning("*");

      if (returning) return (response = { success: true, user: returning[0] });
    } catch (err) {
      return (response = { success: false, data: err });
    }
  },
  getUserFood: async user_id => {
    try {
      const returning = await db("foods").where("user_id", user_id);
      return (response = { success: true, foods: returning });
    } catch (err) {
      return (response = { success: false, message: "No food found" });
    }
  },
  getAllFood: async () => {
    try {
      const returning = await db("foods");
      return (response = { success: true, foods: returning });
    } catch (err) {
      return (response = { success: false, message: "No food found" });
    }
  }
};
