const {Model} = require("objection");

class User extends Model {
  static get tableName() {
    return "tasttlig_users";
  }

  static get idColumn() {
    return "tasttlig_user_id";
  }

  static get relationMappings() {
    const Role = require("./roles.js");
    const Subscriptions = require("./subscriptions");

    return {
      roles: {
        relation: Model.ManyToManyRelation,
        modelClass: Role,
        join: {
          from: "tasttlig_users.tasttlig_user_id",
          through: {
            from: "user_role_lookup.user_id",
            to: "user_role_lookup.role_code",
          },
          to: "roles.role_code",
        },
      },
      access: {
        relation: Model.ManyToManyRelation,
        modelClass: require("./app_access"),
        join: {
          from: "tasttlig_users.tasttlig_user_id",
          through: {
            from: "user_app_access.user_id",
            to: "user_app_access.app_id",
          },
          to: "tasttlig_app.id",
        },
      },
      subscriptions: {
        relation: Model.ManyToManyRelation,
        modelClass: Subscriptions,
        join: {
          from: "tasttlig_users.tasttlig_user_id",
          through: {
            from: "user_subscriptions.user_id",
            to: "user_subscriptions.subscription_code",
          },
          to: "subscriptions.subscription_code",
        },
      },
    };
  }
}

module.exports = User;
