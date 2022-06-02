const {Model} = require("objection");

module.exports = class UserRoles extends Model {
  static get tableName() {
    return "user_role_lookup";
  }

  static get idColumn() {
    return "user_role_lookup_id";
  }

  static get relationMappings() {
    const Roles = require("./roles");
    const Users = require("./users");

    return {
      role: {
        relation: Model.BelongsToOneRelation,
        modelClass: Roles,
        join: {
          from: "user_role_lookup.role_code",
          to: "roles.role_code",
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: "user_role_lookup.user_id",
          to: "tasttlig_users.tasttlig_user_id",
        },
      },
    };
  }
};
