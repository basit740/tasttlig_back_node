"use strict";

// Add role helper function
const addRole = (currentRole, newRole) => {
  currentRole.push(newRole);
  return currentRole;
};

// Remove role helper function
const removeRole = (currentRole, deleteRole) => {
  currentRole.splice(currentRole.indexOf(deleteRole), 1);
  return currentRole;
};

// Create role object helper function
const createRoleObject = (roleInString) => {
  return roleInString.split(",");
};

// Create role string helper function
const createRoleString = (roleInObject) => {
  return roleInObject.join(",");
};

const role_manager = {
  addRole,
  removeRole,
  createRoleObject,
  createRoleString,
};

module.exports = role_manager;
