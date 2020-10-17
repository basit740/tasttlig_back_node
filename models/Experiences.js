const { Model } = require('objection');

class Experiences extends Model {
  // Table name is the only required property.
  static get tableName() {
    return 'experiences';
  }
  
  static get idColumn() {
    return 'experience_id';
  }
  
  // This object defines the relations to other models.
  static get relationMappings() {
    // Importing models here is a one way to avoid require loops.
    const OrderItems = require('./order_items');
    const ExperienceImages = require('./ExperienceImages');
    return {
      order_items: {
        relation: Model.BelongsToOneRelation,
        modelClass: OrderItems,
        join: {
          from: 'experiences.experience_id',
          to: 'order_items.item_id'
        }
      },
      experience_images: {
        relation: Model.HasManyRelation,
        modelClass: ExperienceImages,
        join: {
          from: 'experiences.experience_id',
          to: 'experience_images.experience_id'
        }
      }
    };
  }
}

module.exports = Experiences;