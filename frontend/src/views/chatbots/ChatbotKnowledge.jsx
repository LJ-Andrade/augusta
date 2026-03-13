import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axiosClient from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ChevronLeft, BookOpen, Plus, Trash2, Loader2, Save, FileText, Eye, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatbotKnowledge() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [knowledge, setKnowledge] = useState([]);
    const [chatbot, setChatbot] = useState(null);
    
    const [newKnowledge, setNewKnowledge] = useState({
        title: '',
        content: ''
    });

    const [selectedItem, setSelectedItem] = useState(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    const fetchKnowledge = async () => {
        setFetching(true);
        try {
            const { data } = await axiosClient.get(`/admin/chatbots/${id}/knowledge`);
            setKnowledge(data.data);
        } catch (error) {
            toast.error("Error al cargar la base de conocimiento");
        } finally {
            setFetching(false);
        }
    };

    const fetchChatbot = async () => {
        try {
            const { data } = await axiosClient.get(`/admin/chatbots/${id}`);
            setChatbot(data.data);
        } catch (error) {
            toast.error("Error al cargar detalles del chatbot");
            navigate('/chatbots');
        }
    };

    useEffect(() => {
        if (id) {
            fetchChatbot();
            fetchKnowledge();
        }
    }, [id]);

    const handleAddKnowledge = async (e) => {
        e.preventDefault();
        if (!newKnowledge.content.trim()) return;
        
        setLoading(true);
        try {
            await axiosClient.post(`/admin/chatbots/${id}/knowledge`, newKnowledge);
            toast.success("Conocimiento agregado y procesado correctamente");
            setNewKnowledge({ title: '', content: '' });
            fetchKnowledge();
        } catch (error) {
            toast.error(error.response?.data?.message || "Error al procesar el conocimiento");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (knowledgeId) => {
        if (!confirm("¿Seguro que deseas eliminar este fragmento? El bot ya no podrá usar esta información.")) return;
        
        try {
            await axiosClient.delete(`/admin/chatbots/${id}/knowledge/${knowledgeId}`);
            toast.success("Fragmento eliminado");
            setKnowledge(knowledge.filter(k => k.id !== knowledgeId));
        } catch (error) {
            toast.error("No se pudo eliminar el fragmento");
        }
    };

    if (fetching && !chatbot) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild className="h-9 w-9 border-border/40 hover:bg-muted/50">
                        <Link to="/chatbots">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-amber-500" />
                            Conocimiento: {chatbot?.name}
                        </h1>
                        <p className="text-xs text-muted-foreground mt-1">
                            Entrena a tu bot con documentos o información específica.
                        </p>
                    </div>
                </div>
                <Button variant="outline" size="sm" asChild className="border-amber-500/50 text-amber-600 hover:bg-amber-500/10">
                    <Link to="/chatbots/documentation">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Guía RAG
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Formulario de Inserción */}
                <div className="lg:col-span-1">
                    <Card className="border-border/40 shadow-xl shadow-black/5 bg-background/50 backdrop-blur-xl sticky top-6">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Plus className="h-4 w-4" /> Agregar Información
                            </CardTitle>
                            <CardDescription>
                                Los textos largos se dividirán automáticamente en fragmentos para el bot.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddKnowledge} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Título / Referencia (Opcional)</Label>
                                    <Input 
                                        id="title"
                                        placeholder="Ej: Manual de Usuario 2024"
                                        value={newKnowledge.title}
                                        onChange={(e) => setNewKnowledge({...newKnowledge, title: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="content">Contenido de texto <span className="text-red-500">*</span></Label>
                                    <Textarea 
                                        id="content"
                                        placeholder="Pega aquí el texto, información de la empresa, FAQs, etc..."
                                        className="min-h-[250px] resize-y"
                                        required
                                        value={newKnowledge.content}
                                        onChange={(e) => setNewKnowledge({...newKnowledge, content: e.target.value})}
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Procesar y Guardar
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Listado de Fragmentos */}
                <div className="lg:col-span-2">
                    <Card className="border-border/40 shadow-xl shadow-black/5 bg-background/50 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-lg">Fragmentos de Conocimiento ({knowledge.length})</CardTitle>
                            <CardDescription>
                                Estos son los textos que el bot consultará al recibir preguntas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                                        <TableHead>Contenido</TableHead>
                                        <TableHead className="w-[100px] text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fetching ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center h-32">Cargando fragmentos...</TableCell>
                                        </TableRow>
                                    ) : knowledge.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center h-32 text-muted-foreground">
                                                <div className="flex flex-col items-center gap-2">
                                                    <FileText className="h-8 w-8 opacity-20" />
                                                    Base de conocimientos vacía.
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : knowledge.map((item) => (
                                        <TableRow key={item.id} className="group hover:bg-muted/30 transition-colors">
                                            <TableCell className="py-4">
                                                <div className="text-xs font-bold text-amber-600 mb-1 uppercase tracking-wider">
                                                    {item.metadata?.title || 'Sin Título'}
                                                </div>
                                                <div className="text-sm line-clamp-3 text-foreground/80">
                                                    {item.content}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        title="Ver completo" 
                                                        onClick={() => {
                                                            setSelectedItem(item);
                                                            setIsViewOpen(true);
                                                        }}
                                                        className="h-8 w-8 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        title="Eliminar" 
                                                        onClick={() => handleDelete(item.id)}
                                                        className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                                                    >
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
                </div>
            </div>

            {/* Modal para ver contenido completo */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-amber-600">
                            <BookOpen className="h-5 w-5" />
                            {selectedItem?.metadata?.title || 'Fragmento de Conocimiento'}
                        </DialogTitle>
                        <DialogDescription>
                            Contenido completo almacenado para el bot.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border/40 text-sm leading-relaxed whitespace-pre-wrap">
                        {selectedItem?.content}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewOpen(false)}>Cerrar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
