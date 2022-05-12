const {Model} = require("objection");

class UserSubscriptions extends Model {
  static Status = Object.freeze({
    Incomplete: 'incomplete',
    IncompleteExpired: 'incomplete_expired',
    Trialing: 'trialing',
    Active: 'active',
    PastDue: 'past_due',
    Canceled: 'canceled',
    Unpaid: 'unpaid'
  });

  static get tableName() {
    return "user_subscriptions";
  }

  static get idColumn() {
    return "user_subscription_id";
  }

  static get relationMappings() {
    const Subscriptions = require("./subscriptions");
    const Users = require("./users");

    return {
      subscription: {
        relation: Model.BelongsToOneRelation,
        modelClass: Subscriptions,
        join: {
          from: "user_subscriptions.subscription_code",
          to: "subscriptions.subscription_code",
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: "user_subscriptions.user_id",
          to: "tasttlig_users.tasttlig_user_id",
        },
      },
    };
  }
}

module.exports = UserSubscriptions;