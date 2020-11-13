const { Model } = require('objection');

class BusinessDetails extends Model {
  // Table name is the only required property.
  static get tableName() {
    return 'business_details';
  }
  
  static get idColumn() {
    return 'business_id';
  }
}

module.exports = BusinessDetails;