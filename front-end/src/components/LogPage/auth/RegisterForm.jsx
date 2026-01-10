import { useState } from "react";
import { Mail, User, KeyRound } from "lucide-react";
import LabeledInput from "../inputs/LabeledInput";
import PasswordField from "../inputs/PasswordField";
import Checkbox from "../ui/Checkbox";
import PrimaryButton from "../ui/PrimaryButton";
import { signup, setAuthToken } from "../../../lib/api";
import { useToast } from "../../ui/ToastContext";
import { useNavigate } from "react-router-dom";

export default function RegisterForm() {
  // UI-only: keep minimal state for inputs & toggles, no validation or API.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(true);

  function onSubmit(ev) {
    ev.preventDefault(); // UI-only: do nothing
  }

  const navigate = useNavigate();
  const { toast } = useToast();

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirm) {
      toast.error("Mật khẩu và xác nhận mật khẩu không khớp");
      return;
    }

    try {
      const { data } = await signup({ name, email, password });
      // If backend returns token, store it and navigate to home
      if (data.token) {
        setAuthToken(data.token);
      }
      toast.success("Đăng ký thành công!");
      navigate("/");
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Lỗi đăng ký";
      toast.error(message);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <LabeledInput
        label="Họ và tên"
        icon={<User className="h-4 w-4 text-zinc-400" />}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nguyễn Văn A"
      />

      <LabeledInput
        label="Email"
        type="email"
        icon={<Mail className="h-4 w-4 text-zinc-400" />}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="example@gmail.com"
      />

      <PasswordField
        label="Mật khẩu"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        show={showPwd}
        setShow={setShowPwd}
        leftIcon={<KeyRound className="h-4 w-4" />}
      />

      <PasswordField
        label="Xác nhận mật khẩu"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        show={showConfirm}
        setShow={setShowConfirm}
        leftIcon={<KeyRound className="h-4 w-4" />}
      />

      <Checkbox checked={agree} onCheckedChange={setAgree} label={
        <span> Đồng ý với các <a href="#" className="text-indigo-600 hover:text-indigo-700">Điều khoản</a> và <a href="#" className="text-indigo-600 hover:text-indigo-700">Chính sách bảo mật</a>.</span>
      } />

      <PrimaryButton type="submit" onClick={handleSubmit} className="w-full">Tạo tài khoản</PrimaryButton>
    </form>
  );
}

