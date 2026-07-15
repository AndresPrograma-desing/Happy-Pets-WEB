export const getAvatarInitial = (name) => {
  if (!name) return '?';
  return name.trim().charAt(0).toUpperCase();
};

export const stringToColor = (str) => {
  if (!str) return '#0f6e52';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
};