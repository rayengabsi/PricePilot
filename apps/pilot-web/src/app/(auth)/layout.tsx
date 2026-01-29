/**
 * Auth layout: login and register
 * Centered card layout with PricePilot branding
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center py-12">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
