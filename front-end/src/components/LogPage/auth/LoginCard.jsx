import OrDivider from "../ui/OrDivider";
import LoginForm from "./LoginForm";
import SocialLoginButtons from "./SocialLoginButtons";

export default function LoginCard() {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-8 lg:p-10">
      <h1 className="text-zinc-800 text-2xl font-semibold">Welcome to</h1>
      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 bg-gradient-to-br from-indigo-500 to-violet-500 bg-clip-text text-transparent">
        Jewelry Store
      </h2>
      <div className="mt-8 space-y-3">
        <SocialLoginButtons />
        <OrDivider />
        <LoginForm />
      </div>
      <p className="text-center text-sm text-zinc-500 mt-8">
        Bạn đã có tài khoản chưa?{' '}
        <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">Đăng ký</Link>
      </p>
    </div>
  );
}
import { Link } from "react-router-dom";
