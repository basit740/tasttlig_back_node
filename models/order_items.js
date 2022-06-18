// Libraries
const {Model} = require("objection");

class OrderItems extends Model {
  // Table name is the only required property.
  static get tableName() {
    return "order_items";
  }

  static get idColumn() {
    return "order_item_id";
  }

  // This object defines the relations to other models.
  static get relationMappings() {
    const Orders = require("./orders");
    const Experiences = require("./experiences");
    return {
      orders: {
        relation: Model.BelongsToOneRelation,
        modelClass: Orders,
        join: {
          from: "order_items.order_id",
          to: "orders.order_id",
        },
      },
      experiences: {
        relation: Model.HasOneRelation,
        modelClass: Experiences,
        join: {
          from: "order_items.item_id",
          to: "experiences.experience_id",
        },
      },
    };
  }
}

module.exports = OrderItems;
