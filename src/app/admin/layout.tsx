export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-nature-50 text-nature-950">
      {children}
    </div>
  );
}
