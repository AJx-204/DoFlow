
export const GetPriorityColor = (priority) => {
  const priorityColors = {
    'low': 'bg-green-100 text-green-700 border-green-300',
    'medium': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'high': 'bg-orange-100 text-orange-700 border-orange-300',
    'very high': 'bg-red-100 text-red-700 border-red-300',
  };

  return priorityColors[priority?.toLowerCase()] || 'bg-zinc-100 text-zinc-700 border-zinc-300';
};
