import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { User, LogOut, Bell, Moon } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/components/theme-provider"
import axiosClient from "@/lib/axios"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
} from "@/components/ui/alert-dialog"

export default function DashboardLayout({ children }) {
	const { theme, setTheme } = useTheme()
	const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
	const [user, setUser] = useState(null)
	const [isMounted, setIsMounted] = useState(false)

	useEffect(() => {
		setIsMounted(true)
	}, [])

	useEffect(() => {
		axiosClient.get("user")
			.then(({ data }) => {
				setUser(data.data)
			})
			.catch(() => {
				// Silently fail, user might not be loaded yet
			})
	}, [])

	const handleLogout = () => {
		localStorage.removeItem('ACCESS_TOKEN');
		window.location.href = '/vadmin/login';
	};

	return (
		<>
			<div
				className={`fixed inset-0 bg-[#020617] z-9999 transition-opacity duration-1000 pointer-events-none ${isMounted ? 'opacity-0' : 'opacity-100'
					}`} />
			<SidebarProvider>
				<AppSidebar className="glass-panel border-r border-white/5" />
				<SidebarInset className="bg-transparent">
					<header className="flex h-20 shrink-0 items-center justify-between px-6 md:px-10 sticky top-0 z-10 glass-panel border-b border-white/10 shadow-lg">
						<div className="flex items-center gap-2">
							<SidebarTrigger className="-ml-1 hover:bg-primary/10 transition-colors" />
							<Separator orientation="vertical" className="mx-2 h-6 bg-white/10" />
						</div>

						<div className="flex items-center gap-3">


							<Button
								variant="ghost"
								size="icon"
								className="relative h-10 w-10 rounded-full hover:bg-primary/10 transition-colors"
							>
								<Bell className="h-5 w-5" />
								<span className="sr-only">{"Notificaciones"}</span>
							</Button>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
										<Avatar className="h-10 w-10">
											<AvatarImage src={user?.avatar_url} alt={user?.name} />
											<AvatarFallback className="bg-primary/10 text-primary">
												{user?.name?.charA0?.toUpperCase() || "U"}
											</AvatarFallback>
										</Avatar>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56 dark:bg-slate-800 dark:border-slate-700">
									<DropdownMenuLabel className="font-normal">
										<div className="flex flex-col space-y-1">
											<p className="text-sm font-medium">{user?.name || "common.user"}</p>
											<p className="text-xs text-muted-foreground">{user?.email}</p>
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem asChild>
										<Link to="/perfil" className="cursor-pointer flex items-center">
											<User className="mr-2 h-4 w-4" />
											<span>{"Perfil"}</span>
										</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<div className="flex items-center justify-between px-2 py-1.5">
										<div className="flex items-center gap-2">
											<Moon className="h-4 w-4 text-muted-foreground" />
											<span className="text-sm">{"Modo Oscuro"}</span>
										</div>
										<Switch
											checked={theme === "dark"}
											onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
										/>
									</div>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => setLogoutConfirmOpen(true)}
										className="text-gray-400 hover:text-gray-200 cursor-pointer flex items-center"
									>
										<LogOut className="mr-2 h-4 w-4" />
										<span>{"Cerrar Sesión"}</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</header>
					<main className="flex-1 p-6 md:p-10">
						{children}
					</main>
				</SidebarInset>
			</SidebarProvider>

			<AlertDialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{"¿Cerrar sesión?"}</AlertDialogTitle>
						<AlertDialogDescription>
							{"¿Estás seguro de que quieres cerrar sesión?"}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{"Cancelar"}</AlertDialogCancel>
						<AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
							{"Cerrar Sesión"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
