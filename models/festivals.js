const {Model} = require("objection");

class Festivals extends Model {
  static Category = Object.freeze({
    Cultural: 'cultural',
    MultiCultural: 'multiCultural',
    Traditional: 'traditional'
  });

  static get tableName() {
    return "festivals";
  }

  static get idColumn() {
    return "festival_id";
  }

  static get relationMappings() {
    const Businesses = require("./business_details");

    return {
      businesses: {
        relation: Model.ManyToManyRelation,
        modelClass: Businesses,
        join: {
          from: "festivals.festival_id",
          through: {
            from: "festival_businesses.festival_id",
            to: "festival_businesses.business_id",
          },
          to: "business_details.business_detail_id",
        },
      },
    };
  }
}

module.exports = Festivals;