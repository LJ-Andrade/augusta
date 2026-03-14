import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
	Plus,
	Edit,
	Trash2,
	Search,
	Filter,
	X,
	ChevronDown,
} from 'lucide-react';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
	DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import Can from '@/components/can';
import { useTranslation } from 'react-i18next';
import { useCrudList } from '@/hooks/use-crud-list';
import { CrudTable } from '@/components/crud-table';
import { CrudPagination } from '@/components/crud-pagination';
import { BulkActionsBar } from '@/components/bulk-actions-bar';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { PageHeader } from '@/components/page-header';

// Color preview cell component
const ColorPreview = ({ hexColor }) => (
	<div className="flex items-center gap-2">
		<div
			className="w-6 h-6 rounded border border-gray-300"
			style={{ backgroundColor: hexColor }}
		/>
		<span className="text-xs text-muted-foreground">{hexColor}</span>
	</div>
);

export default function ProductColorsList() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [isFiltersOpen, setIsFiltersOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [colorToDelete, setColorToDelete] = useState(null);

	const {
		items: colors,
		loading,
		meta,
		page,
		setPage,
		filters,
		setFilter,
		clearFilters,
		sortBy,
		sortDir,
		handleSort,
		deleteItem,
		bulkDelete,
		selectedIds,
		selectedCount,
		isAllSelected,
		toggleSelect,
		toggleSelectAll,
		clearSelection,
	} = useCrudList({
		endpoint: 'product-colors',
		filterKeys: ['search', 'filter_id', 'filter_name'],
		defaultSort: { column: 'id', direction: 'desc' },
	});

	const columns = [
		{ key: 'id', label: t('product_colors.id') || 'ID', sortable: true, width: 'w-[60px]' },
		{ key: 'name', label: t('product_colors.name') || 'Nombre', sortable: true },
		{
			key: 'hex_color',
			label: t('product_colors.hex_color') || 'Color',
			sortable: false,
			render: (value) => <ColorPreview hexColor={value} />
		},
		{ key: 'created_at', label: t('product_colors.created_at') || 'Creado', sortable: true, align: 'right', width: 'w-[130px]', format: 'date' },
	];

	const handleDeleteClick = (color) => {
		setColorToDelete(color);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!colorToDelete) return;

		const success = await deleteItem(colorToDelete.id, {
			successMessage: t('product_colors.delete_success') || 'Color eliminado correctamente',
			errorMessage: t('product_colors.delete_error') || 'Error al eliminar el color',
		});

		if (success) {
			setDeleteDialogOpen(false);
			setColorToDelete(null);
		}
	};

	const handleBulkDeleteClick = async () => {
		const success = await bulkDelete(selectedIds, {
			successMessage: t('common.bulk_delete_success'),
			errorMessage: t('common.bulk_delete_error'),
		});

		if (success) {
			setIsDeleting(false);
		}
	};

	const renderActions = (color, isDropdown = false) => (
		<Can permission="manage product colors">
			{isDropdown ? (
				<>
					<DropdownMenuItem onClick={() => navigate(`/product-colors/edit/${color.id}`)}>
						<Edit className="mr-2 h-4 w-4" /> {t('common.edit')}
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => handleDeleteClick(color)} className="text-red-500">
						<Trash2 className="mr-2 h-4 w-4" /> {t('common.delete')}
					</DropdownMenuItem>
				</>
			) : (
				<>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={() => navigate(`/product-colors/edit/${color.id}`)}
					>
						<Edit className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-red-500"
						onClick={() => handleDeleteClick(color)}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</>
			)}
		</Can>
	);

	return (
		<div className="space-y-6">
			<PageHeader
				title={t('product_colors.title') || 'Colores'}
				breadcrumbs={[
					{ label: 'PRODUCTOS' },
					{ label: t('product_colors.title') || 'Colores' },
				]}
			/>

			<Card>
				<CardHeader className="flex flex-row items-center justify-start gap-2">
					<Can permission="manage product colors">
						<Button asChild>
							<Link to="/product-colors/create">
								<Plus className="mr-2 h-4 w-4" /> {t('product_colors.create') || 'Crear Color'}
							</Link>
						</Button>
					</Can>
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
									placeholder={t('product_colors.search_placeholder') || 'Buscar colores...'}
									className="pl-8"
									value={filters.search}
									onChange={(e) => setFilter('search', e.target.value)}
								/>
							</div>
							<CollapsibleTrigger asChild>
								<Button variant="outline" size="sm">
									<Filter className="mr-2 h-4 w-4" />
									{t('products.advanced_search') || 'Búsqueda avanzada'}
									<ChevronDown
										className={`ml-2 h-4 w-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''
											}`}
									/>
								</Button>
							</CollapsibleTrigger>
						</div>

						<CollapsibleContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
								<div className="space-y-2">
									<label htmlFor="filterId" className="text-sm font-medium">
										{t('product_colors.id') || 'ID'}
									</label>
									<Input
										id="filterId"
										placeholder={t('product_colors.id') || 'ID'}
										value={filters.filter_id}
										onChange={(e) => setFilter('filter_id', e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<label htmlFor="filterName" className="text-sm font-medium">
										{t('product_colors.name') || 'Nombre'}
									</label>
									<Input
										id="filterName"
										placeholder={t('product_colors.name') || 'Nombre'}
										value={filters.filter_name}
										onChange={(e) => setFilter('filter_name', e.target.value)}
									/>
								</div>
							</div>
							<div className="flex justify-end">
								<Button variant="ghost" size="sm" onClick={clearFilters}>
									<X className="mr-2 h-4 w-4" />
									{t('products.clear_filters') || 'Limpiar filtros'}
								</Button>
							</div>
						</CollapsibleContent>
					</Collapsible>

					<CrudTable
						items={colors}
						columns={columns}
						loading={loading}
						selectable={true}
						selectedIds={selectedIds}
						isAllSelected={isAllSelected}
						onSelect={toggleSelect}
						onSelectAll={toggleSelectAll}
						sortBy={sortBy}
						sortDir={sortDir}
						onSort={handleSort}
						actions={renderActions}
						emptyMessage={t('common.no_data')}
						loadingMessage={t('common.loading')}
					/>

					<CrudPagination
						meta={meta}
						page={page}
						onPageChange={setPage}
						prevLabel={t('common.previous')}
						nextLabel={t('common.next')}
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

				<BulkActionsBar
					selectedCount={selectedCount}
					onDelete={handleBulkDeleteClick}
					onClear={clearSelection}
				/>
			</Card>
		</div>
	);
}
