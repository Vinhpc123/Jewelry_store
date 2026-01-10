import { useCallback, useRef, useState } from "react";
import { ConfirmContext } from "./ConfirmContext";


const DEFAULTS = {
  title: "Confirm",
  description: "",
  confirmText: "Confirm",
  cancelText: "Cancel",
  tone: "primary",
};

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolveRef = useRef(null);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setDialog({
        ...DEFAULTS,
        ...options,
      });
    });
  }, []);

  const close = useCallback((result) => {
    if (resolveRef.current) {
      resolveRef.current(result);
      resolveRef.current = null;
    }
    setDialog(null);
  }, []);

  const confirmClass =
    dialog?.tone === "danger"
      ? "bg-red-600 hover:bg-red-700"
      : "bg-slate-900 hover:bg-slate-800";

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {dialog ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => close(false)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">{dialog.title}</h2>
                {dialog.description ? (
                  <p className="mt-1 text-sm text-slate-500">{dialog.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                className="text-xs text-slate-400 hover:text-slate-700"
                onClick={() => close(false)}
                aria-label="Dismiss"
              >
                x
              </button>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                onClick={() => close(false)}
              >
                {dialog.cancelText}
              </button>
              <button
                type="button"
                className={`rounded-md px-3 py-1.5 text-sm font-semibold text-white ${confirmClass}`}
                onClick={() => close(true)}
              >
                {dialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmContext.Provider>
  );
}