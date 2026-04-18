"use client";

import clsx from "clsx";
import { ProductOption, ProductVariant } from "lib/vadmin/types";
import { COLOR_MAP } from "lib/constants";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

type Combination = {
  id: string;
  availableForSale: boolean;
  [key: string]: string | boolean;
};

export function VariantSelector({
  options,
  variants,
}: {
  options: ProductOption[];
  variants: ProductVariant[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasNoOptionsOrJustOneOption =
    !options.length ||
    (options.length === 1 && options[0]?.values.length === 1);

  if (hasNoOptionsOrJustOneOption) {
    return null;
  }

  const combinations: Combination[] = variants.map((variant) => ({
    id: variant.id,
    availableForSale: variant.availableForSale,
    ...variant.selectedOptions.reduce(
      (accumulator, option) => ({
        ...accumulator,
        [option.name.toLowerCase()]: option.value,
      }),
      {},
    ),
  }));

  const updateOption = (name: string, value: string, isAvailable: boolean) => {
    if (!isAvailable) {
      toast.error("Combinación sin stock", {
        description: `Lo sentimos, la variante seleccionada no tiene unidades disponibles en este momento.`,
      });
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return options.map((option) => (
    <div key={option.id}>
      <dl className="mb-8">
        <dt className="mb-4 text-sm uppercase tracking-wide font-medium">{option.name}</dt>
        <dd className="flex flex-wrap gap-3">
          {option.values.map((value) => {
            const optionNameLowerCase = option.name.toLowerCase();

            // Base option params on current searchParams so we can preserve any other param state.
            const optionParams: Record<string, string> = {};
            searchParams.forEach((v, k) => (optionParams[k] = v));
            optionParams[optionNameLowerCase] = value;

            // Filter out invalid options and check if the option combination is available for sale.
            const filtered = Object.entries(optionParams).filter(
              ([key, value]) =>
                options.find(
                  (option) =>
                    option.name.toLowerCase() === key &&
                    option.values.includes(value),
                ),
            );
            
            const isAvailableForSale = combinations.find((combination) =>
              filtered.every(
                ([key, value]) =>
                  combination[key] === value && combination.availableForSale,
              ),
            );

            // The option is active if it's in the selected options.
            const isActive = searchParams.get(optionNameLowerCase)?.toLowerCase() === value.toLowerCase();

            return (
              <button
                onClick={() => updateOption(optionNameLowerCase, value, !!isAvailableForSale)}
                key={value}
                aria-disabled={!isAvailableForSale}
                title={`${option.name} ${value}${!isAvailableForSale ? " (Sin stock)" : ""}`}
                className={clsx(
                  "flex min-w-[80px] items-center justify-center gap-2 border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-200",
                  isActive
                    ? "border-black bg-black text-white"
                    : "border-neutral-200 bg-transparent text-neutral-500 hover:border-black hover:bg-neutral-50 hover:text-black dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-white dark:hover:bg-neutral-900 dark:hover:text-white",
                  {
                    "relative z-10 cursor-pointer opacity-40 overflow-hidden before:absolute before:inset-x-0 before:-z-10 before:h-px before:-rotate-45 before:bg-neutral-300 dark:before:bg-neutral-700":
                      !isAvailableForSale,
                  }
                )}
              >
                {optionNameLowerCase === "color" && (
                  <span
                    className="h-3 w-3 shrink-0 rounded-full border border-black/10"
                    style={{ backgroundColor: COLOR_MAP[value.toLowerCase()] ?? "#CCC" }}
                  />
                )}
                {value}
              </button>
            );
          })}
        </dd>
      </dl>
    </div>
  ));
}
