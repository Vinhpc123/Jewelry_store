export default function LabeledInput({ label, icon, className, ...props }) {
  return (
    <label className="block text-sm">
      <span className="text-zinc-600 mb-1 inline-block">{label}</span>
      <div className={`relative`}>
        {icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="inline-flex h-9 w-9 items-center justify-center text-zinc-400">
              {icon}
            </span>
          </span>
        )}
        <input
          {...props}
          className={`w-full rounded-xl border border-zinc-200 bg-white ${icon ? "pl-12" : "pl-3"} pr-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-zinc-800 placeholder:text-zinc-400 ${className ?? ""}`}
        />
      </div>
    </label>
  );
}