export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {children}
      </div>
    </div>
  );
}