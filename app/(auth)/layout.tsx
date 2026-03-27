export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-black text-white">
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        {children}
      </div>
    </div>
  );
}
