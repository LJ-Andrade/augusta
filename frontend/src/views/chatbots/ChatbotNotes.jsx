import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ChevronLeft, StickyNote, Plus, Trash2, Loader2, Save, FileText, Edit, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/confirmation-dialog';

export default function ChatbotNotes() {
	const navigate = useNavigate();
	const [notes, setNotes] = useState([]);
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);
	const [copiedId, setCopiedId] = useState(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [noteToDelete, setNoteToDelete] = useState(null);

	const [currentNote, setCurrentNote] = useState({
		title: '',
		content: ''
	});

	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editingId, setEditingId] = useState(null);

	const fetchNotes = async () => {
		setFetching(true);
		try {
			const { data } = await axiosClient.get('/admin/chatbot-notes');
			setNotes(data.data);
		} catch (error) {
			toast.error("Error al cargar las notas");
		} finally {
			setFetching(false);
		}
	};

	useEffect(() => {
		fetchNotes();
	}, []);

	const handleSave = async (e) => {
		e.preventDefault();
		if (!currentNote.content.trim()) {
			toast.error("El contenido es obligatorio");
			return;
		}

		setLoading(true);
		try {
			if (editingId) {
				await axiosClient.put(`/admin/chatbot-notes/${editingId}`, currentNote);
				toast.success("Nota actualizada");
			} else {
				await axiosClient.post('/admin/chatbot-notes', currentNote);
				toast.success("Nota guardada");
			}
			setCurrentNote({ title: '', content: '' });
			setEditingId(null);
			setIsEditModalOpen(false);
			fetchNotes();
		} catch (error) {
			toast.error(error.response?.data?.message || "Error al guardar la nota");
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteClick = (note) => {
		setNoteToDelete(note);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!noteToDelete) return;
		setIsDeleting(true);
		try {
			await axiosClient.delete(`/admin/chatbot-notes/${noteToDelete.id}`);
			toast.success("Nota eliminada");
			setNotes(notes.filter(d => d.id !== noteToDelete.id));
		} catch (error) {
			toast.error("No se pudo eliminar la nota");
		} finally {
			setIsDeleting(false);
			setNoteToDelete(null);
		}
	};

	const handleEdit = (note) => {
		setEditingId(note.id);
		setCurrentNote({
			title: note.title || '',
			content: note.content
		});
		setIsEditModalOpen(true);
	};

	const handleCopy = (content, id) => {
		navigator.clipboard.writeText(content);
		setCopiedId(id);
		toast.success("Copiado al portapapeles");
		setTimeout(() => setCopiedId(null), 2000);
	};

	return (
		<div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
			<div className="flex items-start justify-between border-b border-border/10 pb-6">
				<div className="flex items-start gap-4">
					<Button variant="outline" size="icon" asChild className="h-9 w-9 border-border/40 hover:bg-muted/50 mt-1">
						<Link to="/chatbots">
							<ChevronLeft className="h-4 w-4" />
						</Link>
					</Button>

					<div className="space-y-4">
						<div>
							<h1 className="text-2xl font-bold tracking-tight bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
								Notas
							</h1>
						</div>

						<Button
							onClick={() => {
								setEditingId(null);
								setCurrentNote({ title: '', content: '' });
								setIsEditModalOpen(true);
							}}
							className="bg-amber-600 hover:bg-amber-700 text-white shadow-md hover:shadow-lg transition-all h-9"
						>
							<Plus className="mr-2 h-4 w-4" /> Nueva Nota
						</Button>
					</div>
				</div>
			</div>

			{fetching ? (
				<div className="flex justify-center items-center h-64">
					<Loader2 className="h-8 w-8 animate-spin text-amber-500" />
				</div>
			) : notes.length === 0 ? (
				<Card className="border-dashed border-2 border-border/60 bg-transparent flex flex-col items-center justify-center p-12 text-center">
					<div className="h-16 w-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
						<FileText className="h-8 w-8 text-amber-500/40" />
					</div>
					<h3 className="text-lg font-medium">No hay notas</h3>
					<p className="text-muted-foreground max-w-sm mt-2">
						Comienza guardando tu primer prompt o nota útil. Aparecerán aquí para que puedas usarlos después.
					</p>
					<Button
						variant="outline"
						onClick={() => setIsEditModalOpen(true)}
						className="mt-6 border-amber-500/20 text-amber-600 hover:bg-amber-500/10"
					>
						Crear primera nota
					</Button>
				</Card>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{notes.map((note) => (
						<Card key={note.id} className="group border-border/40 shadow-xl shadow-black/5 bg-background/50 backdrop-blur-xl flex flex-col hover:border-amber-500/30 transition-all duration-300">
							<CardHeader className="pb-3 overflow-hidden">
								<CardTitle className="text-base truncate group-hover:text-amber-500 transition-colors">
									{note.title || 'Sin Título'}
								</CardTitle>
								<CardDescription className="text-xs">
									Actualizado: {new Date(note.updated_at).toLocaleDateString()}
								</CardDescription>
							</CardHeader>
							<CardContent className="grow">
								<div className="bg-muted/30 rounded-lg p-3 text-sm text-foreground/80 font-mono line-clamp-6 min-h-[140px] whitespace-pre-wrap">
									{note.content}
								</div>
							</CardContent>
							<CardFooter className="pt-0 flex justify-between gap-2 border-t border-border/10 mt-4">
								<div className="flex gap-1 mt-3">
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleCopy(note.content, note.id)}
										className="h-8 w-8 text-muted-foreground hover:text-cyan-500 hover:bg-cyan-500/10"
										title="Copiar contenido"
									>
										{copiedId === note.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleEdit(note)}
										className="h-8 w-8 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"
										title="Editar"
									>
										<Edit className="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleDeleteClick(note)}
										className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
										title="Eliminar"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
								<div className="text-[10px] text-muted-foreground mt-3 italic">
									ID: #{note.id}
								</div>
							</CardFooter>
						</Card>
					))}
				</div>
			)}

			{/* Modal para Crear/Editar */}
			<Dialog open={isEditModalOpen} onOpenChange={(open) => {
				setIsEditModalOpen(open);
				if (!open) {
					setEditingId(null);
					setCurrentDraft({ title: '', content: '' });
				}
			}}>
				<DialogContent className="sm:max-w-[600px] border-border/40 bg-background/95 backdrop-blur-xl">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-amber-500">
							{editingId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
							{editingId ? 'Editar Nota' : 'Nueva Nota'}
						</DialogTitle>
						<DialogDescription>
							Guarda fragmentos de texto o prompts que quieras tener a mano.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSave} className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="note-title" className="text-sm font-medium">Título (Opcional)</Label>
							<Input
								id="note-title"
								placeholder="Ej: Prompt para resumir artículos"
								value={currentNote.title}
								onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
								className="bg-muted/20 border-border/40 focus:ring-amber-500/20"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="note-content" className="text-sm font-medium">Contenido <span className="text-amber-500">*</span></Label>
							<Textarea
								id="note-content"
								placeholder="Escribe o pega aquí tu prompt..."
								className="min-h-[250px] bg-muted/20 border-border/40 focus:ring-amber-500/20 resize-y font-mono text-sm leading-relaxed"
								required
								value={currentNote.content}
								onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
							/>
						</div>

						<DialogFooter className="pt-4 border-t border-border/10">
							<Button
								type="button"
								variant="ghost"
								onClick={() => setIsEditModalOpen(false)}
								disabled={loading}
							>
								Cancelar
							</Button>
							<Button
								type="submit"
								className="bg-amber-600 hover:bg-amber-700 text-white min-w-[120px]"
								disabled={loading}
							>
								{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
								{editingId ? 'Actualizar' : 'Guardar'}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<ConfirmationDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="¿Eliminar Nota?"
				description={`Estás a punto de eliminar la nota "${noteToDelete?.title || 'Sin Título'}". Esta acción no se puede deshacer.`}
				confirmText="Eliminar"
				cancelText="Cancelar"
				onConfirm={handleConfirmDelete}
				loading={isDeleting}
			/>
		</div>
	);
}
