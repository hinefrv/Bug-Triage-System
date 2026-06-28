export function UserAvatar({ name, size = "md", className = "" }) {
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    const sizeClasses = {
        sm: "w-6 h-6 text-xs",
        md: "w-8 h-8 text-sm",
        lg: "w-10 h-10 text-base",
    };
    return (<div className={`${sizeClasses[size]} rounded-full bg-primary flex items-center justify-center text-primary-foreground ${className}`}>
      {initials}
    </div>);
}
