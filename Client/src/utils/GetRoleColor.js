
export const GetRoleColor = (role) => {
  const roleColors = {
    admin: 'bg-red-500/2 border-red-500/15',
    moderator: 'bg-yellow-500/2  border-yellow-500/15',
    leader: 'bg-blue-500/2  border-blue-500/15',
    member: 'bg-green-500/2  border-green-500/15',
    viewer: 'bg-zinc-500/2  border-zinc-500/15',
  };

  return roleColors[role?.toLowerCase()] || 'bg-zinc-500/2 border-zinc-500/15';
};
