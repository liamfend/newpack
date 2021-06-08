export const formatAccountOwners = ({ cmsUsers }) => {
  if (cmsUsers && cmsUsers.edges) {
    return cmsUsers.edges.map(cmsUser => ({
      name: cmsUser.node.email,
      id: cmsUser.node.id,
    }));
  }

  return [];
};

export const other = () => {};
