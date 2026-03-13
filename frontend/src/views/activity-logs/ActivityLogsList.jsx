import { useEffect, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ChevronLeft,
	ChevronRight,
	Loader2,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ActivityLogsList() {
	const { t } = useTranslation();
	const [logs, setLogs] = useState([]);
	const [loading, setLoading] = useState(false);
	const [meta, setMeta] = useState({});
	const [page, setPage] = useState(1);

	useEffect(() => {
		getLogs();
	}, [page]);

	const getLogs = () => {
		setLoading(true);
		axiosClient
			.get("activity-logs", {
				params: {
					page,
				},
			})
			.then(({ data }) => {
				setLogs(data.data);
				setMeta(data.meta || {});
				setLoading(false);
			})
			.catch(() => {
				setLoading(false);
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
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold tracking-tight">{t('activity_logs.title') || "Activity Logs"}</h1>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>{t('activity_logs.subtitle') || "System Activity History"}</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>{t('activity_logs.description') || "Description"}</TableHead>
								<TableHead>{t('activity_logs.causer') || "Causer"}</TableHead>
								<TableHead>{t('activity_logs.subject_type') || "Subject Type"}</TableHead>
								<TableHead className="text-right w-[130px]">{t('activity_logs.date') || "Date"}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody className={loading ? "opacity-50 pointer-events-none" : ""}>
							{loading && logs.length === 0 && (
								<TableRow>
									<TableCell colSpan={4} className="text-center py-10">
										<Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
									</TableCell>
								</TableRow>
							)}
							{!loading && logs.length === 0 && (
								<TableRow>
									<TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
										{t('common.no_data') || "No activity logs found."}
									</TableCell>
								</TableRow>
							)}
							{logs.map((log) => (
								<TableRow key={log.id}>
									<TableCell className="font-medium">{log.description}</TableCell>
									<TableCell>{log.causer?.name || t('common.system') || "System"}</TableCell>
									<TableCell>
										<span className="capitalize">{log.subject_type?.split('\\').pop() || "N/A"}</span>
									</TableCell>
									<TableCell className="text-right w-[130px]">{new Date(log.created_at).toLocaleString()}</TableCell>
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
			</Card>
		</div>
	);
}
