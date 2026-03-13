import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Book, Key, Bot, Search, Save, Info, ExternalLink } from 'lucide-react';

export default function ChatbotWiki() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Button variant="ghost" asChild className="w-fit -ml-2 text-muted-foreground hover:text-foreground">
                    <Link to="/chatbots">
                        <ChevronLeft className="mr-2 h-4 w-4" /> Volver a Chatbots
                    </Link>
                </Button>
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/10 shadow-inner flex">
                        <Book className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                            Guía de Configuración: Chatbot & RAG
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Todo lo que necesitas saber para entrenar y desplegar tus bots de IA.
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Start Card */}
            <Card className="border-border/40 shadow-xl shadow-black/5 bg-linear-to-br from-primary/5 to-transparent overflow-hidden border-l-4 border-l-primary">
                <CardContent className="p-6">
                    <div className="flex gap-4">
                        <Info className="h-6 w-6 text-primary shrink-0" />
                        <div>
                            <h3 className="font-bold text-lg mb-2 text-primary">Concepto Clave: RAG</h3>
                            <p className="text-sm text-foreground/80 leading-relaxed">
                                <strong>RAG</strong> (Retrieval-Augmented Generation) es una técnica que permite al bot consultar documentos externos antes de responder. 
                                En lugar de "re-entrenar" al bot, le das una <strong>biblioteca de conocimiento</strong> que él consulta en tiempo real. Esto garantiza respuestas precisas sobre tu empresa sin alucinaciones.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Steps Grid */}
            <div className="grid gap-8">
                {/* Step 1 */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3 text-xl font-bold">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-black">1</span>
                        <h2>Configuración de APIs</h2>
                    </div>
                    <div className="pl-11 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl border border-border/40 bg-background/50 space-y-2">
                                <div className="flex items-center gap-2 mb-2 font-bold text-amber-600">
                                    <Key className="h-4 w-4" /> Groq (Generación)
                                </div>
                                <p className="text-sm text-muted-foreground">Es quien "piensa" y responde. Necesitas la <code>GROQ_API_KEY</code> en el servidor.</p>
                                <a href="https://console.groq.com/keys" target="_blank" className="text-xs text-primary flex items-center gap-1 hover:underline pt-2">
                                    Obtener Key en Groq <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                            <div className="p-4 rounded-xl border border-border/40 bg-background/50 space-y-2">
                                <div className="flex items-center gap-2 mb-2 font-bold text-cyan-600">
                                    <Key className="h-4 w-4" /> Hugging Face (Vectores)
                                </div>
                                <p className="text-sm text-muted-foreground">Convierte tu conocimiento en números. Necesitas la <code>HUGGINGFACE_API_KEY</code>.</p>
                                <a href="https://huggingface.co/settings/tokens" target="_blank" className="text-xs text-primary flex items-center gap-1 hover:underline pt-2">
                                    Obtener Token en Hugging Face <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Step 2 */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3 text-xl font-bold">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-black">2</span>
                        <h2>Crear y Personalizar el Bot</h2>
                    </div>
                    <div className="pl-11 space-y-3">
                        <p className="text-foreground/80 leading-relaxed">
                            Al crear un bot, el <strong>System Prompt</strong> es su personalidad. Por ejemplo: 
                            <code className="block p-3 mt-2 bg-muted rounded-md text-xs italic">
                                "Eres el asistente de ventas de Vimana. Eres cordial, respondes brevemente y siempre diriges al usuario a nuestra web oficial."
                            </code>
                        </p>
                    </div>
                </section>

                {/* Step 3 */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3 text-xl font-bold">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-black">3</span>
                        <h2>Cargar Conocimiento (Entrenamiento)</h2>
                    </div>
                    <div className="pl-11 bg-linear-to-b from-transparent to-muted/20 pb-6 rounded-b-3xl space-y-4">
                        <p className="text-foreground/80">
                            Entra al ícono del <strong>Libro (Base de Conocimiento)</strong> en el listado.
                        </p>
                        <ul className="grid gap-3 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2 italic">
                                <Bot className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <span>Pega información corporativa, precios, manuales o FAQs.</span>
                            </li>
                            <li className="flex items-start gap-2 italic">
                                <Search className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <span>Nuestro sistema dividirá el texto en fragmentos y los vectorizará.</span>
                            </li>
                            <li className="flex items-start gap-2 italic">
                                <Save className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <span>El bot consultará automáticamente esta base ante cada pregunta.</span>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Bonus */}
                <Card className="border-border/40 shadow-inner bg-muted/30">
                    <CardContent className="p-6 flex items-center justify-between gap-4">
                        <div>
                            <h4 className="font-bold flex items-center gap-2 underline underline-offset-4 decoration-primary/30">
                                ¿Sabías que?
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                Puedes probar el bot en tiempo real desde el ícono de <strong>Mensaje</strong> antes de publicarlo.
                            </p>
                        </div>
                        <Bot className="h-10 w-10 text-primary/20 shrink-0" />
                    </CardContent>
                </Card>
            </div>

            <footer className="text-center pt-8 border-t border-border/40 text-xs text-muted-foreground pb-12">
                Sistema de IA implementado para Studio Vimana &copy; 2026
            </footer>
        </div>
    );
}
