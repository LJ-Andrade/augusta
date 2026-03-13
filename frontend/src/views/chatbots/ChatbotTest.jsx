import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axiosClient from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, Bot, Send, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatbotTest() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [fetching, setFetching] = useState(true);
    const [sending, setSending] = useState(false);
    const [chatbot, setChatbot] = useState(null);
    const [inputMesage, setInputMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [totalTokens, setTotalTokens] = useState(0);
    const [sessionUuid, setSessionUuid] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        // Generar un UUID simple para la sesión de prueba al cargar
        setSessionUuid(crypto.randomUUID());
    }, []);

    useEffect(() => {
        if (id) {
            axiosClient.get(`/admin/chatbots/${id}`)
                .then(({ data }) => {
                    const bot = data.data;
                    setChatbot(bot);
                    
                    const initialMsg = bot.welcome_message || `¡Hola! Soy ${bot.name}. Configurado con el modelo ${bot.model} de ${bot.provider}. ¿En qué te puedo ayudar?`;
                    
                    setMessages([
                        { 
                            role: 'assistant', 
                            content: initialMsg 
                        }
                    ]);
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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, sending]);

    const handleSendMessage = async (e, text = null) => {
        if (e) e.preventDefault();
        const finalMessage = text || inputMesage;
        
        if (!finalMessage.trim() || sending) return;

        const userMsg = finalMessage.trim();
        setInputMessage('');
        
        // Agregar el mensaje del usuario al chat
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setSending(true);

        try {
            const { data } = await axiosClient.post(`/admin/chatbots/${id}/test`, {
                message: userMsg,
                history: messages,
                session_uuid: sessionUuid,
                total_usage: totalTokens
            });

            // Actualizar contador de tokens
            if (data.data.usage) {
                setTotalTokens(prev => prev + data.data.usage);
            }

            // Agregar la respuesta del bot
            setMessages(prev => [...prev, { role: 'assistant', content: data.data.reply }]);
        } catch (error) {
            toast.error(error.response?.data?.message || "Error al comunicar con el LLM");
            // Eliminar último mensaje si falló
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setSending(false);
            // Enfocar de nuevo el input después de enviar
            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
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
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200 h-[calc(100vh-10rem)] flex flex-col">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild className="h-9 w-9 border-border/40 hover:bg-muted/50">
                        <Link to="/chatbots">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent flex items-center gap-2">
                            {chatbot?.avatar_url ? (
                                <img src={chatbot.avatar_url} alt={chatbot.name} className="h-8 w-8 rounded-full object-cover border border-border" />
                            ) : (
                                <Bot className="h-5 w-5 text-cyan-500" />
                            )}
                            Probar: {chatbot?.name}
                        </h1>
                        <p className="text-xs text-muted-foreground mt-1">
                            Modelo: {chatbot?.model} | Las conversaciones se guardan en el historial
                            {totalTokens > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-cyan-500/10 text-cyan-500 rounded-full border border-cyan-500/20">
                                    Tokens usados: {totalTokens} 
                                    {chatbot?.token_limit_per_session > 0 && ` / ${chatbot.token_limit_per_session}`}
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            <Card className="flex-1 flex flex-col border-border/40 shadow-xl overflow-hidden shadow-black/5 bg-background/50 backdrop-blur-xl">
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 animate-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="shrink-0 h-8 w-8 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center">
                                    {chatbot?.avatar_url ? (
                                        <img src={chatbot.avatar_url} alt={chatbot.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <Bot className="h-4 w-4 text-cyan-500" />
                                    )}
                                </div>
                            )}
                            
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap shadow-sm ${
                                msg.role === 'user' 
                                    ? 'bg-linear-to-br from-cyan-600 to-blue-700 text-white rounded-tr-none' 
                                    : 'bg-muted border border-border/40 rounded-tl-none text-foreground'
                            }`}>
                                {msg.content}
                            </div>

                            {msg.role === 'user' && (
                                <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <User className="h-4 w-4 text-primary" />
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {sending && (
                        <div className="flex gap-3 justify-start animate-pulse">
                            <div className="shrink-0 h-8 w-8 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center">
                                {chatbot?.avatar_url ? (
                                    <img src={chatbot.avatar_url} alt={chatbot.name} className="h-full w-full object-cover" />
                                ) : (
                                    <Bot className="h-4 w-4 text-cyan-500" />
                                )}
                            </div>
                            <div className="bg-muted border border-border/40 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1 shadow-sm">
                                <span className="h-2 w-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-cyan-500 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </CardContent>
                
                <div className="p-4 bg-muted/20 border-t border-border/40 space-y-4">
                    {chatbot?.suggested_questions?.length > 0 && messages.length === 1 && !sending && (
                        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {chatbot.suggested_questions.map((q, i) => (
                                <Button 
                                    key={i} 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleSendMessage(null, q)}
                                    className="rounded-full bg-background/50 border-cyan-500/20 text-xs hover:bg-cyan-500/10 hover:border-cyan-500/40 text-muted-foreground hover:text-cyan-600 transition-all font-medium py-1 h-auto"
                                >
                                    {q}
                                </Button>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Input
                            ref={inputRef}
                            placeholder="Escribe un mensaje..."
                            value={inputMesage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            disabled={sending}
                            className="flex-1 bg-background/50 border-border/40 focus-visible:ring-cyan-500 h-11"
                            autoFocus
                        />
                        <Button type="submit" disabled={sending || !inputMesage.trim()} className="bg-cyan-600 hover:bg-cyan-700 text-white shrink-0 h-11 w-11 p-0 rounded-xl">
                            <Send className="h-5 w-5" />
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}
