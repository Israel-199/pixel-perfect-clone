import { toast } from "sonner";

export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 5000,
      className: "border border-emerald-500/30 bg-card text-navy shadow-xl",
    });
  },
  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 6000,
      className: "border border-rose-500/30 bg-card text-navy shadow-xl",
    });
  },
  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4500,
      className: "border border-blue-500/30 bg-card text-navy shadow-xl",
    });
  },
  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 5000,
      className: "border border-amber-500/30 bg-card text-navy shadow-xl",
    });
  },
};

export { toast };
