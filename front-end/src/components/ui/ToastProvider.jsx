import { useCallback, useMemo, useState } from "react";
import { ToastContext } from "./ToastContext";

let toastId = 0;

const TOAST_META = {
  success: {
    title: "Success",
    bar: "bg-emerald-500",
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-600",
    border: "border-emerald-100",
    icon: (
      <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M8.6 13.2 5.4 10l-1.4 1.4 4.6 4.6L16 8.6 14.6 7z" />
      </svg>
    ),
  },
  error: {
    title: "Error",
    bar: "bg-red-500",
    iconBg: "bg-red-100",
    iconText: "text-red-600",
    border: "border-red-100",
    icon: (
      <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M11.4 10 16 5.4 14.6 4 10 8.6 5.4 4 4 5.4 8.6 10 4 14.6 5.4 16 10 11.4 14.6 16 16 14.6z" />
      </svg>
    ),
  },
  info: {
    title: "Info",
    bar: "bg-sky-500",
    iconBg: "bg-sky-100",
    iconText: "text-sky-600",
    border: "border-sky-100",
    icon: (
      <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm1 10H9V9h2v6z" />
      </svg>
    ),
  },
  warning: {
    title: "Warning",
    bar: "bg-amber-500",
    iconBg: "bg-amber-100",
    iconText: "text-amber-600",
    border: "border-amber-100",
    icon: (
      <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M10 2 1.8 17h16.4L10 2zm1 11H9V8h2v5zm0 3H9v-2h2v2z" />
      </svg>
    ),
  },
};

const getMeta = (type) => TOAST_META[type] || TOAST_META.info;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (message, options = {}) => {
      const id = (toastId += 1);
      const type = options.type || "info";
      const duration = typeof options.duration === "number" ? options.duration : 3000;
      const meta = getMeta(type);
      const description = options.description || message;
      const title = options.title || meta.title;

      setToasts((prev) => [...prev, { id, type, title, description }]);

      if (duration > 0) {
        setTimeout(() => remove(id), duration);
      }

      return id;
    },
    [remove]
  );

  const api = useMemo(
    () => ({
      toast: {
        info: (message, options) => push(message, { ...options, type: "info" }),
        success: (message, options) => push(message, { ...options, type: "success" }),
        error: (message, options) => push(message, { ...options, type: "error" }),
        warning: (message, options) => push(message, { ...options, type: "warning" }),
      },
      remove,
    }),
    [push, remove]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-[min(92vw,360px)] flex-col gap-2">
        {toasts.map((toast) => {
          const meta = getMeta(toast.type);
          return (
            <div
              key={toast.id}
              className={`relative animate-in fade-in slide-in-from-top-2 overflow-hidden rounded-md border bg-white px-4 py-3 shadow-lg ${meta.border}`}
            >
              <span className={`absolute left-0 top-0 h-full w-1 ${meta.bar}`} />
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${meta.iconBg} ${meta.iconText}`}>
                  {meta.icon}
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-slate-900">{toast.title}</p>
                  <p className="mt-1 text-sm font-medium text-slate-600">{toast.description}</p>
                </div>
                <button
                  type="button"
                  className="ml-2 text-xs text-slate-400 hover:text-slate-700"
                  onClick={() => remove(toast.id)}
                  aria-label="Dismiss"
                >
                  x
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}


