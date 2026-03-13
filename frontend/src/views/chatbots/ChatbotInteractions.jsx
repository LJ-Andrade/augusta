import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageSquare, ArrowLeft, Calendar, Cpu, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/confirmation-dialog';

const formatDate = (dateString) => {
	const date = new Date(dateString);
	return date.toLocaleDateString('es-ES', {
		day: 'numeric',
		month: 'long',
		hour: '2-digit',
		minute: '2-digit'
	});
};

export default function ChatbotInteractions() {
	const { id } = useParams();
	const [chatbot, setChatbot] = useState(null);
	const [sessions, setSessions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [sessionToDelete, setSessionToDelete] = useState(null);

	const fetchData = async () => {
		setLoading(true);
		try {
			const [botRes, sessionsRes] = await Promise.all([
				axiosClient.get(`/admin/chatbots/${id}`),
				axiosClient.get(`/admin/chatbots/${id}/interactions`)
			]);
			setChatbot(botRes.data.data);
			setSessions(sessionsRes.data.data);
		} catch (error) {
			toast.error("Error cargando interacciones");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [id]);

	const handleDeleteClick = (session) => {
		setSessionToDelete(session);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!sessionToDelete) return;
		setIsDeleting(true);
		try {
			await axiosClient.delete(`/admin/chatbot-sessions/${sessionToDelete.id}`);
			toast.success("Sesión eliminada");
			fetchData();
		} catch (error) {
			toast.error("Error al eliminar");
		} finally {
			setIsDeleting(false);
			setSessionToDelete(null);
		}
	};

	return (
		<div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
			<div className="flex items-center gap-4">
				<Button variant="outline" size="icon" asChild className="h-9 w-9">
					<Link to="/chatbots">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Interacciones: {chatbot?.name}</h1>
					<p className="text-muted-foreground text-sm">Historial de conversaciones y uso de tokens</p>
				</div>
			</div>

			<Card className="border-border/40 shadow-xl bg-background/50 backdrop-blur-xl">
				<CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
					<CardTitle className="text-lg">Sesiones de Chat</CardTitle>
					<CardDescription>Listado cronológico de interacciones</CardDescription>
				</CardHeader>
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow className="bg-muted/30">
								<TableHead>Fecha</TableHead>
								<TableHead>Sesión</TableHead>
								<TableHead>IP</TableHead>
								<TableHead>Mensajes</TableHead>
								<TableHead>Tokens</TableHead>
								<TableHead className="text-right">Acciones</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={5} className="text-center h-32">Cargando...</TableCell>
								</TableRow>
							) : sessions.length === 0 ? (
								<TableRow>
									<TableCell colSpan={5} className="text-center h-32 text-muted-foreground">No hay interacciones registradas.</TableCell>
								</TableRow>
							) : sessions.map((session) => (
								<TableRow key={session.id} className="group hover:bg-muted/30 transition-colors">
									<TableCell className="font-medium">
										<div className="flex items-center gap-2">
											<Calendar className="h-3 w-3 text-muted-foreground" />
											{formatDate(session.created_at)}
										</div>
									</TableCell>
									<TableCell className="text-xs font-mono text-muted-foreground">
										{session.session_uuid || `session-${session.id}`}
									</TableCell>
									<TableCell className="text-xs font-mono text-muted-foreground">
										{session.ip_address || '-'}
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<MessageSquare className="h-3 w-3 text-muted-foreground" />
											{session.messages_count}
										</div>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<Cpu className="h-3 w-3 text-muted-foreground" />
											{session.total_tokens_used.toLocaleString()}
										</div>
									</TableCell>
									<TableCell className="text-right">
										<div className="flex items-center justify-end gap-2">
											<Button variant="ghost" size="icon" asChild title="Ver Detalle" className="h-8 w-8 text-muted-foreground hover:text-indigo-500 hover:bg-indigo-500/10 transition-colors">
												<Link to={`/chatbots/sessions/${session.id}`}>
													<Eye className="h-4 w-4" />
												</Link>
											</Button>
											<Button variant="ghost" size="icon" title="Eliminar" onClick={() => handleDeleteClick(session)} className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors">
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<ConfirmationDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="¿Eliminar Sesión?"
				description="Estás a punto de eliminar esta sesión y todos sus mensajes. Esta acción no se puede deshacer."
				confirmText="Eliminar"
				cancelText="Cancelar"
				onConfirm={handleConfirmDelete}
				loading={isDeleting}
			/>
		</div>
	);
}
