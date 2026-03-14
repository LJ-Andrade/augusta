import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axiosClient from "@/lib/axios";
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
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "lucide-react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Can from "@/components/can";
import { useTranslation } from "react-i18next";
import { useBulkSelect } from "@/hooks/use-bulk-select";
import { BulkActionsBar } from "@/components/bulk-actions-bar";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { PageHeader } from "@/components/page-header";

export default function CategoriesList() {
	const { t } = useTranslation();
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(false);
	const [meta, setMeta] = useState({});
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [filterId, setFilterId] = useState("");
	const [debouncedFilterId, setDebouncedFilterId] = useState("");
	const [filterName, setFilterName] = useState("");
	const [debouncedFilterName, setDebouncedFilterName] = useState("");
	const [isFiltersOpen, setIsFiltersOpen] = useState(false);
	const [sortBy, setSortBy] = useState("id");
	const [sortDir, setSortDir] = useState("desc");
	const navigate = useNavigate();
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [categoryToDelete, setCategoryToDelete] = useState(null);

	const {
		selectedIds,
		selectedCount,
		isAllSelected,
		toggleSelect,
		toggleSelectAll,
		clearSelection,
		isSelected,
	} = useBulkSelect(categories);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearch(search);
			setDebouncedFilterId(filterId);
			setDebouncedFilterName(filterName);
		}, 500);

		return () => {
			clearTimeout(handler);
		};
	}, [search, filterId, filterName]);

	useEffect(() => {
		setPage(1);
	}, [debouncedSearch, debouncedFilterId, debouncedFilterName]);

	useEffect(() => {
		getCategories();
	}, [page, debouncedSearch, debouncedFilterId, debouncedFilterName, sortBy, sortDir]);

	useEffect(() => {
		clearSelection();
	}, [page, debouncedSearch, debouncedFilterId, debouncedFilterName, sortBy, sortDir]);

	const getCategories = () => {
		setLoading(true);
		axiosClient
			.get("product-categories", {
				params: {
					page,
					search: debouncedSearch,
					filter_id: debouncedFilterId,
					filter_name: debouncedFilterName,
					sort_by: sortBy,
					sort_dir: sortDir,
				},
			})
			.then(({ data }) => {
				setCategories(Array.isArray(data) ? data : data.data);
				setMeta(data.meta || {});
				setLoading(false);
			})
			.catch(() => {
				setLoading(false);
			});
	};

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
		setFilterId("");
		setFilterName("");
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

	const onDeleteClick = (category) => {
		setCategoryToDelete(category);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = () => {
		if (!categoryToDelete) return;
		axiosClient.delete(`product-categories/${categoryToDelete.id}`)
			.then(() => {
				toast.success(t('product_categories.delete_success'));
				getCategories();
			})
			.catch((error) => {
				toast.error(t('product_categories.delete_error'));
				console.error(error);
			})
			.finally(() => {
				setCategoryToDelete(null);
			});
	};

	const handleBulkDelete = () => {
		setIsDeleting(true);
		axiosClient.post('product-categories/bulk-delete', { ids: selectedIds })
			.then(() => {
				toast.success(t('common.bulk_delete_success'));
				clearSelection();
				getCategories();
			})
			.catch(() => {
				toast.error(t('common.bulk_delete_error'));
			})
			.finally(() => {
				setIsDeleting(false);
			});
	};

	const renderPagination = () => {
		const pages = [];
		if (!meta.last_page) return null;
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
			<PageHeader
				title={t('product_categories.title')}
				breadcrumbs={[
					{ label: "PRODUCTOS" },
					{ label: "Categorías" }
				]}
				actions={
					<Can permission="manage product categories">
						<Button asChild>
							<Link to="/product-categories/create">
								<Plus className="mr-2 h-4 w-4" /> {t('product_categories.create')}
							</Link>
						</Button>
					</Can>
				}
			/>

			<Card>
				<CardContent className="pt-6">
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
									placeholder={t('product_categories.search_placeholder')}
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
									<label htmlFor="filterId" className="text-sm font-medium">{t('categories.id')}</label>
									<Input
										id="filterId"
										placeholder={t('categories.id')}
										value={filterId}
										onChange={(e) => setFilterId(e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<label htmlFor="filterName" className="text-sm font-medium">{t('categories.name')}</label>
									<Input
										id="filterName"
										placeholder={t('categories.name')}
										value={filterName}
										onChange={(e) => setFilterName(e.target.value)}
									/>
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
										{t('product_categories.id')} {renderSortIcon("id")}
									</div>
								</TableHead>
								<TableHead
									className="cursor-pointer select-none"
									onClick={() => handleSort("name")}
								>
									<div className="flex items-center">
										{t('product_categories.name')} {renderSortIcon("name")}
									</div>
								</TableHead>
								<TableHead
									className="cursor-pointer select-none text-right w-[130px]"
									onClick={() => handleSort("created_at")}
								>
									<div className="flex items-center justify-end">
										{t('product_categories.created_at')} {renderSortIcon("created_at")}
									</div>
								</TableHead>
								<TableHead className="text-right w-[120px]">{t('common.actions')}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody className={loading ? "opacity-50 pointer-events-none" : ""}>
							{loading && categories.length === 0 && (
								<TableRow>
									<TableCell colSpan={5} className="text-center">
										{t('common.loading')}
									</TableCell>
								</TableRow>
							)}
							{!loading && categories.length === 0 && (
								<TableRow>
									<TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
										{t('common.no_data')}
									</TableCell>
								</TableRow>
							)}
							{categories.map((category) => (
								<TableRow key={category.id} className="h-10">
									<TableCell className="py-2">
										<Checkbox
											checked={isSelected(category.id)}
											onCheckedChange={() => toggleSelect(category.id)}
										/>
									</TableCell>
									<TableCell className="py-2 w-[60px]">{category.id}</TableCell>
									<TableCell className="font-medium py-2">{category.name}</TableCell>
									<TableCell className="py-2 text-right w-[130px]">{formatDate(category.created_at)}</TableCell>
									<TableCell className="text-right py-2 w-[120px]">
										<div className="flex items-center justify-end gap-1">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden">
														<ChevronDown className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<Can permission="manage product categories">
														<DropdownMenuItem onClick={() => navigate(`/product-categories/edit/${category.id}`)}>
															<Edit className="mr-2 h-4 w-4" /> Editar
														</DropdownMenuItem>
														<DropdownMenuItem onClick={() => onDeleteClick(category)} className="text-red-500">
															<Trash2 className="mr-2 h-4 w-4" /> Eliminar
														</DropdownMenuItem>
													</Can>
												</DropdownMenuContent>
											</DropdownMenu>
											<div className="hidden lg:flex items-center gap-1">
												<Can permission="manage product categories">
													<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/product-categories/edit/${category.id}`)}>
														<Edit className="h-4 w-4" />
													</Button>
													<Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onDeleteClick(category)}>
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
				<BulkActionsBar
					selectedCount={selectedCount}
					onDelete={handleBulkDelete}
					onClear={clearSelection}
					isDeleting={isDeleting}
				/>
			</Card>
		</div>
	);
}
