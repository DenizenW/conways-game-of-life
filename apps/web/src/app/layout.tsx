import './global.css';

export const metadata = {
  title: "Conway's Game of Life",
  description: 'Interactive cellular automaton simulation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
