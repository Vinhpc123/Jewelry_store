import { useState } from "react";
import { Mail, Eye, EyeOff, KeyRound } from "lucide-react";
import LabeledInput from "../inputs/LabeledInput";
import PasswordField from "../inputs/PasswordField";
import Checkbox from "../ui/Checkbox";
import PrimaryButton from "../ui/PrimaryButton";
import { login, setAuthToken, setUser } from "../../../lib/api";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);

  function onSubmit(e) {
    e.preventDefault();
    // keep old behavior for quick debug
  }

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const { data } = await login({ email, password });
      if (data.token) {
        setAuthToken(data.token);
        // store basic user info for client-side role checks
        if (data.user) setUser(data.user);
      }
      alert("Đăng nhập thành công");
      // Redirect admin users to admin area, others to home
      const role = data?.user?.role;
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Lỗi đăng nhập";
      alert(message);
    }
  
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <LabeledInput
        label="Email"
        icon={<Mail className="h-4 w-4 text-zinc-400" />}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="example@gmail.com"
      />

      <PasswordField
        label="Mật khẩu"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        show={show}
        setShow={setShow}
        leftIcon={<KeyRound className="h-4 w-4" />}
      />

      <div className="flex items-center justify-between">
        <Checkbox checked={remember} onCheckedChange={setRemember} label="Nhớ mật khẩu" />
        <a href="#" className="text-sm text-zinc-500 hover:text-zinc-700">Quên mật khẩu?</a>
      </div>

      <PrimaryButton type="submit" onClick={handleLogin} className="w-full">Đăng nhập</PrimaryButton>
    </form>
  );
}