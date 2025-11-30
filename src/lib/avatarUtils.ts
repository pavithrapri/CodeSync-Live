export const getUserColor = (username: string): string => {
  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(210, 100%, 60%)", 
    "hsl(340, 82%, 52%)", 
    "hsl(291, 64%, 42%)", 
    "hsl(142, 71%, 45%)", 
    "hsl(25, 95%, 53%)", 
  ];

  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

// Get user initials from username
export const getUserInitials = (username: string): string => {
  if (!username) return "?";
  
  const parts = username.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  
  return username.slice(0, 2).toUpperCase();
};
