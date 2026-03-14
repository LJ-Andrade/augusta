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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { PageHeader } from "@/components/page-header";
import { BulkActionsBar } from "@/components/bulk-actions-bar";
import { useBulkSelect } from "@/hooks/use-bulk-select";
import { format } from "date-fns";

export default function TagsList() {
	const { t } = useTranslation();
	const [tags, setTags] = useState([]);
	const [loading, setLoading] = useState(false);
	const [meta, setMeta] = useState({});
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [isFiltersOpen, setIsFiltersOpen] = useState(false);
	const [sortBy, setSortBy] = useState("id");
	const [sortDir, setSortDir] = useState("desc");
	const navigate = useNavigate();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [tagToDelete, setTagToDelete] = useState(null);

	// Advanced filter states
	const [filterId, setFilterId] = useState("");
	const [filterName, setFilterName] = useState("");

	// Bulk selection
	const {
		selectedItems,
		isAllSelected,
		isIndeterminate,
		handleSelectItem,
		handleSelectAll,
		clearSelection,
	} = useBulkSelect(tags.map(t => t.id));

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
	}, [debouncedSearch]);

	useEffect(() => {
		getTags();
	}, [page, debouncedSearch, sortBy, sortDir, filterId, filterName]);

	const getTags = () => {
		setLoading(true);
		axiosClient
			.get("product-tags", {
				params: {
					page,
					search: debouncedSearch,
					sort_by: sortBy,
					sort_dir: sortDir,
					filter_id: filterId || undefined,
					filter_name: filterName || undefined,
				},
			})
			.then(({ data }) => {
				setTags(data.data || []);
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

	const handleBulkDelete = async () => {
		try {
			await axiosClient.post("/product-tags/bulk-delete", {
				ids: selectedItems,
			});
			toast.success(`${selectedItems.length} etiquetas eliminadas`);
			clearSelection();
			getTags();
		} catch (error) {
			toast.error("Error al eliminar etiquetas");
		}
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

	const onDeleteClick = (tag) => {
		setTagToDelete(tag);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = () => {
		if (!tagToDelete) return;
		axiosClient.delete(`product-tags/${tagToDelete.id}`)
			.then(() => {
				toast.success(t('product_tags.delete_success'));
				getTags();
			})
			.catch((error) => {
				toast.error(t('product_tags.delete_error'));
				console.error(error);
			})
			.finally(() => {
				setTagToDelete(null);
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
				title="Etiquetas"
				breadcrumbs={[
					{ label: "Productos", href: "/products" },
					{ label: "Etiquetas" },
				]}
			/>

			<div className="flex justify-end items-center">
				<Can permission="manage product tags">
					<Button asChild>
						<Link to="/product-tags/create">
							<Plus className="mr-2 h-4 w-4" /> {t('product_tags.create')}
						</Link>
					</Button>
				</Can>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>{t('product_tags.manage')}</CardTitle>
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
									placeholder={t('product_tags.search_placeholder')}
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
							<div className="flex gap-2">
								<Input
									placeholder="Filtrar por ID..."
									value={filterId}
									onChange={(e) => setFilterId(e.target.value)}
									className="w-32"
								/>
								<Input
									placeholder="Filtrar por nombre..."
									value={filterName}
									onChange={(e) => setFilterName(e.target.value)}
									className="w-48"
								/>
								<Button variant="ghost" size="sm" onClick={handleClearFilters}>
									<X className="mr-2 h-4 w-4" />
									{t('products.clear_filters')}
								</Button>
							</div>
						</CollapsibleContent>
					</Collapsible>

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-12">
									<Checkbox
										checked={isAllSelected}
										ref={(el) => {
											if (el) el.indeterminate = isIndeterminate;
										}}
										onCheckedChange={handleSelectAll}
									/>
								</TableHead>
								<TableHead
									className="cursor-pointer select-none w-[60px]"
									onClick={() => handleSort("id")}
								>
									<div className="flex items-center">
										{t('product_tags.id')} {renderSortIcon("id")}
									</div>
								</TableHead>
								<TableHead
									className="cursor-pointer select-none"
									onClick={() => handleSort("name")}
								>
									<div className="flex items-center">
										{t('product_tags.name')} {renderSortIcon("name")}
									</div>
								</TableHead>
								<TableHead
									className="cursor-pointer select-none"
									onClick={() => handleSort("slug")}
								>
									<div className="flex items-center">
										{t('product_tags.slug')} {renderSortIcon("slug")}
									</div>
								</TableHead>
								<TableHead>Creado</TableHead>
								<TableHead className="text-right w-[120px]">{t('common.actions')}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody className={loading ? "opacity-50 pointer-events-none" : ""}>
							{loading && tags.length === 0 && (
								<TableRow>
									<TableCell colSpan={6} className="text-center">
										{t('common.loading')}
									</TableCell>
								</TableRow>
							)}
							{!loading && tags.length === 0 && (
								<TableRow>
									<TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
										{t('common.no_data')}
									</TableCell>
								</TableRow>
							)}
							{tags.map((tag) => (
								<TableRow key={tag.id}>
									<TableCell>
										<Checkbox
											checked={selectedItems.includes(tag.id)}
											onCheckedChange={() => handleSelectItem(tag.id)}
										/>
									</TableCell>
									<TableCell className="w-[60px]">{tag.id}</TableCell>
									<TableCell className="font-medium">{tag.name}</TableCell>
									<TableCell>{tag.slug}</TableCell>
									<TableCell>{format(new Date(tag.created_at), "dd/MM/yyyy")}</TableCell>
									<TableCell className="text-right w-[120px]">
										<div className="flex items-center justify-end gap-1">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden">
														<ChevronDown className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<Can permission="manage product tags">
														<DropdownMenuItem onClick={() => navigate(`/product-tags/edit/${tag.id}`)}>
															<Edit className="mr-2 h-4 w-4" /> Editar
														</DropdownMenuItem>
														<DropdownMenuItem onClick={() => onDeleteClick(tag)} className="text-red-500">
															<Trash2 className="mr-2 h-4 w-4" /> Eliminar
														</DropdownMenuItem>
													</Can>
												</DropdownMenuContent>
											</DropdownMenu>
											<div className="hidden lg:flex items-center gap-1">
												<Can permission="manage product tags">
													<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/product-tags/edit/${tag.id}`)}>
														<Edit className="h-4 w-4" />
													</Button>
													<Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onDeleteClick(tag)}>
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

					{selectedItems.length > 0 && (
						<BulkActionsBar
							selectedCount={selectedItems.length}
							onDelete={handleBulkDelete}
							onClear={clearSelection}
						/>
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
			</Card>
		</div>
	);
}
