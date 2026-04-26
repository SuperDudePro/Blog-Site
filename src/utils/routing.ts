export function normalizePath(path: string) {
  const cleanPath = path || "/";
  if (cleanPath.length > 1 && cleanPath.endsWith("/")) {
    return cleanPath.slice(0, -1);
  }
  return cleanPath;
}
