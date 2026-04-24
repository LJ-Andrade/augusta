import { AddToCart } from "components/cart/add-to-cart";
import Price from "components/price";
import Prose from "components/prose";
import { Product } from "lib/vadmin/types";
import { VariantSelector } from "./variant-selector";

export function ProductDescription({ product }: { product: Product }) {
	return (
		<>
			<div className="mb-8 flex flex-col border-b border-neutral-200 pb-6 dark:border-neutral-800">
				<h1
					className="mb-4 text-4xl font-medium leading-tight lg:text-5xl"
					style={{ fontFamily: "var(--font-serif)", color: "var(--pb-text)" }}
				>
					{product.title}
				</h1>

				{product.descriptionHtml ? (
					<div className="mb-8 border-b border-neutral-200 pb-8 dark:border-neutral-800">

						<Prose
							className="text-sm leading-relaxed text-black"
							html={product.descriptionHtml}
						/>
					</div>
				) : null}

				<div className="flex items-center gap-4">
					<div className="text-2xl font-medium tracking-tight" style={{ color: "var(--pb-text)" }}>
						<Price
							amount={product.priceRange.maxVariantPrice.amount}
							currencyCode={product.priceRange.maxVariantPrice.currencyCode}
						/>
					</div>
				</div>
			</div>

			<VariantSelector options={product.options} variants={product.variants} />



			<div className="mb-8">
				<AddToCart product={product} />
			</div>


		</>
	);
}
