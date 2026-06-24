import { cn } from "@/lib/cn";

/** A single chat bubble. User messages align right; partner messages left. */
export function ChatBubble({
  role,
  children,
}: {
  role: "user" | "assistant";
  children: React.ReactNode;
}) {
  const isUser = role === "user";
  return (
    <div
      className={cn(
        "flex w-full animate-fade-up",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-[0.95rem] leading-relaxed shadow-soft sm:max-w-[75%]",
          isUser
            ? "rounded-br-md bg-brand text-white"
            : "rounded-bl-md bg-surface-2 text-ink",
        )}
      >
        {children}
      </div>
    </div>
  );
}
