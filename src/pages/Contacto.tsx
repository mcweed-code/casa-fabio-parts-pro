import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Send, Paperclip, ExternalLink, AlertCircle, User, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender: 'client' | 'admin';
  text: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'pending';
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  unread: number;
}

// Mock data for conversations
const mockConversations: Conversation[] = [
  {
    id: '1',
    title: 'Soporte Casa Fabio',
    lastMessage: 'Gracias por tu consulta, te respondemos a la brevedad.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    unread: 0,
  },
];

// Mock messages
const mockMessages: Message[] = [
  {
    id: '1',
    sender: 'admin',
    text: '¡Hola! Bienvenido al chat de Casa Fabio. ¿En qué podemos ayudarte?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    status: 'read',
  },
  {
    id: '2',
    sender: 'client',
    text: 'Hola, quería consultar por disponibilidad de pastillas de freno',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    status: 'read',
  },
  {
    id: '3',
    sender: 'admin',
    text: 'Por supuesto, ¿para qué vehículo necesitas?',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: 'read',
  },
];

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (date: Date) => {
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  if (isToday) return 'Hoy';
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
  
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
};

const Contacto = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pedidoActual } = useAppStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [conversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<string>('1');
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setIsSending(true);
    
    const message: Message = {
      id: crypto.randomUUID(),
      sender: 'client',
      text: newMessage,
      timestamp: new Date(),
      status: 'pending',
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Simulate sending (in real implementation, this would call the WhatsApp API)
    setTimeout(() => {
      setMessages(prev => 
        prev.map(m => m.id === message.id ? { ...m, status: 'sent' } : m)
      );
      setIsSending(false);
    }, 500);
  };

  const handleAttachOrder = () => {
    if (pedidoActual.items.length === 0) {
      toast({
        title: 'Sin pedido',
        description: 'No hay items en el pedido actual para enviar.',
        variant: 'destructive',
      });
      return;
    }

    const orderText = `📋 *PEDIDO*\n\n${pedidoActual.items.map(item => 
      `• ${item.cantidad}x ${item.producto.descripcion} - $${item.subtotal.toLocaleString('es-AR')}`
    ).join('\n')}\n\n*Total: $${pedidoActual.total.toLocaleString('es-AR')}*`;
    
    setNewMessage(orderText);
  };

  const handleOpenWhatsApp = () => {
    const phone = '5491112345678'; // Replace with actual business number from settings
    const text = encodeURIComponent(newMessage || 'Hola, quiero hacer una consulta.');
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const selectedConvData = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="h-screen max-h-[600px] bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50 shadow-md shrink-0">
        <div className="container mx-auto px-4 h-12 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-accent" />
            <h1 className="text-lg font-semibold">Contacto</h1>
          </div>
        </div>
      </header>

      {/* Integration warning banner */}
      <Alert variant="default" className="mx-4 mt-3 shrink-0 bg-accent/10 border-accent/30">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-sm">Integración WhatsApp pendiente de credenciales</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleOpenWhatsApp}
            className="gap-1 ml-2"
          >
            <ExternalLink className="h-3 w-3" />
            Abrir WhatsApp
          </Button>
        </AlertDescription>
      </Alert>

      {/* Main content - WhatsApp style layout */}
      <main className="flex-1 flex overflow-hidden p-4 gap-4 min-h-0">
        {/* Conversations sidebar */}
        <Card className="w-64 shrink-0 flex flex-col">
          <CardHeader className="py-3 px-4 shrink-0">
            <CardTitle className="text-sm">Conversaciones</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`w-full p-3 text-left border-b hover:bg-muted/50 transition-colors ${
                    selectedConversation === conv.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{conv.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(conv.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.lastMessage}
                      </p>
                    </div>
                    {conv.unread > 0 && (
                      <Badge className="shrink-0">{conv.unread}</Badge>
                    )}
                  </div>
                </button>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat panel */}
        <Card className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <CardHeader className="py-3 px-4 border-b shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <User className="h-5 w-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-sm">{selectedConvData?.title}</CardTitle>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Última actividad: {formatTime(selectedConvData?.timestamp || new Date())}
                </p>
              </div>
            </div>
          </CardHeader>

          {/* Messages area */}
          <CardContent className="flex-1 p-4 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 ${
                        msg.sender === 'client'
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs opacity-70">{formatTime(msg.timestamp)}</span>
                        {msg.sender === 'client' && (
                          <span className="text-xs opacity-70">
                            {msg.status === 'pending' ? '⏳' : msg.status === 'sent' ? '✓' : '✓✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>

          {/* Input area */}
          <div className="p-3 border-t shrink-0">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleAttachOrder}
                className="h-9 w-9 shrink-0"
                title="Adjuntar pedido actual"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isSending}
                size="icon"
                className="h-9 w-9 shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Contacto;
