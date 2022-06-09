const {Model} = require("objection");

class FestivalBusinesses extends Model {
  static get tableName() {
    return "festival_businesses";
  }

  static get idColumn() {
    return "id";
  }

  static get relationMappings() {
    const Festivals = require("./festivals.js");
    const Businesses = require("./business_details");

    return {
      festival: {
        relation: Model.BelongsToOneRelation,
        modelClass: Festivals,
        join: {
          from: "festival_businesses.festival_id",
          to: "festivals.festival_id",
        },
      },
      business: {
        relation: Model.BelongsToOneRelation,
        modelClass: Businesses,
        join: {
          from: "festival_businesses.business_id",
          to: "business_details.business_details_id",
        },
      },
    };
  }
}

module.exports = FestivalBusinesses;