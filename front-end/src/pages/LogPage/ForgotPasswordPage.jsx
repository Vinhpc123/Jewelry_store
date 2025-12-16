import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/LogPage/auth/AuthLayout";
import IllustrationPanel from "../../components/LogPage/auth/IllustrationPanel";
import LabeledInput from "../../components/LogPage/inputs/LabeledInput";
import PrimaryButton from "../../components/LogPage/ui/PrimaryButton";
import { requestPasswordReset } from "../../lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!email.trim()) {
      setError("Vui lòng nhập email.");
      return;
    }
    setLoading(true);
    try {
      const res = await requestPasswordReset(email.trim());
      setMessage(res?.data?.message || "Nếu email hợp lệ, chúng tôi đã gửi hướng dẫn.");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Không thể gửi yêu cầu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen">
      <div className="absolute inset-0">
        <div className="relative h-full w-full [&>div]:absolute [&>div]:bottom-0 [&>div]:right-0 [&>div]:z-[-2] [&>div]:h-full [&>div]:w-full [&>div]:bg-gradient-to-b [&>div]:from-blue-200 [&>div]:to-white">
          <div></div>
        </div>
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
        <AuthLayout>
          <IllustrationPanel />
          <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-8 lg:p-10">
            <h1 className="text-zinc-800 text-2xl font-semibold">Quên mật khẩu</h1>
            <p className="text-sm text-zinc-500 mt-1">Nhập email để nhận link đặt lại.</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <LabeledInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
              />
              {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <PrimaryButton type="submit" disabled={loading} className="w-full">
                {loading ? "Đang gửi..." : "Gửi hướng dẫn"}
              </PrimaryButton>
            </form>
            <p className="text-center text-sm text-zinc-500 mt-6">
              <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Quay lại đăng nhập
              </Link>
            </p>
          </div>
        </AuthLayout>
      </div>
    </div>
  );
}
