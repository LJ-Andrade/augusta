import { Link, useLocation } from "react-router-dom"
import {
	LayoutDashboard,
	Users,
	Settings,
	ChevronRight,
	FileText,
	ShieldCheck,
	UserCircle,
	History,
	Tags,
	Layers,
	Sparkles,
	KeyRound,
	Box,
	Folder,
	Image,
	Phone,
	Building2,
	MessageSquare,
	Palette,
	Monitor,
	Sun,
	Moon,
	Ruler,
	Ticket,
	ShoppingBag,
} from "lucide-react"


import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarMenuSub,
	SidebarMenuSubItem,
	SidebarMenuSubButton,
	useSidebar,
} from "@/components/ui/sidebar"

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { hasPermission, isSuperAdmin } from "@/components/can"
import { useTranslation } from "react-i18next"
import { useTheme } from "@/components/theme-provider"
import { useState, useEffect } from "react"
import axiosClient from "@/lib/axios"

const items = [
	{
		title: "sidebar.dashboard",
		url: "/dashboard",
		icon: LayoutDashboard,
	},
	{
		title: "sidebar.user_management",
		icon: Users,
		children: [
			{
				title: "sidebar.users",
				url: "/users",
				icon: UserCircle,
				permission: "view users",
			},
			{
				title: "sidebar.roles",
				url: "/roles",
				icon: ShieldCheck,
				permission: "view roles",
			},
			{
				title: "sidebar.permissions",
				url: "/permissions",
				icon: ShieldCheck,
				permission: "view permissions",
			},
		],
	},
	{
		title: "sidebar.blog",
		icon: FileText,
		children: [
			{
				title: "sidebar.articles",
				url: "/articles",
				icon: FileText,
				permission: "view blog",
			},
			{
				title: "sidebar.autopost",
				url: "/autopost",
				icon: Sparkles,
				permission: "manage articles",
			},
			{
				title: "sidebar.categories",
				url: "/categories",
				icon: Folder,
				permission: "view blog",
			},
			{
				title: "sidebar.tags",
				url: "/tags",
				icon: Tags,
				permission: "view blog",
			},
			{
				title: "sidebar.blog_settings",
				url: "/blog-settings",
				icon: Settings,
			},
		],
	},
	{
		title: "sidebar.products",
		icon: Box,
		children: [
			{
				title: "sidebar.products",
				url: "/products",
				icon: Box,
			},
			{
				title: "sidebar.product_categories",
				url: "/product-categories",
				icon: Layers,
			},
			{
				title: "sidebar.product_tags",
				url: "/product-tags",
				icon: Tags,
			},
			{
				title: "sidebar.product_colors",
				url: "/product-colors",
				icon: Palette,
			},
			{
				title: "sidebar.product_sizes",
				url: "/product-sizes",
				icon: Ruler,
			},
			{
				title: "sidebar.coupons",
				url: "/coupons",
				icon: Ticket,
			},
			{
				title: "sidebar.products_settings",
				url: "/product-settings",
				icon: Settings,
			},
		],
	},
	{
		title: "sidebar.orders",
		url: "/orders",
		icon: ShoppingBag,
		permission: "view orders",
	},
	{
		title: "sidebar.customers",
		url: "/customers",
		icon: Building2,
		permission: "manage customers",
	},
	{
		title: "sidebar.contact_messages",
		url: "/contact-messages",
		icon: MessageSquare,
		permission: "view blog",
	},
	{
		title: "sidebar.system",
		icon: Monitor,
		children: [
			{
				title: "sidebar.activity_logs",
				url: "/activity-logs",
				icon: History,
				permission: "view activity logs",
			},
		],
	},
	{
		title: "sidebar.configurations",
		icon: Settings,
		children: [
			{
				title: "sidebar.general",
				url: "/settings",
				icon: Settings,
			},
			{
				title: "sidebar.business_info",
				url: "/business-info",
				icon: Phone,
			},
			{
				title: "sidebar.system_features",
				url: "/system-configurations",
				icon: Settings,
				superAdminOnly: true,
			},
			{
				title: "sidebar.skin",
				url: "/skin-settings",
				icon: Palette,
				superAdminOnly: true,
			},
		],
	},
]

const getUserRole = () => {
	const userRoles = JSON.parse(localStorage.getItem('USER_ROLES') || '[]');
	if (userRoles.includes('Super Admin')) return 'Super Admin';
	if (userRoles.includes('Admin')) return 'Admin';
	if (userRoles.length > 0) return userRoles[0];
	return 'User';
};

export function AppSidebar() {
	const { t } = useTranslation();
	const location = useLocation();
	const { state, isMobile, setOpenMobile } = useSidebar();
	const { theme, setTheme } = useTheme();
	const [businessName, setBusinessName] = useState('');

	useEffect(() => {
		if (isMobile) {
			setOpenMobile(false);
		}
	}, [location.pathname, isMobile, setOpenMobile]);

	useEffect(() => {
		// Fetch business name from settings
		axiosClient.get('/system-settings/business_name')
			.then(({ data }) => {
				if (data.data?.value) {
					setBusinessName(data.data.value);
				}
			})
			.catch(() => {
				// Silently fail if setting doesn't exist
			});
	}, []);

	const isActive = (url) => location.pathname === url;
	const isGroupActive = (item) => {
		if (item.url && isActive(item.url)) return true;
		if (item.children) return item.children.some(child => isActive(child.url));
		return false;
	};

	const filteredItems = items.map(item => {
		if (item.children) {
			// Filter children based on permissions or superAdminOnly
			const filteredChildren = item.children.filter(child => {
				if (child.superAdminOnly) {
					return isSuperAdmin();
				}
				return !child.permission || hasPermission(child.permission);
			});
			return { ...item, children: filteredChildren };
		}
		return item;
	}).filter(item => {
		if (item.children) {
			return item.children.length > 0;
		}
		if (item.superAdminOnly) {
			return isSuperAdmin();
		}
		return !item.permission || hasPermission(item.permission);
	});

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader className="p-4 mb-2 group-data-[collapsible=icon]:px-2">
				<div className="flex flex-col items-center">
					<div className="flex items-center gap-3 font-bold text-2xl tracking-tight group-data-[collapsible=icon]:justify-center">
						<span className="bg-linear-to-r from-cyan-400 via-teal-400 to-blue-500 bg-clip-text text-transparent whitespace-nowrap">
							{state === "collapsed" ? "V" : "VADMIN3"}
						</span>
					</div>
					{businessName && state !== "collapsed" && (
						<span className="text-xs font-thin text-muted-foreground truncate max-w-[180px] mt-1">
							{businessName}
						</span>
					)}
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel className="px-2 mb-2 text-xs uppercase tracking-widest font-bold opacity-50">{t('sidebar.main_menu')}</SidebarGroupLabel>
					<SidebarMenu className="gap-1">
						{filteredItems.map((item) => {
							const active = isGroupActive(item);
							return (
								<SidebarMenuItem key={item.title}>
									{item.children ? (
										state === "collapsed" ? (
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<SidebarMenuButton
														tooltip={t(item.title)}
														isActive={active}
														className={`group h-10 transition-all duration-200 group-data-[collapsible=icon]:justify-center ${active ? "bg-linear-to-r from-primary/20 to-transparent" : "hover:bg-primary/5"}`}
													>
														{item.icon && (
															<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 mr-1 group-data-[collapsible=icon]:mr-0 transition-colors duration-200 group-hover:bg-primary/20">
																<item.icon className="h-4 w-4 text-primary" />
															</div>
														)}
														<span className="font-medium text-sm transition-colors duration-200 group-data-[collapsible=icon]:hidden">{t(item.title)}</span>
													</SidebarMenuButton>
												</DropdownMenuTrigger>
												<DropdownMenuContent side="right" align="start" className="min-w-48">
													{item.children
														.filter(subItem => !subItem.permission || hasPermission(subItem.permission))
														.map((subItem) => {
															if (subItem.isThemeToggle) {
																const ThemeIcon = theme === 'dark' ? Sun : Moon;
																return (
																	<DropdownMenuItem
																		key={subItem.title}
																		onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
																		className="flex items-center gap-2 cursor-pointer"
																	>
																		<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
																			<ThemeIcon className="h-3.5 w-3.5 text-primary" />
																		</div>
																		<span className="text-sm">{t(subItem.title)}</span>
																	</DropdownMenuItem>
																);
															}
															return (
																<DropdownMenuItem key={subItem.title} asChild>
																	<Link to={subItem.url} className="flex items-center gap-2 cursor-pointer">
																		{subItem.icon && (
																			<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
																				<subItem.icon className="h-3.5 w-3.5 text-primary" />
																			</div>
																		)}
																		<span className="text-sm">{t(subItem.title)}</span>
																	</Link>
																</DropdownMenuItem>
															);
														})}
												</DropdownMenuContent>
											</DropdownMenu>
										) : (
											<Collapsible className="group/collapsible" defaultOpen={active}>
												<CollapsibleTrigger asChild>
													<SidebarMenuButton
														tooltip={t(item.title)}
														isActive={active}
														className={`group h-10 transition-all duration-200 group-data-[collapsible=icon]:justify-center ${active ? "bg-linear-to-r from-primary/20 to-transparent" : "hover:bg-primary/5"}`}
													>
														{item.icon && (
															<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 mr-1 group-data-[collapsible=icon]:mr-0 transition-colors duration-200 group-hover/collapsible:bg-primary/20">
																<item.icon className="h-4 w-4 text-primary" />
															</div>
														)}
														<span className="font-medium text-sm transition-colors duration-200 group-data-[collapsible=icon]:hidden">{t(item.title)}</span>
														<ChevronRight className="ml-auto h-3.5 w-3.5 opacity-40 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
													</SidebarMenuButton>
												</CollapsibleTrigger>
												<CollapsibleContent>
													<SidebarMenuSub className="ml-5 border-l-0 py-1 gap-1">
														{item.children.map((subItem) => {
															const subActive = isActive(subItem.url);
															if (subItem.isThemeToggle) {
																const ThemeIcon = theme === 'dark' ? Sun : Moon;
																return (
																	<SidebarMenuSubItem key={subItem.title}>
																		<SidebarMenuSubButton
																			isActive={false}
																			onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
																			className="h-9 px-3 transition-all duration-200 hover:bg-primary/5 cursor-pointer w-full flex items-center gap-2"
																		>
																			<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
																				<ThemeIcon className="h-3.5 w-3.5 text-primary" />
																			</div>
																			<span className="text-sm opacity-80">{t(subItem.title)}</span>
																		</SidebarMenuSubButton>
																	</SidebarMenuSubItem>
																);
															}
															return (
																<SidebarMenuSubItem key={subItem.title}>
																	<SidebarMenuSubButton
																		asChild
																		isActive={subActive}
																		className={`h-9 px-3 transition-all duration-200 ${subActive ? "bg-linear-to-r from-primary/20 to-transparent font-medium" : "hover:bg-primary/5"}`}
																	>
																		<Link to={subItem.url} className="w-full flex items-center gap-2">
																			{subItem.icon && (
																				<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
																					<subItem.icon className="h-3.5 w-3.5 text-primary" />
																				</div>
																			)}
																			<span className="text-sm opacity-80">{t(subItem.title)}</span>
																		</Link>
																	</SidebarMenuSubButton>
																</SidebarMenuSubItem>
															);
														})}
													</SidebarMenuSub>
												</CollapsibleContent>
											</Collapsible>
										)
									) : (
										<SidebarMenuButton
											asChild
											tooltip={t(item.title)}
											isActive={isActive(item.url)}
											className={`group h-10 transition-all duration-200 group-data-[collapsible=icon]:justify-center ${isActive(item.url) ? "bg-linear-to-r from-primary/20 to-transparent" : "hover:bg-primary/5"}`}
										>
											<Link to={item.url} className="flex items-center w-full group-data-[collapsible=icon]:justify-center">
												{item.icon && (
													<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 mr-1 group-data-[collapsible=icon]:mr-0 transition-colors duration-200 group-hover:bg-primary/20">
														<item.icon className="h-4 w-4 text-primary" />
													</div>
												)}
												<span className="font-medium text-sm transition-colors duration-200 group-data-[collapsible=icon]:hidden">{t(item.title)}</span>
											</Link>
										</SidebarMenuButton>
									)}
								</SidebarMenuItem>
							);
						})}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter className="p-4 border-t border-primary/5">
				<div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
					<div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
						<UserCircle className="h-5 w-5 text-primary" />
					</div>
					<div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden text-left">
						<span className="text-sm font-semibold truncate text-primary">{t('sidebar.role')}</span>
						<span className="text-[10px] tracking-wider text-muted-foreground truncate">{getUserRole()}</span>
					</div>
				</div>
			</SidebarFooter>
		</Sidebar>
	)
}
