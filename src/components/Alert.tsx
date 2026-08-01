type AlertType = "error" | "success" | "info";

const TYPE_CLASSES: Record<AlertType, string> = {
  error: "bg-status-danger/15 text-red-300 border-status-danger/30",
  success: "bg-status-success/15 text-emerald-300 border-status-success/30",
  info: "bg-brand-500/15 text-brand-300 border-brand-500/30",
};

export function Alert({ message, type = "error" }: { message: string; type?: AlertType }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`rounded-lg border px-4 py-2.5 text-sm font-medium ${TYPE_CLASSES[type]}`}
    >
      {message}
    </div>
  );
}
