import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axiosClient from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
	ChevronLeft,
	Bot,
	Save,
	Loader2,
	Plus,
	Trash2,
	MessageSquare,
	Settings2,
	UserCircle,
	Info,
	Copy,
	Code,
	ExternalLink,
	ShieldCheck,
	Palette
} from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { AvatarUpload } from "@/components/ui/avatar-upload";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const HelpTooltip = ({ text }) => (
	<Tooltip>
		<TooltipTrigger asChild>
			<Info className="h-4 w-4 text-muted-foreground hover:text-cyan-500 transition-colors cursor-help ml-1.5" />
		</TooltipTrigger>
		<TooltipContent className="max-w-xs" side="right">
			<p className="text-xs font-normal">{text}</p>
		</TooltipContent>
	</Tooltip>
);

export default function ChatbotForm() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);

	const apiUrl = import.meta.env.VITE_API_URL || 'http://vadmin.test/api/';
	const widgetBaseUrl = apiUrl.replace('/api', '').replace(/\/$/, '');

	const [chatbot, setChatbot] = useState({
		name: '',
		description: '',
		system_prompt: '',
		welcome_message: '',
		cta_text: '¿Tenés alguna duda? ¡Consultame!',
		provider: 'groq',
		model: 'llama-3.1-8b-instant',
		temperature: 0.7,
		tone: 'Professional',
		suggested_questions: [],
		max_tokens: 1000,
		token_limit_per_session: 5000,
		limit_reached_message: 'Has alcanzado el límite de mensajes para esta sesión.',
		is_active: true,
		consent_notice: 'Para brindarte un mejor servicio, las interacciones con este asistente virtual pueden ser registradas. Al continuar, aceptas nuestra Política de Privacidad.',
		privacy_policy: '',
		customer_id: '',
		avatar_url: null,
		avatar_base64: null,
		primary_color: '#0ea5e9',
		secondary_color: '#1e293b',
		authorized_domains: []
	});
	const [errors, setErrors] = useState({});
	const [customers, setCustomers] = useState([]);
	const [savingStatus, setSavingStatus] = useState(false);

	useEffect(() => {
		// Load customers for selection
		axiosClient.get('/admin/customers', { params: { perPage: 100 } })
			.then(({ data }) => {
				setCustomers(data.data || []);
			})
			.catch(err => toast.error("Error al cargar listado de clientes"));

		if (id) {
			setFetching(true);
			axiosClient.get(`/admin/chatbots/${id}`)
				.then(({ data }) => {
					const botData = data.data;
					setChatbot({
						...botData,
						customer_id: botData.customer_id ? String(botData.customer_id) : '',
						temperature: botData.temperature !== undefined ? parseFloat(botData.temperature) : 0.7,
						cta_text: botData.cta_text || '¿Tenés alguna duda? ¡Consultame!',
						max_tokens: botData.max_tokens || 1000,
						token_limit_per_session: botData.token_limit_per_session || 0,
						suggested_questions: Array.isArray(botData.suggested_questions) ? botData.suggested_questions : [],
						consent_notice: botData.consent_notice || 'Para brindarte un mejor servicio, las interacciones con este asistente virtual pueden ser registradas. Al continuar, aceptas nuestra Política de Privacidad.',
						privacy_policy: botData.privacy_policy || '',
						primary_color: botData.primary_color || '#0ea5e9',
						secondary_color: botData.secondary_color || '#1e293b',
						authorized_domains: Array.isArray(botData.authorized_domains) ? botData.authorized_domains : []
					});
				})
				.catch((err) => {
					toast.error("Error al cargar el chatbot");
					navigate('/chatbots');
				})
				.finally(() => {
					setFetching(false);
				});
		}
	}, [id, navigate]);

	const handleAvatarChange = async (file) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			setChatbot({
				...chatbot,
				avatar_base64: reader.result,
				avatar_url: URL.createObjectURL(file)
			});
		};
		reader.readAsDataURL(file);
	};

	const handleStatusChange = async (newStatus) => {
		// Solo guardar automáticamente si estamos editando un chatbot existente
		if (id) {
			setSavingStatus(true);
			try {
				await axiosClient.put(`/admin/chatbots/${id}`, { ...chatbot, is_active: newStatus });
				setChatbot({ ...chatbot, is_active: newStatus });
				toast.success(newStatus ? "Chatbot activado" : "Chatbot desactivado");
			} catch (error) {
				toast.error("Error al cambiar el estado del chatbot");
				// Revertir el cambio en caso de error
				setChatbot({ ...chatbot });
			} finally {
				setSavingStatus(false);
			}
		} else {
			// Si es un chatbot nuevo, solo actualizar el estado local
			setChatbot({ ...chatbot, is_active: newStatus });
		}
	};

	const addQuestion = () => {
		setChatbot({
			...chatbot,
			suggested_questions: [...chatbot.suggested_questions, ""]
		});
	};

	const removeQuestion = (index) => {
		const updated = [...chatbot.suggested_questions];
		updated.splice(index, 1);
		setChatbot({ ...chatbot, suggested_questions: updated });
	};

	const updateQuestion = (index, value) => {
		const updated = [...chatbot.suggested_questions];
		updated[index] = value;
		setChatbot({ ...chatbot, suggested_questions: updated });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setErrors({});

		// Filtrar preguntas sugeridas vacías antes de guardar
		const chatbotToSave = {
			...chatbot,
			suggested_questions: chatbot.suggested_questions.filter(q => q.trim() !== '')
		};

		try {
			if (id) {
				await axiosClient.put(`/admin/chatbots/${id}`, chatbotToSave);
				// Actualizar estado local con preguntas filtradas
				setChatbot(chatbotToSave);
				toast.success("Chatbot actualizado exitosamente");
			} else {
				const { data } = await axiosClient.post('/admin/chatbots', chatbotToSave);
				toast.success("Chatbot creado exitosamente");
				if (data?.data?.id) {
					navigate(`/chatbots/edit/${data.data.id}`, { replace: true });
				}
			}
		} catch (error) {
			if (error.response?.data?.errors) {
				setErrors(error.response.data.errors);
			} else {
				toast.error(error.response?.data?.message || "Ocurrió un error inesperado al guardar");
			}
		} finally {
			setLoading(false);
		}
	};


	if (fetching) {
		return (
			<div className="flex justify-center items-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<TooltipProvider>
			<div className="space-y-6 animate-in fade-in zoom-in-95 duration-200 p-4 lg:p-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Button variant="outline" size="icon" asChild className="h-9 w-9 border-border/40 hover:bg-muted/50">
							<Link to="/chatbots">
								<ChevronLeft className="h-4 w-4" />
							</Link>
						</Button>
						<div>
							<h1 className="text-2xl font-bold tracking-tight bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent flex items-center gap-2">
								<Bot className="h-5 w-5 text-cyan-500" />
								{id ? 'Editar Chatbot' : 'Nuevo Chatbot'}
							</h1>
						</div>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Row 1: Identity/Questions (Left) and Personality/Welcome (Right) */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
						{/* Column Left: Identity and Suggested Questions */}
						<div className="space-y-6">
							{/* Card Identity */}
							<Card className="border-border/40 shadow-xl shadow-black/5 bg-background/50 backdrop-blur-xl transition-all hover:border-border/80 flex flex-col">
								<CardHeader className="pb-4">
									<CardTitle className="text-lg flex items-center gap-2">
										<UserCircle className="h-4 w-4 text-purple-500" />
										Identidad
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-5">
									<div className="flex justify-start py-2">
										<AvatarUpload
											value={chatbot.avatar_url}
											onChange={handleAvatarChange}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="customer_id" className="flex items-center gap-2 text-sm">
											Cliente Propietario <span className="text-red-500">*</span>
											<HelpTooltip text="Selecciona el cliente al que pertenecerá este chatbot." />
										</Label>
										<Select
											value={chatbot.customer_id}
											onValueChange={(val) => setChatbot({ ...chatbot, customer_id: val })}
										>
											<SelectTrigger id="customer_id" className={`bg-muted/20 border-border/40 focus:ring-cyan-500/20 ${errors.customer_id ? "border-red-500" : ""}`}>
												<SelectValue placeholder="Seleccionar cliente" />
											</SelectTrigger>
											<SelectContent>
												{customers.map(customer => (
													<SelectItem key={customer.id} value={String(customer.id)}>
														{customer.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{errors.customer_id && <p className="text-xs text-red-500">{errors.customer_id[0]}</p>}
									</div>

									<div className="space-y-2">
										<Label htmlFor="name" className="flex items-center gap-2">
											Nombre <span className="text-red-500">*</span>
											<HelpTooltip text="El nombre público que los usuarios verán en el chat." />
										</Label>
										<Input
											id="name"
											value={chatbot.name}
											onChange={(e) => setChatbot({ ...chatbot, name: e.target.value })}
											placeholder="Ej: Sofía"
											className={`bg-muted/20 border-border/40 focus:ring-cyan-500/20 ${errors.name ? "border-red-500" : ""}`}
										/>
										{errors.name && <p className="text-xs text-red-500">{errors.name[0]}</p>}
									</div>

									<div className="space-y-2">
										<Label htmlFor="description" className="flex items-center gap-2">
											Cargo / Descripción
											<HelpTooltip text="Define brevemente qué función cumple el bot (ej: Especialista en Ventas)." />
										</Label>
										<Input
											id="description"
											value={chatbot.description || ''}
											onChange={(e) => setChatbot({ ...chatbot, description: e.target.value })}
											placeholder="Ej: Experta en Ventas"
											className="bg-muted/20 border-border/40 focus:ring-cyan-500/20"
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="tone" className="flex items-center gap-2">
											Tono de Voz
											<HelpTooltip text="Determina la actitud y el estilo de lenguaje que usará el bot al responder." />
										</Label>
										<Select
											value={chatbot.tone}
											onValueChange={(val) => setChatbot({ ...chatbot, tone: val })}
										>
											<SelectTrigger id="tone" className="bg-muted/20 border-border/40 focus:ring-cyan-500/20">
												<SelectValue placeholder="Seleccionar tono" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="Professional">Profesional</SelectItem>
												<SelectItem value="Friendly">Amigable</SelectItem>
												<SelectItem value="Helpful">Asistencial</SelectItem>
												<SelectItem value="Direct">Directo y Conciso</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="flex items-center justify-between pt-2">
										<Label htmlFor="is_active" className="cursor-pointer font-medium flex items-center gap-2 text-sm">
											Estado del Bot
											<HelpTooltip text="Permite activar o desactivar el bot instantáneamente." />
										</Label>
										<div className="flex items-center gap-2">
											{savingStatus && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
											<Switch
												id="is_active"
												checked={chatbot.is_active}
												onCheckedChange={handleStatusChange}
												disabled={savingStatus}
											/>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Card Suggested Questions */}
							<Card className="border-border/40 shadow-xl shadow-black/5 bg-background/50 backdrop-blur-xl transition-all hover:border-border/80">
								<CardHeader className="pb-3 border-b border-border/40 mb-4 bg-muted/20">
									<div className="flex justify-between items-center px-1">
										<CardTitle className="text-base flex items-center gap-2">
											Preguntas Sugeridas
											<HelpTooltip text="Botones de acceso rápido para que el usuario inicie una conversación." />
										</CardTitle>
										<Button type="button" variant="outline" size="sm" onClick={addQuestion} className="h-8 gap-1.5 text-cyan-500 border-cyan-500/20 hover:bg-cyan-500/10">
											<Plus className="h-4 w-4" />
											Agregar
										</Button>
									</div>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="grid grid-cols-1 gap-3">
										{chatbot.suggested_questions.length === 0 ? (
											<div className="col-span-full py-8 text-center border-2 border-dashed border-border/40 rounded-lg bg-muted/5">
												<p className="text-xs text-muted-foreground italic">No hay sugerencias configuradas.</p>
											</div>
										) : (
											chatbot.suggested_questions.map((q, idx) => (
												<div key={idx} className="flex gap-2 group animate-in slide-in-from-right-2 duration-200">
													<Input
														value={q}
														onChange={(e) => updateQuestion(idx, e.target.value)}
														placeholder="Pregunta sugerida..."
														className="h-9 text-sm bg-muted/10 border-border/40 focus:ring-cyan-500/20"
													/>
													<Button
														type="button"
														variant="ghost"
														size="icon"
														onClick={() => removeQuestion(idx)}
														className="h-9 w-9 text-muted-foreground hover:text-red-500 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											))
										)}
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Column Right: Personality and Welcome */}
						<div className="space-y-6 flex flex-col">
							{/* Card Personality */}
							<Card className="border-border/40 shadow-xl shadow-black/5 bg-background/50 backdrop-blur-xl transition-all hover:border-border/80 flex-1 flex flex-col">
								<CardHeader className="pb-4">
									<CardTitle className="text-lg flex items-center gap-2">
										<Bot className="h-4 w-4 text-cyan-500" />
										Personalidad del Asistente
									</CardTitle>
									<CardDescription>Define las instrucciones maestras y comportamiento base del bot.</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4 flex-1 flex flex-col">
									<div className="space-y-2 flex-1 flex flex-col">
										<Label htmlFor="system_prompt" className="flex items-center gap-2">
											Instrucciones del Sistema (System Prompt)
											<HelpTooltip text="Instrucciones maestras que dictan el comportamiento y límites del bot." />
										</Label>
										<Textarea
											id="system_prompt"
											value={chatbot.system_prompt || ''}
											onChange={(e) => setChatbot({ ...chatbot, system_prompt: e.target.value })}
											placeholder="Define la personalidad, contexto y reglas..."
											className={`flex-1 min-h-[400px] bg-muted/20 border-border/40 focus:ring-cyan-500/20 font-mono text-sm leading-relaxed ${errors.system_prompt ? "border-red-500" : ""}`}
										/>
										{errors.system_prompt && <p className="text-sm text-red-500 mt-1">{errors.system_prompt[0]}</p>}
									</div>
								</CardContent>
							</Card>

							{/* Card Welcome */}
							<Card className="border-border/40 shadow-xl shadow-black/5 bg-background/50 backdrop-blur-xl transition-all hover:border-border/80">
								<CardHeader className="pb-4">
									<CardTitle className="text-lg flex items-center gap-2">
										<MessageSquare className="h-4 w-4 text-amber-500" />
										Mensajes
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="cta_text" className="flex items-center gap-2 text-sm text-cyan-500 font-semibold">
											Llamada a la Acción (CTA Widget)
											<HelpTooltip text="Texto persuasivo que aparece junto a la burbuja cerrada para invitar a chatear." />
										</Label>
										<Input
											id="cta_text"
											value={chatbot.cta_text || ''}
											onChange={(e) => setChatbot({ ...chatbot, cta_text: e.target.value })}
											placeholder="Ej: ¿Tenés alguna duda? ¡Consultame!"
											className={`bg-muted/20 border-border/40 focus:ring-cyan-500/20 ${errors.cta_text ? "border-red-500" : ""}`}
										/>
										{errors.cta_text && <p className="text-xs text-red-500">{errors.cta_text[0]}</p>}
									</div>

									<div className="space-y-2">
										<Label htmlFor="welcome_message" className="flex items-center gap-2 text-sm text-amber-500/80">
											Texto de Apertura (Chat Abierto)
											<HelpTooltip text="El primer mensaje que el bot envía automáticamente al iniciar un chat." />
										</Label>
										<Textarea
											id="welcome_message"
											value={chatbot.welcome_message || ''}
											onChange={(e) => setChatbot({ ...chatbot, welcome_message: e.target.value })}
											placeholder="Ej: ¡Hola! Soy tu asistente virtual..."
											className={`min-h-[100px] bg-muted/20 border-border/40 focus:ring-cyan-500/20 ${errors.welcome_message ? "border-red-500" : ""}`}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="limit_reached_message" className="flex items-center gap-2 text-sm">
											Mensaje de Límite
											<HelpTooltip text="Mensaje automático cuando se acaba la cuota." />
										</Label>
										<Textarea
											id="limit_reached_message"
											value={chatbot.limit_reached_message || ''}
											onChange={(e) => setChatbot({ ...chatbot, limit_reached_message: e.target.value })}
											placeholder="Has alcanzado el límite..."
											className={`min-h-[80px] bg-muted/20 border-border/40 focus:ring-cyan-500/20 ${errors.limit_reached_message ? "border-red-500" : ""}`}
										/>
										{errors.limit_reached_message && <p className="text-xs text-red-500">{errors.limit_reached_message[0]}</p>}
									</div>
								</CardContent>
							</Card>
						</div>
					</div>

					{/* Row 2: Model Configuration (Ancho completo) */}
					<Card className="border-border/40 shadow-xl shadow-black/5 bg-background/50 backdrop-blur-xl transition-all hover:border-border/80">
						<CardHeader className="pb-4">
							<CardTitle className="text-lg flex items-center gap-2">
								<Settings2 className="h-4 w-4 text-blue-500" />
								Configuración
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="provider" className="flex items-center gap-2">
											Proveedor
											<HelpTooltip text="La plataforma que procesa la inteligencia artificial (Groq ofrece mayor velocidad)." />
										</Label>
										<Select
											value={chatbot.provider}
											onValueChange={(val) => setChatbot({ ...chatbot, provider: val })}
										>
											<SelectTrigger id="provider" className="bg-muted/20 border-border/40 focus:ring-cyan-500/20">
												<SelectValue placeholder="Seleccionar proveedor" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="groq">Groq (Recomendado)</SelectItem>
												<SelectItem value="openai">OpenAI (Vía Groq)</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label htmlFor="model" className="flex items-center gap-2">
											Modelo LLM
											<HelpTooltip text='El "cerebro" específico que se usará. Los modelos más grandes (70B) son más inteligentes.' />
										</Label>
										<Select
											value={chatbot.model}
											onValueChange={(val) => setChatbot({ ...chatbot, model: val })}
										>
											<SelectTrigger id="model" className="bg-muted/20 border-border/40 focus:ring-cyan-500/20 text-xs text-left">
												<SelectValue placeholder="Seleccionar modelo" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="llama-3.3-70b-versatile">Llama 3.3 70B (Versátil)</SelectItem>
												<SelectItem value="llama-3.1-8b-instant">Llama 3.1 8B (Instantáneo)</SelectItem>
												<SelectItem value="mixtral-8x7b-32768">Mixtral 8x7B</SelectItem>
												<SelectItem value="gemma2-9b-it">Gemma 2 9B</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label className="flex items-center gap-2 text-sm">
											Temperatura
											<HelpTooltip text="0.0 es preciso; 1.0 es creativo y variado." />
										</Label>
										<div className="flex items-center gap-4 py-2">
											<input
												type="range"
												min="0"
												max="1"
												step="0.1"
												value={chatbot.temperature}
												onChange={(e) => setChatbot({ ...chatbot, temperature: parseFloat(e.target.value) })}
												className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-cyan-500"
											/>
											<span className="text-sm font-mono w-8 text-cyan-500">{chatbot.temperature}</span>
										</div>
									</div>
								</div>

								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="max_tokens" className="flex items-center gap-2 text-sm">
											Tokens Máx. (Respuesta)
											<HelpTooltip text="Límite por cada respuesta individual del bot." />
										</Label>
										<Input
											type="number"
											id="max_tokens"
											value={chatbot.max_tokens || ''}
											onChange={(e) => {
												const val = e.target.value === '' ? '' : parseInt(e.target.value);
												setChatbot({ ...chatbot, max_tokens: val });
											}}
											className={`bg-muted/20 border-border/40 focus:ring-cyan-500/20 ${errors.max_tokens ? "border-red-500" : ""}`}
											placeholder="1000"
										/>
										{errors.max_tokens && <p className="text-xs text-red-500">{errors.max_tokens[0]}</p>}
									</div>

									<div className="space-y-2">
										<Label htmlFor="token_limit_per_session" className="flex items-center gap-2 text-sm">
											Límite por Cliente (Tokens)
											<HelpTooltip text="Máximo acumulado que un cliente puede usar en una sesión." />
										</Label>
										<Input
											type="number"
											id="token_limit_per_session"
											value={chatbot.token_limit_per_session === 0 ? '0' : chatbot.token_limit_per_session || ''}
											onChange={(e) => setChatbot({ ...chatbot, token_limit_per_session: e.target.value === '' ? 0 : parseInt(e.target.value) })}
											className={`bg-muted/20 border-border/40 focus:ring-cyan-500/20 ${errors.token_limit_per_session ? "border-red-500" : ""}`}
											placeholder="Ej: 5000"
										/>
										{errors.token_limit_per_session && <p className="text-xs text-red-500">{errors.token_limit_per_session[0]}</p>}
									</div>
								</div>

								<div className="space-y-4">
									{/* <Label className="text-sm font-medium">Esquema de Colores</Label> */}
									<Label htmlFor="primary_color" className="text-xs text-muted-foreground flex items-center gap-1.5">
										Color Primario
										<HelpTooltip text="Color de la burbuja y mensajes del usuario." />
									</Label>
									<div className="grid grid-cols-1 gap-4">
										<div className="space-y-2">
											<div className="flex gap-2">
												<Input
													type="color"
													id="primary_color"
													value={chatbot.primary_color || '#0ea5e9'}
													onChange={(e) => setChatbot({ ...chatbot, primary_color: e.target.value })}
													className="w-12 h-10 p-1 bg-muted/20 border-border/40 cursor-pointer"
												/>
												<Input
													type="text"
													value={chatbot.primary_color || '#0ea5e9'}
													onChange={(e) => setChatbot({ ...chatbot, primary_color: e.target.value })}
													className="flex-1 font-mono text-xs bg-muted/20 border-border/40"
												/>
											</div>
										</div>
										<div className="space-y-2">
											<Label htmlFor="secondary_color" className="text-xs text-muted-foreground flex items-center gap-1.5">
												Color Secundario
												<HelpTooltip text="Color del encabezado del chat." />
											</Label>
											<div className="flex gap-2">
												<Input
													type="color"
													id="secondary_color"
													value={chatbot.secondary_color || '#1e293b'}
													onChange={(e) => setChatbot({ ...chatbot, secondary_color: e.target.value })}
													className="w-12 h-10 p-1 bg-muted/20 border-border/40 cursor-pointer"
												/>
												<Input
													type="text"
													value={chatbot.secondary_color || '#1e293b'}
													onChange={(e) => setChatbot({ ...chatbot, secondary_color: e.target.value })}
													className="flex-1 font-mono text-xs bg-muted/20 border-border/40"
												/>
											</div>
										</div>
									</div>
								</div>

							</div>

							<Separator className="my-6 border-border/40" />

							<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
								<div className="space-y-2">
									<Label htmlFor="consent_notice" className="flex items-center gap-2 text-sm">
										Aviso de consentimiento
										<HelpTooltip text="Texto legal que aparece al inicio del chat para informar al usuario." />
									</Label>
									<Textarea
										id="consent_notice"
										value={chatbot.consent_notice || ''}
										onChange={(e) => setChatbot({ ...chatbot, consent_notice: e.target.value })}
										placeholder="Ingrese el aviso de consentimiento..."
										className={`min-h-[100px] bg-muted/20 border-border/40 focus:ring-cyan-500/20 ${errors.consent_notice ? "border-red-500" : ""}`}
									/>
									{errors.consent_notice && <p className="text-xs text-red-500">{errors.consent_notice[0]}</p>}
								</div>

								<div className="space-y-2">
									<Label htmlFor="privacy_policy" className="flex items-center gap-2 text-sm">
										Política de Privacidad
										<HelpTooltip text="Enlace o texto descriptivo sobre cómo se manejan los datos." />
									</Label>
									<Textarea
										id="privacy_policy"
										value={chatbot.privacy_policy || ''}
										onChange={(e) => setChatbot({ ...chatbot, privacy_policy: e.target.value })}
										placeholder="Ej: https://tusitio.com/privacidad o detalles legales..."
										className={`min-h-[100px] bg-muted/20 border-border/40 focus:ring-cyan-500/20 ${errors.privacy_policy ? "border-red-500" : ""}`}
									/>
									{errors.privacy_policy && <p className="text-xs text-red-500">{errors.privacy_policy[0]}</p>}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Row 3: Integration (Only show if editing) */}
					{id && (
						<Card className="shadow-xl shadow-black/5 bg-background/50 backdrop-blur-xl border-cyan-500/20">
							<CardHeader className="pb-4">
								<div className="flex items-center justify-between">
									<div>
										<CardTitle className="text-lg flex items-center gap-2 text-cyan-500">
											<Code className="h-4 w-4" />
											Integración en Sitio Web
										</CardTitle>
										<CardDescription>Usa este código para embeber el chatbot en la web de tu cliente.</CardDescription>
									</div>
									<Badge variant="outline" className="bg-cyan-500/10 text-cyan-500 border-cyan-500/20">
										<ShieldCheck className="h-3 w-3 mr-1" /> Dominio Protegido
									</Badge>
								</div>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
									<div className="space-y-3">
										<Label className="text-sm font-medium">Token del Widget</Label>
										<div className="flex items-center gap-2">
											<code className="flex-1 p-2 bg-muted/30 rounded border border-border/40 font-mono text-xs overflow-x-auto">
												{chatbot.widget_token}
											</code>
											<Button
												type="button"
												variant="secondary"
												size="sm"
												className="h-9"
												onClick={() => {
													navigator.clipboard.writeText(chatbot.widget_token);
													toast.success("Token copiado al portapapeles");
												}}
											>
												<Copy className="h-4 w-4 mr-2" /> Copiar
											</Button>
										</div>
										<p className="text-[11px] text-muted-foreground italic">
											Este token identifica a este bot de forma única. No lo compartas públicamente fuera de la integración.
										</p>
										<div className="space-y-3">
											<Label className="text-sm font-medium flex items-center gap-2">
												Snippet de Instalación (HTML/JS)
												<HelpTooltip text="Copia y pega este código justo antes del cierre de la etiqueta </body> en tu sitio web." />
											</Label>
											<div className="relative group">
												<pre className="p-4 bg-slate-950 rounded-lg text-slate-300 font-mono text-xs overflow-x-auto leading-relaxed border border-white/5 shadow-2xl">
													{`<script 
  src="${widgetBaseUrl}/widget/v1/chatbot.js" 
  data-token="${chatbot.widget_token}"
  defer
></script>`}
												</pre>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													className="absolute top-2 right-2 text-slate-400 hover:text-white hover:bg-white/10"
													onClick={() => {
														const snippet = `<script \n  src="${widgetBaseUrl}/widget/v1/chatbot.js" \n  data-token="${chatbot.widget_token}"\n  defer\n></script>`;
														navigator.clipboard.writeText(snippet);
														toast.success("Snippet copiado");
													}}
												>
													<Copy className="h-4 w-4" />
												</Button>
											</div>
											<div className="flex items-center gap-2 text-[11px] text-cyan-500/70">
												<ExternalLink className="h-3 w-3" />
												<span>¿Necesitas ayuda con la integración? Lee la guía rápida.</span>
											</div>
										</div>
									</div>

									<div className="space-y-3">
										<Label className="text-sm font-medium">Dominio Autorizado</Label>
										<div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
											<div className="flex items-center gap-2 text-amber-500 mb-1">
												<Info className="h-4 w-4" />
												<span className="text-xs font-semibold uppercase tracking-wider">Verificación de CORS</span>
											</div>
											<p className="text-xs text-muted-foreground leading-relaxed">
												El widget solo funcionará en: <span className="font-mono text-foreground font-bold">{chatbot.customer?.official_domain || 'Dominio no configurado'}</span>.
												Puedes cambiar esto en la ficha del cliente.
											</p>
										</div>
										<div className="space-y-2">
											<Label htmlFor="authorized_domains" className="flex items-center gap-2">
												Dominios Autorizados Adicionales
												<HelpTooltip text="Lista de dominios (separados por coma) donde este widget tiene permiso para ejecutarse. Ej: staging.tuweb.com, localhost" />
											</Label>
											<Textarea
												id="authorized_domains"
												value={Array.isArray(chatbot.authorized_domains) ? chatbot.authorized_domains.join(', ') : ''}
												onChange={(e) => {
													const domains = e.target.value.split(',').map(d => d.trim()).filter(d => d !== '');
													setChatbot({ ...chatbot, authorized_domains: domains });
												}}
												placeholder="ejemplo.com, test.proyect.com"
												className="min-h-[80px] bg-muted/20 border-border/40 focus:ring-cyan-500/20 font-mono text-xs"
											/>
											<p className="text-[10px] text-muted-foreground">
												* El dominio oficial del cliente ya está incluido por defecto.
											</p>
										</div>
									</div>

								</div>

							</CardContent>
						</Card>
					)}

					{/* Row 3: Actions */}
					<div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-8 border-t border-border/40 pb-10">
						<Button variant="ghost" type="button" asChild className="w-full sm:w-auto text-muted-foreground hover:bg-muted/50">
							<Link to="/chatbots">Descartar</Link>
						</Button>
						<Button type="submit" disabled={loading} className="w-full sm:w-auto bg-linear-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white border-0 shadow-lg shadow-cyan-900/40 h-10 px-10 font-semibold ring-offset-background transition-all hover:scale-[1.02] active:scale-[0.98]">
							{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
							{id ? 'Guardar Cambios' : 'Crear Chatbot'}
						</Button>
					</div>
				</form>
			</div>
		</TooltipProvider>
	);
}
