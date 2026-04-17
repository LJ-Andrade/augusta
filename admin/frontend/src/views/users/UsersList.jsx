import { useEffect, useState } from "react";
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

export default function UsersList() {
	const { t } = useTranslation();
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [meta, setMeta] = useState({});
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [filterId, setFilterId] = useState("");
	const [debouncedFilterId, setDebouncedFilterId] = useState("");
	const [filterName, setFilterName] = useState("");
	const [debouncedFilterName, setDebouncedFilterName] = useState("");
	const [filterEmail, setFilterEmail] = useState("");
	const [debouncedFilterEmail, setDebouncedFilterEmail] = useState("");
	const [isFiltersOpen, setIsFiltersOpen] = useState(false);
	const [sortBy, setSortBy] = useState("id");
	const [sortDir, setSortDir] = useState("desc");
	const navigate = useNavigate();
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [userToDelete, setUserToDelete] = useState(null);

	const {
		selectedIds,
		selectedCount,
		isAllSelected,
		toggleSelect,
		toggleSelectAll,
		clearSelection,
		isSelected,
	} = useBulkSelect(users);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearch(search);
			setDebouncedFilterId(filterId);
			setDebouncedFilterName(filterName);
			setDebouncedFilterEmail(filterEmail);
		}, 500);

		return () => {
			clearTimeout(handler);
		};
	}, [search, filterId, filterName, filterEmail]);

	useEffect(() => {
		setPage(1);
	}, [debouncedSearch, debouncedFilterId, debouncedFilterName, debouncedFilterEmail]);

	useEffect(() => {
		getUsers();
	}, [page, debouncedSearch, debouncedFilterId, debouncedFilterName, debouncedFilterEmail, sortBy, sortDir]);

	useEffect(() => {
		clearSelection();
	}, [page, debouncedSearch, debouncedFilterId, debouncedFilterName, debouncedFilterEmail, sortBy, sortDir]);

	const getUsers = () => {
		setLoading(true);
		axiosClient
			.get("users", {
				params: {
					page,
					search: debouncedSearch,
					filter_id: debouncedFilterId,
					filter_name: debouncedFilterName,
					filter_email: debouncedFilterEmail,
					sort_by: sortBy,
					sort_dir: sortDir,
				},
			})
			.then(({ data }) => {
				setUsers(data.data);
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
		setFilterEmail("");
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

	const onDeleteClick = (user) => {
		setUserToDelete(user);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = () => {
		if (!userToDelete) return;
		axiosClient.delete(`users/${userToDelete.id}`)
			.then(() => {
				toast.success(t('users.delete_success'));
				getUsers();
			})
			.catch((error) => {
				toast.error(t('users.delete_error'));
				console.error(error);
			})
			.finally(() => {
				setUserToDelete(null);
			});
	};

	const handleBulkDelete = () => {
		setIsDeleting(true);
		axiosClient.post('users/bulk-delete', { ids: selectedIds })
			.then(() => {
				toast.success(t('common.bulk_delete_success'));
				clearSelection();
				getUsers();
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
				<h1 className="text-3xl font-bold tracking-tight">{t('users.title')}</h1>
				<Can permission="create users">
					<Button asChild>
						<Link to="/users/create">
							<Plus className="mr-2 h-4 w-4" /> {t('users.create')}
						</Link>
					</Button>
				</Can>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>{t('users.manage')}</CardTitle>
				</CardHeader>
				<CardContent>
					<Collapsible
						open={isFiltersOpen}
						onOpenChange={setIsFiltersOpen}
						className="space-y-4 pb-4"
					>
						<div className="flex items-center justify-between">
							<div className="relative w-full max-w-sm">
								<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									type="search"
									placeholder={t('users.search_placeholder')}
									className="pl-8"
									value={search}
									onChange={(e) => setSearch(e.target.value)}
								/>
							</div>
							<CollapsibleTrigger asChild>
								<Button variant="outline" size="sm">
									<Filter className="mr-2 h-4 w-4" />
									{t('users.advanced_search')}
									<ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isFiltersOpen ? "rotate-180" : ""}`} />
								</Button>
							</CollapsibleTrigger>
						</div>

						<CollapsibleContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
								<div className="space-y-2">
									<label htmlFor="filterId" className="text-sm font-medium">{t('users.id')}</label>
									<Input
										id="filterId"
										placeholder={t('users.filter_id')}
										value={filterId}
										onChange={(e) => setFilterId(e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<label htmlFor="filterName" className="text-sm font-medium">{t('users.name')}</label>
									<Input
										id="filterName"
										placeholder={t('users.filter_name')}
										value={filterName}
										onChange={(e) => setFilterName(e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<label htmlFor="filterEmail" className="text-sm font-medium">{t('users.email')}</label>
									<Input
										id="filterEmail"
										placeholder={t('users.filter_email')}
										value={filterEmail}
										onChange={(e) => setFilterEmail(e.target.value)}
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
									{t('users.clear_filters')}
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
										{t('users.id')} {renderSortIcon("id")}
									</div>
								</TableHead>
								<TableHead
									className="cursor-pointer select-none"
									onClick={() => handleSort("name")}
								>
									<div className="flex items-center">
										{t('users.name')} {renderSortIcon("name")}
									</div>
								</TableHead>
								<TableHead
									className="cursor-pointer select-none"
									onClick={() => handleSort("email")}
								>
									<div className="flex items-center">
										{t('users.email')} {renderSortIcon("email")}
									</div>
								</TableHead>
								<TableHead>{t('users.roles')}</TableHead>
								<TableHead
									className="cursor-pointer select-none text-right w-[130px]"
									onClick={() => handleSort("created_at")}
								>
									<div className="flex items-center justify-end">
										{t('users.created_at')} {renderSortIcon("created_at")}
									</div>
								</TableHead>
								<TableHead className="text-right w-[120px]">{t('common.actions')}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody className={loading ? "opacity-50 pointer-events-none" : ""}>
							{loading && users.length === 0 && (
								<TableRow>
									<TableCell colSpan={7} className="text-center">
										{t('common.loading')}
									</TableCell>
								</TableRow>
							)}
							{!loading && users.length === 0 && (
								<TableRow>
									<TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
										{t('common.no_data')}
									</TableCell>
								</TableRow>
							)}
							{users.map((user) => (
								<TableRow key={user.id}>
									<TableCell>
										<Checkbox
											checked={isSelected(user.id)}
											onCheckedChange={() => toggleSelect(user.id)}
										/>
									</TableCell>
									<TableCell className="w-[60px]">{user.id}</TableCell>
									<TableCell>{user.name}</TableCell>
									<TableCell>{user.email}</TableCell>
									<TableCell>
										<div className="flex flex-wrap gap-1">
											{user.roles?.map((role) => (
												<Badge key={role.id} variant="secondary">
													{role.name}
												</Badge>
											))}
										</div>
									</TableCell>
									<TableCell className="text-right w-[130px]">{user.created_at ? formatDate(user.created_at) : ''}</TableCell>
									<TableCell className="text-right w-[120px]">
										<div className="flex items-center justify-end gap-1">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden">
														<ChevronDown className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<Can permission="edit users">
														<DropdownMenuItem onClick={() => navigate(`/users/edit/${user.id}`)}>
															<Edit className="mr-2 h-4 w-4" /> Editar
														</DropdownMenuItem>
													</Can>
													<Can permission="delete users">
														<DropdownMenuItem onClick={() => onDeleteClick(user)} className="text-red-500">
															<Trash2 className="mr-2 h-4 w-4" /> Eliminar
														</DropdownMenuItem>
													</Can>
												</DropdownMenuContent>
											</DropdownMenu>
											<div className="hidden lg:flex items-center gap-1">
												<Can permission="edit users">
													<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/users/edit/${user.id}`)}>
														<Edit className="h-4 w-4" />
													</Button>
												</Can>
												<Can permission="delete users">
													<Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onDeleteClick(user)}>
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
				</CardContent>
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
			</Card>
		</div>
	);
}
