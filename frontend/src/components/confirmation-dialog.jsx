import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Mail } from "lucide-react";

export function ConfirmationDialog({
  children,
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  cancelText,
  variant = "destructive",
  onConfirm,
  asChild = false,
  showCancel = true,
  icon: CustomIcon,
  iconColor,
}) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onOpenChange?.(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {asChild ? (
        children
      ) : (
        <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {(variant === "destructive" || CustomIcon) && (
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${CustomIcon ? iconColor : 'bg-red-100 dark:bg-red-900/20'}`}>
                {CustomIcon ? (
                  <CustomIcon className={`h-5 w-5 ${iconColor}`} />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
              </div>
            )}
            <div>
              <AlertDialogTitle>{title}</AlertDialogTitle>
            </div>
          </div>
          {description && (
            <AlertDialogDescription className="mt-2">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          {showCancel && <AlertDialogCancel>{cancelText}</AlertDialogCancel>}
          <AlertDialogAction
            onClick={handleConfirm}
            className={variant === "destructive" ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
