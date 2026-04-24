import clsx from "clsx";

export default function OpenCart({
	className,
	quantity,
}: {
	className?: string;
	quantity?: number;
}) {
	return (
		<div className="relative flex h-10 w-10 items-center justify-center rounded-[12px] border border-stone-brown/20 text-black transition-colors hover:bg-bone">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
				className={clsx("h-5 w-5", className)}
			>
				<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
			</svg>

			{quantity ? (
				<div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white">
					{quantity}
				</div>
			) : null}
		</div>
	);
}
