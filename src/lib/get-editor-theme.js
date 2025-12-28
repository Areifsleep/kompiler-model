export const getEditorTheme = (theme) => {
  if (theme === "dark") return "dark";
  if (theme === "light") return "light";
  // system theme
  const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return isSystemDark ? "dark" : "light";
};
