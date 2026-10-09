/** Re-mounts on every navigation, giving each route a soft blur-to-sharp entrance. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
