const {Model} = require('objection');

module.exports = class Deal extends Model {
  static get tableName() {
    return 'deals';
  }

  static get idColumn() {
    return 'id';
  }
}