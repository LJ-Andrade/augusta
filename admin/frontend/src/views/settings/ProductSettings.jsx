import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Separator } from "@/components/ui/separator";
import ImageSettings from "@/views/settings/ImageSettings";

export default function ProductSettings() {
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState("images");

	const tabs = [
		{ id: "images", label: t('sidebar.product_images') || "Imágenes de Productos" },
	];

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">{t('sidebar.products_settings') || "Configuración de Productos"}</h1>
			</div>

			<Separator className="mt-6" />

			<div className="border-b border-border">
				<nav className="flex gap-1 -mb-px">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
								activeTab === tab.id
									? "border-primary text-primary"
									: "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
							}`}
						>
							{tab.label}
						</button>
					))}
				</nav>
			</div>

			<div>
				{activeTab === 'images' && <ImageSettings />}
			</div>
		</div>
	);
}
