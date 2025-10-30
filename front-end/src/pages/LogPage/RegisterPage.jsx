import AuthLayout from "../../components/LogPage/auth/AuthLayout";
import IllustrationPanel from "../../components/LogPage/auth/IllustrationPanel";
import RegisterCard from "../../components/LogPage/auth/RegisterCard";

export default function RegisterPage() {
  return (
    <div className="relative h-screen">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="relative h-full w-full [&>div]:absolute [&>div]:bottom-0 [&>div]:right-0 [&>div]:z-[-2] [&>div]:h-full [&>div]:w-full [&>div]:bg-gradient-to-b [&>div]:from-blue-200 [&>div]:to-white">
          <div></div>
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
        <AuthLayout>
        <IllustrationPanel />
        <RegisterCard />
        </AuthLayout>
      </div>

      {/* Auth layout overlay */}
      
    </div>
  );
}
