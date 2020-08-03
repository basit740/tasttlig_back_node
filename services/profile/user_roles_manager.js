"use strict";

const addRole = (currentRole, newRole) => {
  currentRole.push(newRole);
  return currentRole;
}

const removeRole = (currentRole, deleteRole) => {
  return currentRole.splice(currentRole.indexOf(deleteRole), 1);
}

const createRoleObject = (roleInString) => {
  return roleInString.split(",");
}

const createRoleString = (roleInObject) => {
  return roleInObject.join(",");
}

const role_manager = {
  addRole,
  removeRole,
  createRoleObject,
  createRoleString
};

module.exports = role_manager;