"use client";

import { useActionState, useRef } from "react";
import { Send } from "lucide-react";
import { addTaskUpdateAction } from "@/lib/actions";

export default function AddUpdateForm({ taskId }: { taskId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, formAction, isPending] = useActionState(async (prevState: string | undefined, formData: FormData) => {
    const result = await addTaskUpdateAction(prevState, formData);
    if (!result) formRef.current?.reset();
    return result;
  }, undefined);

  return (
    <form ref={formRef} action={formAction} className="space-y-2.5">
      <input type="hidden" name="taskId" value={taskId} />
      <textarea
        name="message"
        required
        rows={3}
        placeholder="Progress update likhein... jaise: aaj 2 ghante kaam kiya, kal complete ho jayega"
        className="input resize-none"
      />
      {error && (
        <p className="badge w-full justify-start" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>
          {error}
        </p>
      )}
      <button type="submit" disabled={isPending} className="btn btn-primary">
        <Send size={14} />
        {isPending ? "Bhej rahe hain..." : "Update Bhejein"}
      </button>
    </form>
  );
}
