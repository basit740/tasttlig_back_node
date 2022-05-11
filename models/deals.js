const {Model} = require('objection');

module.exports = class Deals extends Model {
  static get tableName() {
    return 'deals';
  }

  static get idColumn() {
    return 'id';
  }
}