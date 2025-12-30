import React from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-right"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast border-border shadow-lg text-white rounded-none p-3",
        },
      }}
      {...props}
    />
  );
};

/* =========================
   SUCCESS TOAST
========================= */
const toastSuccess = (message: string, className?: string) =>
  toast.custom(
    (id) => (
      <div className="flex items-center gap-2 w-full bg-green-500 text-white rounded-none p-3">
        <CheckCircle className="w-5 h-5 text-white" />
        <span className="flex-1">{message}</span>

        <button
          onClick={() => toast.dismiss(id)}
          className="text-white hover:text-gray-200 text-lg leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    ),
    {
      className: className,
    }
  );

/* =========================
   ERROR TOAST
========================= */
const toastError = (message: string, className?: string) =>
  toast.custom(
    (id) => (
      <div className="flex items-center gap-2 w-full bg-red-500 text-white rounded-none p-3">
        <XCircle className="w-5 h-5 text-white" />
        <span className="flex-1">{message}</span>

        <button
          onClick={() => toast.dismiss(id)}
          className="text-white hover:text-gray-200 text-lg leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    ),
    {
      className: className,
    }
  );

export { Toaster, toast, toastSuccess, toastError };