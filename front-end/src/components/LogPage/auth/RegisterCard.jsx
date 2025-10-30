import { Link } from "react-router-dom";
import RegisterForm from "./RegisterForm";

export default function RegisterCard() {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-8 lg:p-10">
      <h1 className="text-zinc-800 text-2xl font-semibold">Tạo tài khoản</h1>
      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 bg-gradient-to-br from-indigo-500 to-violet-500 bg-clip-text text-transparent">
        Jewelry Store
      </h2>
      <div className="mt-8">
        <RegisterForm />
      </div>
      <p className="text-center text-sm text-zinc-500 mt-8">
        Bạn đã có tài khoản rồi?{' '}
        <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-medium">Đăng nhập</Link>
      </p>
    </div>
  );
}