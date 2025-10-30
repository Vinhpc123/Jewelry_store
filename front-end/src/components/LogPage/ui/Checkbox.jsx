import { Check } from "lucide-react";

export default function Checkbox({ checked, onCheckedChange, label }) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none text-sm text-zinc-600">
      <span
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") onCheckedChange(!checked);
        }}
        onClick={() => onCheckedChange(!checked)}
        className={`h-5 w-5 rounded-md border grid place-items-center transition ${
          checked ? "bg-indigo-600 border-indigo-600" : "bg-white border-zinc-300"
        }`}
      >
        {checked && <Check className="h-3.5 w-3.5 text-white" />}
      </span>
      {label}
    </label>
  );
}

