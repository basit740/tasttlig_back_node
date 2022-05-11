const {Model} = require("objection");

class Services extends Model {
  static get tableName() {
    return "services";
  }

  static get idColumn() {
    return "service_id";
  }

  static get relationMappings() {
    const OrderItems = require("./order_items");
    const ServiceImages = require("./service_images");
    return {
      order_items: {
        relation: Model.BelongsToOneRelation,
        modelClass: OrderItems,
        join: {
          from: "services.services_id",
          to: "order_items.item_id",
        },
      },
      special_images: {
        relation: Model.HasManyRelation,
        modelClass: ServiceImages,
        join: {
          from: "services.services_id",
          to: "service_images.services_id",
        },
      },
    };
  }
}

module.exports = Services;
