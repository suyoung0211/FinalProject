export function resolveImage(path?: string) {
  if (!path) return null;
  if (path.startsWith("http")) return path;

  return `http://localhost:8080/${path}`;
}