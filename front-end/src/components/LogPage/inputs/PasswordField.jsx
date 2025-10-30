import { Eye, EyeOff } from "lucide-react";

export default function PasswordField({ label, value, onChange, show, setShow, leftIcon }) {
  return (
    <label className="block text-sm">
      <span className="text-zinc-600 mb-1 inline-block">{label}</span>
      <div className="relative">
        {leftIcon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="inline-flex h-9 w-9 items-center justify-center text-zinc-400">
              {leftIcon}
            </span>
          </span>
        )}
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          className={`w-full rounded-xl border border-zinc-200 bg-white ${leftIcon ? "pl-12" : "pl-3"} pr-11 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-zinc-800 placeholder:text-zinc-400`}
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  );
}