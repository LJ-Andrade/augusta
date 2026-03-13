import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axiosClient from "@/lib/axios";
import { formatDate } from "@/lib/utils";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Plus,
	Edit,
	Trash2,
	ChevronLeft,
	ChevronRight,
	Search,
	ArrowUpDown,
	ArrowUp,
	ArrowDown,
	Filter,
	X,
	ChevronDown,
	Image as ImageIcon,
	Star,
	Eye,
} from "lucide-react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Can from "@/components/can";
import { useTranslation } from "react-i18next";
import { useBulkSelect } from "@/hooks/use-bulk-select";
import { BulkActionsBar } from "@/components/bulk-actions-bar";
import { ConfirmationDialog } from "@/components/confirmation-dialog";

export default function ProductsList() {
	const { t } = useTranslation();
	const [products, setProducts] = useState([]);
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(false);
	const [meta, setMeta] = useState({});
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [filterCategory, setFilterCategory] = useState("");
	const [filterStatus, setFilterStatus] = useState("");
	const [isFiltersOpen, setIsFiltersOpen] = useState(false);
	const [sortBy, setSortBy] = useState("id");
	const [sortDir, setSortDir] = useState("desc");
	const navigate = useNavigate();
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [productToDelete, setProductToDelete] = useState(null);

	const {
		selectedIds,
		selectedCount,
		isAllSelected,
		toggleSelect,
		toggleSelectAll,
		clearSelection,
		isSelected,
	} = useBulkSelect(products);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearch(search);
		}, 500);

		return () => {
			clearTimeout(handler);
		};
	}, [search]);

	useEffect(() => {
		setPage(1);
	}, [debouncedSearch, filterCategory, filterStatus]);

	useEffect(() => {
		getProducts();
	}, [page, debouncedSearch, filterCategory, filterStatus, sortBy, sortDir]);

	useEffect(() => {
		clearSelection();
	}, [page, debouncedSearch, filterCategory, filterStatus, sortBy, sortDir]);

	useEffect(() => {
		axiosClient.get("product-categories?all=1").then(({ data }) => {
			setCategories(data.data || []);
		});
	}, []);

	const getProducts = () => {
		setLoading(true);
		axiosClient
			.get("products", {
				params: {
					page,
					search: debouncedSearch,
					category_id: filterCategory,
					status: filterStatus,
					sort_by: sortBy,
					sort_dir: sortDir,
				},
			})
			.then(({ data }) => {
				setProducts(data.data);
				setMeta(data.meta || {});
				setLoading(false);
			})
			.catch(() => {
				setLoading(false);
			});
	};

	const quickUpdate = useCallback((id, field, value) => {
		const previousProducts = [...products];
		setProducts(products.map(product =>
			product.id === id ? { ...product, [field]: value } : product
		));

		axiosClient.patch(`/products/${id}/quick-update`, { [field]: value })
			.then(() => {
				toast.success(t('products.update_success'));
			})
			.catch((error) => {
				setProducts(previousProducts);
				toast.error(t('common.error_occurred'));
				console.error(error);
			});
	}, [products, t]);

	const handleToggleFeatured = (product) => {
		quickUpdate(product.id, 'featured', !product.featured);
	};

	const handleStatusChange = (product, newStatus) => {
		quickUpdate(product.id, 'status', newStatus);
	};

	const handleOrderChange = useCallback((id, newOrder) => {
		quickUpdate(id, 'order', parseInt(newOrder) || 0);
	}, [quickUpdate]);

	const handleSort = (column) => {
		if (sortBy === column) {
			setSortDir(sortDir === "asc" ? "desc" : "asc");
		} else {
			setSortBy(column);
			setSortDir("asc");
		}
	};

	const handleClearFilters = () => {
		setSearch("");
		setFilterCategory("");
		setFilterStatus("");
		setPage(1);
	};

	const renderSortIcon = (column) => {
		if (sortBy !== column) {
			return <ArrowUpDown className="ml-2 h-4 w-4" />;
		}
		return sortDir === "asc" ? (
			<ArrowUp className="ml-2 h-4 w-4" />
		) : (
			<ArrowDown className="ml-2 h-4 w-4" />
		);
	};

	const onDeleteClick = (product) => {
		setProductToDelete(product);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = () => {
		if (!productToDelete) return;
		axiosClient.delete(`products/${productToDelete.id}`)
			.then(() => {
				toast.success(t('products.delete_success'));
				getProducts();
			})
			.catch((error) => {
				toast.error(t('products.delete_error'));
				console.error(error);
			})
			.finally(() => {
				setProductToDelete(null);
			});
	};

	const handleBulkDelete = () => {
		setIsDeleting(true);
		axiosClient.post('products/bulk-delete', { ids: selectedIds })
			.then(() => {
				toast.success(t('common.bulk_delete_success'));
				clearSelection();
				getProducts();
			})
			.catch(() => {
				toast.error(t('common.bulk_delete_error'));
			})
			.finally(() => {
				setIsDeleting(false);
			});
	};

	const getStatusBadge = (status) => {
		switch (status) {
			case 'published':
				return <Badge className="bg-green-500">{t('products.status_published')}</Badge>;
			case 'draft':
				return <Badge variant="secondary">{t('products.status_draft')}</Badge>;
			case 'archived':
				return <Badge variant="destructive">{t('products.status_archived')}</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	const renderPagination = () => {
		const pages = [];
		const startPage = Math.max(1, page - 2);
		const endPage = Math.min(meta.last_page, startPage + 4);
		const adjustedStartPage = Math.max(1, endPage - 4);

		for (let i = adjustedStartPage; i <= endPage; i++) {
			pages.push(
				<Button
					key={i}
					variant={page === i ? "default" : "outline"}
					size="sm"
					onClick={() => setPage(i)}
				>
					{i}
				</Button>
			);
		}
		return pages;
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold tracking-tight">{t('products.title')}</h1>
				<Can permission="create products">
					<Button asChild>
						<Link to="/products/create">
							<Plus className="mr-2 h-4 w-4" /> {t('products.create')}
						</Link>
					</Button>
				</Can>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>{t('products.manage')}</CardTitle>
				</CardHeader>
				<CardContent>
					<Collapsible
						open={isFiltersOpen}
						onOpenChange={setIsFiltersOpen}
						className="space-y-4 pb-4"
					>
						<div className="flex items-center justify-between gap-4">
							<div className="relative w-full max-w-sm">
								<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									type="search"
									placeholder={t('products.search_placeholder')}
									className="pl-8"
									value={search}
									onChange={(e) => setSearch(e.target.value)}
								/>
							</div>
							<CollapsibleTrigger asChild>
								<Button variant="outline" size="sm">
									<Filter className="mr-2 h-4 w-4" />
									{t('products.advanced_search')}
									<ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isFiltersOpen ? "rotate-180" : ""}`} />
								</Button>
							</CollapsibleTrigger>
						</div>

						<CollapsibleContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
								<div className="space-y-2">
									<label htmlFor="filterCategory" className="text-sm font-medium">{t('products.category')}</label>
									<select
										id="filterCategory"
										className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
										value={filterCategory}
										onChange={(e) => setFilterCategory(e.target.value)}
									>
										<option value="">{t('products.all_categories')}</option>
										{categories.map((category) => (
											<option key={category.id} value={category.id}>
												{category.name}
											</option>
										))}
									</select>
								</div>
								<div className="space-y-2">
									<label htmlFor="filterStatus" className="text-sm font-medium">{t('products.status')}</label>
									<select
										id="filterStatus"
										className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
										value={filterStatus}
										onChange={(e) => setFilterStatus(e.target.value)}
									>
										<option value="">{t('products.all_statuses')}</option>
										<option value="draft">{t('products.status_draft')}</option>
										<option value="published">{t('products.status_published')}</option>
										<option value="archived">{t('products.status_archived')}</option>
									</select>
								</div>
							</div>
							<div className="flex justify-end">
								<Button
									variant="ghost"
									size="sm"
									onClick={handleClearFilters}
								>
									<X className="mr-2 h-4 w-4" />
									{t('products.clear_filters')}
								</Button>
							</div>
						</CollapsibleContent>
					</Collapsible>

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-10">
									<Checkbox
										checked={isAllSelected}
										onCheckedChange={toggleSelectAll}
									/>
								</TableHead>
								<TableHead
									className="cursor-pointer select-none w-[60px]"
									onClick={() => handleSort("id")}
								>
									<div className="flex items-center">
										{t('products.id')} {renderSortIcon("id")}
									</div>
								</TableHead>
								<TableHead>{t('products.cover')}</TableHead>
								<TableHead
									className="cursor-pointer select-none"
									onClick={() => handleSort("name")}
								>
									<div className="flex items-center">
										{t('products.name')} {renderSortIcon("name")}
									</div>
								</TableHead>
								<TableHead>{t('products.category')}</TableHead>
								<TableHead>{t('products.prices')}</TableHead>
								<TableHead>{t('products.status')}</TableHead>
								<TableHead
									className="cursor-pointer select-none w-[120px]"
									onClick={() => handleSort("featured")}
								>
									<div className="flex items-center">
										{t('products.featured')} {renderSortIcon("featured")}
									</div>
								</TableHead>
								<TableHead
									className="cursor-pointer select-none text-right w-[130px]"
									onClick={() => handleSort("created_at")}
								>
									<div className="flex items-center justify-end">
										{t('products.created_at')} {renderSortIcon("created_at")}
									</div>
								</TableHead>
								<TableHead className="text-right w-[150px]">{t('common.actions')}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody className={loading ? "opacity-50 pointer-events-none" : ""}>
							{loading && products.length === 0 && (
								<TableRow>
									<TableCell colSpan={10} className="text-center">
										{t('common.loading')}
									</TableCell>
								</TableRow>
							)}
							{!loading && products.length === 0 && (
								<TableRow>
									<TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
										{t('common.no_data')}
									</TableCell>
								</TableRow>
							)}
							{products.map((product) => (
								<TableRow key={product.id}>
									<TableCell>
										<Checkbox
											checked={isSelected(product.id)}
											onCheckedChange={() => toggleSelect(product.id)}
										/>
									</TableCell>
									<TableCell className="w-[60px]">{product.id}</TableCell>
									<TableCell>
										{product.cover_url ? (
											<img
												src={product.cover_url}
												alt={product.name}
												className="h-10 w-10 object-cover rounded shadow-sm"
											/>
										) : (
											<div className="h-10 w-10 bg-muted flex items-center justify-center rounded">
												<ImageIcon className="h-5 w-5 text-muted-foreground" />
											</div>
										)}
									</TableCell>
									<TableCell className="font-medium">{product.name}</TableCell>
									<TableCell>{product.category?.name}</TableCell>
									<TableCell>
										<div className="text-xs">
											<div>{product.cost_price}</div>
											<div className="font-medium">{product.sale_price}</div>
										</div>
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" className="h-8 w-full justify-start px-2">
													{getStatusBadge(product.status)}
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="start">
												<DropdownMenuItem onClick={() => handleStatusChange(product, 'draft')}>
													{t('products.status_draft')}
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleStatusChange(product, 'published')}>
													{t('products.status_published')}
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleStatusChange(product, 'archived')}>
													{t('products.status_archived')}
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
									<TableCell className="w-[120px]">
										<div className="flex items-center gap-2">
											<button
												onClick={() => handleToggleFeatured(product)}
												className="focus:outline-none"
											>
												{product.featured ? (
													<Star className="h-4 w-4 fill-yellow-400 text-yellow-400 shrink-0 cursor-pointer hover:scale-110 transition-transform" />
												) : (
													<Star className="h-4 w-4 text-muted-foreground/30 shrink-0 cursor-pointer hover:scale-110 transition-transform" />
												)}
											</button>
											<Input
												type="number"
												className="h-7 w-16 text-sm"
												value={product.order ?? 0}
												onChange={(e) => handleOrderChange(product.id, e.target.value)}
											/>
										</div>
									</TableCell>
									<TableCell className="text-right w-[130px]">{formatDate(product.created_at)}</TableCell>
									<TableCell className="text-right">
										<div className="flex items-center justify-end gap-1">
											<Can permission="view products">
												<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/products/${product.id}`)}>
													<Eye className="h-4 w-4" />
												</Button>
											</Can>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden">
														<ChevronDown className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<Can permission="edit products">
														<DropdownMenuItem onClick={() => navigate(`/products/edit/${product.id}`)}>
															<Edit className="mr-2 h-4 w-4" /> Editar
														</DropdownMenuItem>
													</Can>
													<Can permission="delete products">
														<DropdownMenuItem onClick={() => onDeleteClick(product)} className="text-red-500">
															<Trash2 className="mr-2 h-4 w-4" /> Eliminar
														</DropdownMenuItem>
													</Can>
												</DropdownMenuContent>
											</DropdownMenu>
											<div className="hidden lg:flex items-center gap-1">
												<Can permission="edit products">
													<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/products/edit/${product.id}`)}>
														<Edit className="h-4 w-4" />
													</Button>
												</Can>
												<Can permission="delete products">
													<Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onDeleteClick(product)}>
														<Trash2 className="h-4 w-4" />
													</Button>
												</Can>
											</div>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>

					{meta.last_page > 1 && (
						<div className="flex items-center justify-end space-x-2 py-4">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage(page - 1)}
								disabled={page === 1}
							>
								<ChevronLeft className="h-4 w-4 mr-2" />
								{t('common.previous')}
							</Button>
							<div className="flex items-center space-x-1">
								{renderPagination()}
							</div>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage(page + 1)}
								disabled={page === meta.last_page}
							>
								{t('common.next')}
								<ChevronRight className="h-4 w-4 ml-2" />
							</Button>
						</div>
					)}

					<BulkActionsBar
						selectedCount={selectedCount}
						onDelete={handleBulkDelete}
						onClear={clearSelection}
						isDeleting={isDeleting}
					/>

					<ConfirmationDialog
						open={deleteDialogOpen}
						onOpenChange={setDeleteDialogOpen}
						title={t('common.confirm_delete')}
						description={t('common.confirm_delete_description')}
						confirmText={t('common.confirm')}
						cancelText={t('common.cancel')}
						onConfirm={handleConfirmDelete}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
