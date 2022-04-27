const {Model} = require("objection");

class ServiceImages extends Model {
  static get tableName() {
    return "service_images";
  }

  static get idColumn() {
    return "service_image_id";
  }

  static get relationMappings() {
    const Services = require("./services");

    return {
      specials: {
        relation: Model.BelongsToOneRelation,
        modelClass: Services,
        join: {
          from: "service_images.service_id",
          to: "services.services_id",
        },
      },
    };
  }
}

module.exports = ServiceImages;
