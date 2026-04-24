"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { addItem } from "components/cart/actions";
import { Product, ProductVariant } from "lib/vadmin/types";
import { useSearchParams } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useCart } from "./cart-context";
import LoadingDots from "components/loading-dots";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

function SubmitButton({
	availableForSale,
	selectedVariantId,
}: {
	availableForSale: boolean;
	selectedVariantId: string | undefined;
}) {
  const { pending } = useFormStatus();
	const buttonClasses =
		"relative flex w-full items-center justify-center rounded-[12px] py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-200";
	
  // Out of stock state
	if (!availableForSale) {
		return (
			<button 
        disabled 
        className={clsx(buttonClasses, "bg-bone/50 text-stone-brown/40 cursor-not-allowed")}
      >
				Sin Stock
			</button>
		);
	}

  // Not selected state
	if (!selectedVariantId) {
		return (
			<button
				aria-label="Por favor selecciona una opción"
				disabled
				className={clsx(buttonClasses, "bg-bone/20 text-stone-brown/60 border border-bone/50 cursor-not-allowed")}
			>
				Seleccionar Opciones
			</button>
		);
	}

	return (
		<button
			aria-label="Agregar al carrito"
      disabled={pending}
			className={clsx(buttonClasses, "bg-graphite text-parchment hover:opacity-90")}
		>
			<div className="absolute left-0 ml-6">
				{pending ? <LoadingDots className="bg-parchment" /> : <PlusIcon className="h-4 w-4" />}
			</div>
			Agregar al carrito
		</button>
	);
}

export function AddToCart({ product }: { product: Product }) {
	const { variants } = product;
	const { addCartItem } = useCart();
	const searchParams = useSearchParams();
	const [message, formAction] = useActionState(addItem, null);

  useEffect(() => {
    if (message) {
      toast.error(message);
    }
  }, [message]);

	const variant = variants.find((variant: ProductVariant) =>
		variant.selectedOptions.every(
			(option) => option.value.toLowerCase() === searchParams.get(option.name.toLowerCase())?.toLowerCase(),
		),
	);
	
  const defaultVariantId = variants.length === 1 ? variants[0]?.id : undefined;
	const selectedVariantId = variant?.id || defaultVariantId;
  
  // Use selected variant availability if found, otherwise general product availability
  const isAvailable = variant ? variant.availableForSale : product.availableForSale;

	const addItemAction = formAction.bind(null, selectedVariantId);
	const finalVariant = variants.find(
		(variant) => variant.id === selectedVariantId,
	)!;

	return (
		<form
			action={async () => {
				addCartItem(finalVariant, product);
				await addItemAction();
			}}
		>
			<SubmitButton
				availableForSale={isAvailable}
				selectedVariantId={selectedVariantId}
			/>
			<p aria-live="polite" className="sr-only" role="status">
				{message}
			</p>
		</form>
	);
}
