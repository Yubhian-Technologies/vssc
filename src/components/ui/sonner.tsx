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
            "group toast group-[.toaster]:border-border group-[.toaster]:shadow-lg text-white rounded-none p-3 flex items-center gap-2",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};


const toastSuccess = (message: string, className?: string) =>
  toast(
    <div className="flex items-center gap-2">
      <CheckCircle className="w-5 h-5 text-white" /> 
      <span>{message}</span>
    </div>,
    {
      className:
        "bg-green-500 text-white rounded-none " + (className || ""),
    }
  );

const toastError = (message: string, className?: string) =>
  toast(
    <div className="flex items-center gap-2">
      <XCircle className="w-5 h-5 text-white" /> 
      <span>{message}</span>
    </div>,
    {
      className:
        "bg-red-500 text-white rounded-none " + (className || ""),
    }
  );

export { Toaster, toast, toastSuccess, toastError };
