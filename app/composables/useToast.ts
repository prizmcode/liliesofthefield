export type ToastType = "success" | "error" | "info";

export interface ToastAction {
 label: string;
 href?: string | null;
 onClick?: (() => void) | null;
}

export interface ToastInput {
 id?: string;
 title?: string;
 message: string;
 type?: ToastType;
 duration?: number;
 image?: string | null;
 onClick?: (() => void) | null;
 action?: ToastAction | null;
}

export interface Toast {
 id: string;
 title: string;
 message: string;
 type: ToastType;
 duration: number;
 image: string | null;
 onClick: (() => void) | null;
 action: ToastAction | null;
}

const DEFAULT_DURATION = 3500;

export function useToast() {
 const toasts = useState<Toast[]>("toasts", () => []);

 function dismiss(id: string): void {
  toasts.value = toasts.value.filter((t) => t.id !== id);
 }

 function push(input: ToastInput): string {
  const id =
   input.id ?? `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const toast: Toast = {
   id,
   title: input.title ?? "",
   message: input.message,
   type: input.type ?? "info",
   duration: input.duration ?? DEFAULT_DURATION,
   image: input.image ?? null,
   onClick: input.onClick ?? null,
   action: input.action ?? null,
  };
  toasts.value = [...toasts.value, toast];
  if (toast.duration > 0 && import.meta.client) {
   setTimeout(() => dismiss(id), toast.duration);
  }
  return id;
 }

 return { toasts, push, dismiss };
}
