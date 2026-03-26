"use client";

import { useRef } from "react";

type DeleteConfirmButtonProps = {
  id: string;
  action: (formData: FormData) => Promise<void>;
  label?: string;
  description?: string;
};

export function DeleteConfirmButton({
  id,
  action,
  label = "Delete",
  description = "This action cannot be undone.",
}: DeleteConfirmButtonProps) {
  const formRef = useRef<HTMLFormElement | null>(null);

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const modal = document.createElement("div");
    modal.innerHTML = `
      <div class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40">
        <div class="max-w-sm rounded-3xl bg-white p-6 text-center text-stone-900 shadow-xl">
          <p class="text-base font-semibold">Are you sure?</p>
          <p class="mt-2 text-sm text-stone-500">${description}</p>
          <div class="mt-6 flex justify-center gap-3 text-xs">
            <button data-action="cancel" class="rounded-full border border-stone-200 px-4 py-2 transition hover:border-stone-400">
              Cancel
            </button>
            <button data-action="confirm" class="rounded-full bg-rose-500 px-4 py-2 font-semibold text-white transition hover:bg-rose-400">
              Confirm
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    function cleanup() {
      modal.remove();
    }

    const cancel = modal.querySelector<HTMLButtonElement>('button[data-action="cancel"]');
    const confirm = modal.querySelector<HTMLButtonElement>('button[data-action="confirm"]');

    cancel?.addEventListener("click", () => {
      cleanup();
    });

    confirm?.addEventListener("click", () => {
      cleanup();
      formRef.current?.submit();
    });
  }

  return (
    <form ref={formRef} action={action} method="post" className="inline">
      <input type="hidden" name="id" value={id} />
      <button
        onClick={handleClick}
        className="rounded-full border border-stone-200 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:border-rose-400 hover:text-rose-500"
        type="submit"
      >
        {label}
      </button>
    </form>
  );
}
