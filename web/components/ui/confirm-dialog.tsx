"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Aceptar",
  cancelLabel = "Cancelar",
  variant = "primary",
}: ConfirmDialogProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-[100]">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl dark:bg-neutral-900">
              <Dialog.Title className="text-xl font-serif font-medium text-black dark:text-white">
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-3 text-sm text-neutral-500 leading-relaxed">
                {description}
              </Dialog.Description>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:bg-neutral-50 transition-colors dark:hover:bg-neutral-800"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={clsx(
                    "rounded-full px-8 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90",
                    variant === "danger" ? "bg-red-600" : "bg-black dark:bg-white dark:text-black"
                  )}
                >
                  {confirmLabel}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

import clsx from "clsx";
