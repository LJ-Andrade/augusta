import { Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslation } from "react-i18next"
import { useEffect, useState } from "react"
import axiosClient from "@/lib/axios"

export function LanguageToggle() {
	const { i18n, t } = useTranslation()
	const [languageEnabled, setLanguageEnabled] = useState(true)

	useEffect(() => {
		// Check if language toggle is enabled
		const checkLanguageToggle = async () => {
			try {
				const { data } = await axiosClient.get("/system-settings/language_toggle_enabled")
				setLanguageEnabled(data.data?.value !== "false")
			} catch (error) {
				// If setting doesn't exist, default to enabled
				setLanguageEnabled(true)
			}
		}

		checkLanguageToggle()
	}, [])

	// Don't render if language toggle is disabled
	if (!languageEnabled) {
		return null
	}

	return (
		<div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" size="icon">
						<Languages className="h-[1.2rem] w-[1.2rem]" />
						<span className="sr-only">{t('common.toggle_language') || "Toggle language"}</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={() => i18n.changeLanguage("en")}>
						🇬🇧 English
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => i18n.changeLanguage("es")}>
						🇪🇸 Español
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	)
}
