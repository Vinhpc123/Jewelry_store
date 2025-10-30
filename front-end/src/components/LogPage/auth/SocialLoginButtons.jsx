import GoogleIcon from "../icons/GoogleIcon";

export default function SocialLoginButtons() {
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => alert("Google login")}
        className="w-full inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <GoogleIcon className="h-5 w-5" />
        <span className="ml-3">Đăng nhập với Google</span>
      </button>
    </div>
  );
}