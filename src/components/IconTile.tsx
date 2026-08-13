/** SF-Symbol-style rounded-square icon tile with a solid color fill. */
export default function IconTile({
  color,
  children,
  size = 30,
}: {
  color: string;
  children: React.ReactNode;
  size?: number;
}) {
  return (
    <span
      className="tile"
      style={{ background: color, width: size, height: size, borderRadius: size * 0.23 }}
    >
      {children}
    </span>
  );
}

// A few tasteful, iOS-like accent colors for tiles.
export const TILE = {
  pink: "#ff2d78",
  rose: "#ff4d8d",
  purple: "#af52de",
  indigo: "#5e5ce6",
  blue: "#0a84ff",
  teal: "#30b0c7",
  green: "#34c759",
  orange: "#ff9500",
  red: "#ff3b30",
  gray: "#8e8e93",
};
