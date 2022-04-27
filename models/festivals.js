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
}

module.exports = Festivals;