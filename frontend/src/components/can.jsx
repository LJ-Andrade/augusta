import React from 'react';

export const hasPermission = (permission) => {
  const userPermissions = JSON.parse(localStorage.getItem('USER_PERMISSIONS') || '[]');
  const userRoles = JSON.parse(localStorage.getItem('USER_ROLES') || '[]');
  
  const isSuperAdmin = userRoles.includes('Super Admin');
  const hasPerm = userPermissions.includes(permission);

  return isSuperAdmin || hasPerm;
};

export const isSuperAdmin = () => {
  const userRoles = JSON.parse(localStorage.getItem('USER_ROLES') || '[]');
  return userRoles.includes('Super Admin');
};

const Can = ({ permission, children }) => {
  if (hasPermission(permission)) {
    return children;
  }

  return null;
};

export default Can;
