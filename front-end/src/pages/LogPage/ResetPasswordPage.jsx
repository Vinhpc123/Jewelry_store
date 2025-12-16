import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthLayout from "../../components/LogPage/auth/AuthLayout";
import IllustrationPanel from "../../components/LogPage/auth/IllustrationPanel";
import PasswordField from "../../components/LogPage/inputs/PasswordField";
import PrimaryButton from "../../components/LogPage/ui/PrimaryButton";
import { resetPassword } from "../../lib/api";
import { KeyRound } from "lucide-react";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!token) {
      setError("Token không hợp lệ hoặc đã hết hạn.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Mật khẩu mới tối thiểu 6 ký tự.");
      return;
    }
    if (password !== confirm) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }
    setLoading(true);
    try {
      const res = await resetPassword(token, password);
      setMessage(res?.data?.message || "Đặt lại mật khẩu thành công. Hãy đăng nhập lại.");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Không thể đặt lại mật khẩu.");
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
            <h1 className="text-zinc-800 text-2xl font-semibold">Đặt lại mật khẩu</h1>
            <p className="text-sm text-zinc-500 mt-1">Nhập mật khẩu mới của bạn.</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <PasswordField
                label="Mật khẩu mới"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                show={showNew}
                setShow={setShowNew}
                leftIcon={<KeyRound className="h-4 w-4" />}
              />
              <PasswordField
                label="Nhập lại mật khẩu mới"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                show={showConfirm}
                setShow={setShowConfirm}
                leftIcon={<KeyRound className="h-4 w-4" />}
              />
              {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <PrimaryButton type="submit" disabled={loading} className="w-full">
                {loading ? "Đang đặt lại..." : "Cập nhật mật khẩu mới"}
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
