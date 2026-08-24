"use client";

import { useFormStatus } from "react-dom";

export default function AdminSubmitButton({
  children,
  pendingLabel = "Saving…",
  tone = "primary",
  confirmMessage,
  className = "",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  tone?: "primary" | "secondary" | "danger" | "quiet";
  confirmMessage?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`btn btn-${tone} ${className}`}
      onClick={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
