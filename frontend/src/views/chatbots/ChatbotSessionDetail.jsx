import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, User, Bot, Clock, Cpu } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ChatbotSessionDetail() {
	const { sessionId } = useParams();
	const [session, setSession] = useState(null);
	const [loading, setLoading] = useState(true);

	const fetchSession = async () => {
		setLoading(true);
		try {
			const { data } = await axiosClient.get(`/admin/chatbot-sessions/${sessionId}`);
			setSession(data);
		} catch (error) {
			toast.error("Error cargando el detalle de la sesión");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchSession();
	}, [sessionId]);

	if (loading) {
		return <div className="flex items-center justify-center h-64">Cargando transcripción...</div>;
	}

	if (!session) {
		return <div className="text-center p-12">No se encontró la sesión.</div>;
	}

	return (
		<div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
			<div className="flex items-center gap-4">
				<Button variant="outline" size="icon" asChild className="h-9 w-9">
					<Link to={`/chatbots/interactions/${session.chatbot_id}`}>
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Detalle de Sesión</h1>
					<p className="text-muted-foreground text-sm flex items-center gap-3">
						<span className="flex items-center gap-1">
							<Clock className="h-3 w-3" />
							{new Date(session.created_at).toLocaleString('es-ES')}
						</span>
						<span className="flex items-center gap-1">
							<Cpu className="h-3 w-3" />
							{session.total_tokens_used.toLocaleString()} tokens
						</span>
						{session.ip_address && (
							<span className="flex items-center gap-1 border-l border-border/40 pl-3">
								<span className="text-[10px] font-bold text-muted-foreground uppercase">IP:</span>
								<span className="font-mono">{session.ip_address}</span>
							</span>
						)}
					</p>
				</div>
			</div>

			<Card className="border-border/40 shadow-xl bg-background/50 backdrop-blur-xl overflow-hidden">
				<CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
					<CardTitle className="text-lg">Transcripción del Chat</CardTitle>
					<CardDescription>Registro completo de la conversación</CardDescription>
				</CardHeader>
				<CardContent className="p-6 space-y-6 max-w-4xl mx-auto">
					{session.messages.map((message) => (
						<div
							key={message.id}
							className={cn(
								"flex gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-300",
								message.role === 'user' ? "flex-row-reverse" : "flex-row"
							)}
						>
							<div className={cn(
								"h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border",
								message.role === 'user' 
									? "bg-indigo-500/10 border-indigo-500/20 text-indigo-500" 
									: "bg-cyan-500/10 border-cyan-500/20 text-cyan-500"
							)}>
								{message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
							</div>
							
							<div className={cn(
								"flex flex-col max-w-[80%]",
								message.role === 'user' ? "items-end" : "items-start"
							)}>
								<div className={cn(
									"px-4 py-2 rounded-2xl text-sm shadow-sm",
									message.role === 'user' 
										? "bg-indigo-600 text-white rounded-tr-none" 
										: "bg-muted/50 border border-border/40 text-foreground rounded-tl-none"
								)}>
									<div className="whitespace-pre-wrap leading-relaxed">
										{message.content}
									</div>
								</div>
								<span className="text-[10px] text-muted-foreground mt-1 px-1">
									{new Date(message.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
								</span>
							</div>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
