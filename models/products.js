const {Model} = require("objection");

class Products extends Model {
  static get tableName() {
    return "products";
  }

  static get idColumn() {
    return "product_id";
  }

  static get relationMappings() {
    const BusinessDetails = require("./business_details");

    return {
      business: {
        relation: Model.HasManyRelation,
        modelClass: BusinessDetails,
        join: {
          from: "products.product_business_id",
          to: "business_details.business_details_id",
        },
      }
    };
  }
}

module.exports = Products;