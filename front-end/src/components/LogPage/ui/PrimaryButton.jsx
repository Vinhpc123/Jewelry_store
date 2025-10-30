export default function PrimaryButton({ className = "", ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm ${className}`}
    />
  );
}
