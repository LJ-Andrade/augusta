import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Plus, Search, Edit, Trash2, List, BookText, Building2, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Filter, X, ChevronDown, StickyNote } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { useBulkSelect } from '@/hooks/use-bulk-select';

export default function ChatbotsList() {
	const [chatbots, setChatbots] = useState([]);
	const [customers, setCustomers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [meta, setMeta] = useState({});
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [filterCustomer, setFilterCustomer] = useState('');
	const [filterStatus, setFilterStatus] = useState('');
	const [isFiltersOpen, setIsFiltersOpen] = useState(false);
	const [sortBy, setSortBy] = useState('id');
	const [sortDir, setSortDir] = useState('desc');

	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [botToDelete, setBotToDelete] = useState(null);

	const {
		selectedIds,
		selectedCount,
		isAllSelected,
		toggleSelect,
		toggleSelectAll,
		clearSelection,
		isSelected,
	} = useBulkSelect(chatbots);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearch(search);
		}, 500);
		return () => clearTimeout(handler);
	}, [search]);

	useEffect(() => {
		setPage(1);
	}, [debouncedSearch, filterCustomer, filterStatus]);

	useEffect(() => {
		getChatbots();
	}, [page, debouncedSearch, filterCustomer, filterStatus, sortBy, sortDir]);

	useEffect(() => {
		clearSelection();
	}, [page, debouncedSearch, filterCustomer, filterStatus, sortBy, sortDir]);

	useEffect(() => {
		axiosClient.get('/admin/customers', { params: { perPage: 100 } })
			.then(({ data }) => setCustomers(data.data || []))
			.catch(() => { });
	}, []);

	const getChatbots = () => {
		setLoading(true);
		const params = {
			page,
			sort_by: sortBy,
			sort_dir: sortDir,
		};

		if (debouncedSearch) params.search = debouncedSearch;
		if (filterCustomer) params.customer_id = filterCustomer;
		if (filterStatus !== '') params.is_active = filterStatus;

		axiosClient.get('/admin/chatbots', { params })
			.then(({ data }) => {
				setChatbots(data.data || []);
				setMeta(data.meta || {});
				setLoading(false);
			})
			.catch(() => setLoading(false));
	};

	const handleSort = (column) => {
		if (sortBy === column) {
			setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
		} else {
			setSortBy(column);
			setSortDir('asc');
		}
	};

	const renderSortIcon = (column) => {
		if (sortBy !== column) return <ArrowUpDown className="ml-2 h-4 w-4" />;
		return sortDir === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />;
	};

	const handleClearFilters = () => {
		setSearch('');
		setFilterCustomer('');
		setFilterStatus('');
		setPage(1);
	};

	const handleDeleteClick = (bot) => {
		setBotToDelete(bot);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!botToDelete) return;
		setIsDeleting(true);
		try {
			await axiosClient.delete(`/admin/chatbots/${botToDelete.id}`);
			toast.success("Chatbot eliminado");
			getChatbots();
		} catch (error) {
			toast.error("Error al eliminar");
		} finally {
			setIsDeleting(false);
			setBotToDelete(null);
		}
	};

	const handleBulkDelete = () => {
		setIsDeleting(true);
		axiosClient.post('/admin/chatbots/bulk-delete', { ids: selectedIds })
			.then(() => {
				toast.success("Chatbots eliminados");
				clearSelection();
				getChatbots();
			})
			.catch(() => toast.error("Error al eliminar"))
			.finally(() => setIsDeleting(false));
	};

	const renderPagination = () => {
		if (!meta.last_page || meta.last_page <= 1) return null;
		const pages = [];
		const startPage = Math.max(1, page - 2);
		const endPage = Math.min(meta.last_page, startPage + 4);
		const adjustedStartPage = Math.max(1, endPage - 4);

		for (let i = adjustedStartPage; i <= endPage; i++) {
			pages.push(
				<Button key={i} variant={page === i ? "default" : "outline"} size="sm" onClick={() => setPage(i)}>
					{i}
				</Button>
			);
		}
		return pages;
	};

	return (
		<TooltipProvider>
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h1 className="text-3xl font-bold tracking-tight">Chatbots</h1>
					<Button asChild>
						<Link to="/chatbots/create">
							<Plus className="mr-2 h-4 w-4" /> Nuevo Chatbot
						</Link>
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Listado de Chatbots</CardTitle>
					</CardHeader>
					<CardContent>
						<Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen} className="space-y-4 pb-4">
							<div className="flex items-center justify-between gap-4">
								<div className="relative w-full max-w-sm">
									<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input
										type="search"
										placeholder="Buscar chatbots..."
										className="pl-8"
										value={search}
										onChange={(e) => setSearch(e.target.value)}
									/>
								</div>
								<CollapsibleTrigger asChild>
									<Button variant="outline" size="sm">
										<Filter className="mr-2 h-4 w-4" />
										Filtros
										<ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isFiltersOpen ? "rotate-180" : ""}`} />
									</Button>
								</CollapsibleTrigger>
							</div>

							<CollapsibleContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
									<div className="space-y-2">
										<label className="text-sm font-medium">Cliente</label>
										<select
											className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
											value={filterCustomer}
											onChange={(e) => setFilterCustomer(e.target.value)}
										>
											<option value="">Todos los clientes</option>
											{customers.map((c) => (
												<option key={c.id} value={c.id}>{c.name}</option>
											))}
										</select>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium">Estado</label>
										<select
											className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
											value={filterStatus}
											onChange={(e) => setFilterStatus(e.target.value)}
										>
											<option value="">Todos los estados</option>
											<option value="1">Activo</option>
											<option value="0">Inactivo</option>
										</select>
									</div>
								</div>
								<div className="flex justify-end">
									<Button variant="ghost" size="sm" onClick={handleClearFilters}>
										<X className="mr-2 h-4 w-4" />
										Limpiar filtros
									</Button>
								</div>
							</CollapsibleContent>
						</Collapsible>

						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-10">
										<Checkbox checked={isAllSelected} onCheckedChange={toggleSelectAll} />
									</TableHead>
									<TableHead className="cursor-pointer w-[60px]" onClick={() => handleSort('id')}>
										<div className="flex items-center">ID {renderSortIcon('id')}</div>
									</TableHead>
									<TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
										<div className="flex items-center">Nombre {renderSortIcon('name')}</div>
									</TableHead>
									<TableHead>Cliente</TableHead>
									<TableHead>Proveedor</TableHead>
									<TableHead>Modelo</TableHead>
									<TableHead className="cursor-pointer w-[100px]" onClick={() => handleSort('is_active')}>
										<div className="flex items-center">Estado {renderSortIcon('is_active')}</div>
									</TableHead>
									<TableHead className="text-right w-[150px]">Acciones</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody className={loading ? "opacity-50 pointer-events-none" : ""}>
								{loading && chatbots.length === 0 && (
									<TableRow>
										<TableCell colSpan={8} className="text-center">Cargando...</TableCell>
									</TableRow>
								)}
								{!loading && chatbots.length === 0 && (
									<TableRow>
										<TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
											No hay chatbots registrados.
										</TableCell>
									</TableRow>
								)}
								{chatbots.map((bot) => (
									<TableRow key={bot.id}>
										<TableCell>
											<Checkbox checked={isSelected(bot.id)} onCheckedChange={() => toggleSelect(bot.id)} />
										</TableCell>
										<TableCell className="w-[60px]">{bot.id}</TableCell>
										<TableCell>
											<div className="flex items-center gap-3">
												<div className="h-10 w-10 shrink-0 rounded-full overflow-hidden border bg-muted flex items-center justify-center">
													{bot.avatar_url ? (
														<img src={bot.avatar_url} alt={bot.name} className="h-full w-full object-cover" />
													) : (
														<Bot className="h-5 w-5 text-muted-foreground" />
													)}
												</div>
												<div>
													<div className="font-medium">{bot.name}</div>
													{bot.description && (
														<div className="text-xs text-muted-foreground truncate max-w-[200px]">{bot.description}</div>
													)}
												</div>
											</div>
										</TableCell>
										<TableCell>
											{bot.customer ? (
												<div className="flex items-center gap-2">
													{bot.customer.logo_url ? (
														<img src={bot.customer.logo_url} alt={bot.customer.name} className="h-5 w-5 rounded-sm object-cover border" />
													) : (
														<Building2 className="h-4 w-4 text-muted-foreground" />
													)}
													<span className="text-sm">{bot.customer.name}</span>
												</div>
											) : (
												<span className="text-sm text-muted-foreground italic">Sin cliente</span>
											)}
										</TableCell>
										<TableCell>
											<Badge variant="outline" className="text-xs uppercase">
												{bot.provider}
											</Badge>
										</TableCell>
										<TableCell className="text-muted-foreground text-sm">{bot.model}</TableCell>
										<TableCell>
											<Badge variant={bot.is_active ? "default" : "secondary"}>
												{bot.is_active ? 'Activo' : 'Inactivo'}
											</Badge>
										</TableCell>
										<TableCell className="text-right">
											<div className="flex items-center justify-end gap-1">
												<Tooltip>
													<TooltipTrigger asChild>
														<Button variant="ghost" size="icon" asChild className="h-8 w-8">
															<Link to={`/chatbots/test/${bot.id}`}>
																<Bot className="h-4 w-4" />
															</Link>
														</Button>
													</TooltipTrigger>
													<TooltipContent>Probar Chatbot</TooltipContent>
												</Tooltip>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button variant="ghost" size="icon" asChild className="h-8 w-8">
															<Link to={`/chatbots/interactions/${bot.id}`}>
																<List className="h-4 w-4" />
															</Link>
														</Button>
													</TooltipTrigger>
													<TooltipContent>Historial de Interacciones</TooltipContent>
												</Tooltip>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button variant="ghost" size="icon" asChild className="h-8 w-8">
															<Link to={`/chatbots/knowledge/${bot.id}`}>
																<BookText className="h-4 w-4" />
															</Link>
														</Button>
													</TooltipTrigger>
													<TooltipContent>Base de Conocimiento</TooltipContent>
												</Tooltip>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button variant="ghost" size="icon" asChild className="h-8 w-8">
															<Link to="/chatbots/notes">
																<StickyNote className="h-4 w-4" />
															</Link>
														</Button>
													</TooltipTrigger>
													<TooltipContent>Notas</TooltipContent>
												</Tooltip>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden">
															<ChevronDown className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem asChild>
															<Link to={`/chatbots/edit/${bot.id}`}>
																<Edit className="mr-2 h-4 w-4" /> Editar
															</Link>
														</DropdownMenuItem>
														<DropdownMenuItem onClick={() => handleDeleteClick(bot)} className="text-red-500">
															<Trash2 className="mr-2 h-4 w-4" /> Eliminar
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
												<div className="hidden lg:flex items-center gap-1">
													<Tooltip>
														<TooltipTrigger asChild>
															<Button variant="ghost" size="icon" asChild className="h-8 w-8">
																<Link to={`/chatbots/edit/${bot.id}`}>
																	<Edit className="h-4 w-4" />
																</Link>
															</Button>
														</TooltipTrigger>
														<TooltipContent>Editar Chatbot</TooltipContent>
													</Tooltip>
													<Tooltip>
														<TooltipTrigger asChild>
															<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteClick(bot)}>
																<Trash2 className="h-4 w-4" />
															</Button>
														</TooltipTrigger>
														<TooltipContent>Eliminar Chatbot</TooltipContent>
													</Tooltip>
												</div>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>

						{meta.last_page > 1 && (
							<div className="flex items-center justify-end space-x-2 py-4">
								<Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
									<ChevronLeft className="h-4 w-4 mr-2" />
									Anterior
								</Button>
								<div className="flex items-center space-x-1">
									{renderPagination()}
								</div>
								<Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === meta.last_page}>
									Siguiente
									<ChevronRight className="h-4 w-4 ml-2" />
								</Button>
							</div>
						)}

						{selectedCount > 0 && (
							<div className="flex items-center justify-between py-4 border-t">
								<span className="text-sm text-muted-foreground">{selectedCount} seleccionados</span>
								<Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={isDeleting}>
									<Trash2 className="mr-2 h-4 w-4" />
									Eliminar seleccionados
								</Button>
							</div>
						)}

						<ConfirmationDialog
							open={deleteDialogOpen}
							onOpenChange={setDeleteDialogOpen}
							title="¿Eliminar Chatbot?"
							description={`Estás a punto de eliminar a "${botToDelete?.name}". Esta acción no se puede deshacer.`}
							confirmText="Eliminar"
							cancelText="Cancelar"
							onConfirm={handleConfirmDelete}
							loading={isDeleting}
						/>
					</CardContent>
				</Card>
			</div>
		</TooltipProvider>
	);
}
