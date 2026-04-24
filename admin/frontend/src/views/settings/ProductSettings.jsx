import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import ImageSettings from "@/views/settings/ImageSettings";
import { PageHeader } from "@/components/page-header";

export default function ProductSettings() {
	const [activeTab, setActiveTab] = useState("images");

	const tabs = [
		{ id: "images", label: "Imágetnes de Productos" || "Imágetnes de Productos" },
	];

	return (
		<div className="space-y-6">
			<PageHeader
				title={"Configuración de Productos"}
				breadcrumbs={[
					{ label: 'PRODUCTOS' },
					{ label: "Configuración" },
				]}
			/>


			<div className="border-b border-border">
				<nav className="flex gap-1 -mb-px">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
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
