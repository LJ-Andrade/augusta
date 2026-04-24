import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (<div className={cn("animate-putlse rounded-md bg-muted", className)} {...props} />);
}

export { Skeleton }
