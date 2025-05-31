
export const GetStatusColor = (status) => {
  const statusColors = {
    'new task': 'bg-blue-100 text-blue-700 border-blue-300',
    'in progress': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'under review': 'bg-purple-100 text-purple-700 border-purple-300',
    'completed': 'bg-green-100 text-green-700 border-green-300',
  };

  return statusColors[status?.toLowerCase()] || 'bg-zinc-100 text-zinc-700 border-zinc-300';
};