const {Model} = require("objection");

class Experiences extends Model {
  static get tableName() {
    return "experiences";
  }

  static get idColumn() {
    return "experience_id";
  }

  static get relationMappings() {
    const OrderItems = require("./order_items");
    const ExperienceImages = require("./experience_images");
    return {
      order_items: {
        relation: Model.BelongsToOneRelation,
        modelClass: OrderItems,
        join: {
          from: "experiences.experience_id",
          to: "order_items.item_id",
        },
      },
      experience_images: {
        relation: Model.HasManyRelation,
        modelClass: ExperienceImages,
        join: {
          from: "experiences.experience_id",
          to: "experience_images.experience_id",
        },
      },
    };
  }
}

module.exports = Experiences;
