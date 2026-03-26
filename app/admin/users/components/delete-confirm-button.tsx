"use client";

import { useRef } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

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
    const result = await Swal.fire({
      title: "Are you sure?",
      text: description,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: label,
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      reverseButtons: true,
      focusCancel: true,
    });

    if (result.isConfirmed) {
      formRef.current?.submit();
    }
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
