// Libraries
const {Model} = require("objection");

class ExperienceImages extends Model {
  // Table name is the only required property.
  static get tableName() {
    return "experience_images";
  }

  static get idColumn() {
    return "experience_image_id";
  }

  // This object defines the relations to other models.
  static get relationMappings() {
    const Experiences = require("./experiences");

    return {
      experiences: {
        relation: Model.BelongsToOneRelation,
        modelClass: Experiences,
        join: {
          from: "experience_images.experience_id",
          to: "experiences.experience_id",
        },
      },
    };
  }
}

module.exports = ExperienceImages;
