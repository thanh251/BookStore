import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Xin chào! Mình là trợ lý AI của nhà sách. Mình có thể giúp gì cho bạn hôm nay?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');

        const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const chatHistory = newMessages.slice(0, -1).map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            const response = await axios.post('http://localhost:3000/api/chat', {
                message: userMessage,
                chatHistory
            });

            setMessages([...newMessages, { role: 'assistant', content: response.data.reply }]);
        } catch (error: any) {
            console.error('Chatbot Error:', error.response?.data || error.message);
            setMessages([...newMessages, {
                role: 'assistant',
                content: 'Xin lỗi, hệ thống AI đang tạm nghỉ. Bạn vui lòng thử lại sau nhé!'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', bottom: '24px', right: '24px',
            zIndex: 9999, fontFamily: 'inherit'
        }}>
            {/* Trigger button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        width: '56px', height: '56px', borderRadius: '50%',
                        background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                        transition: 'all 0.25s ease', position: 'relative'
                    }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)'
                        ;(e.currentTarget as HTMLButtonElement).style.background = '#2a2a2a'
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
                        ;(e.currentTarget as HTMLButtonElement).style.background = '#1a1a1a'
                    }}
                    title="Trợ lý AI"
                >
                    <svg width="24" height="24" fill="none" stroke="#f5f0e8" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                    </svg>
                    {/* Ping badge */}
                    <span style={{
                        position: 'absolute', top: '2px', right: '2px',
                        width: '12px', height: '12px'
                    }}>
                        <span style={{
                            position: 'absolute', inset: 0, borderRadius: '50%',
                            background: '#8B6914', opacity: 0.6,
                            animation: 'chatPing 1.5s cubic-bezier(0,0,0.2,1) infinite'
                        }} />
                        <span style={{
                            position: 'relative', display: 'inline-flex',
                            width: '12px', height: '12px', borderRadius: '50%',
                            background: '#8B6914', border: '1.5px solid #1a1a1a'
                        }} />
                    </span>
                </button>
            )}

            {/* Chat window — HOCMAI style layout */}
            {isOpen && (
                <div style={{
                    width: '340px', height: '520px',
                    background: '#ffffff',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 16px 56px rgba(0,0,0,0.18)',
                    border: '0.5px solid rgba(0,0,0,0.08)',
                    display: 'flex', flexDirection: 'column',
                    animation: 'chatSlideUp 0.25s ease'
                }}>
                    {/* Header */}
                    <div style={{
                        background: '#1a1a1a',
                        padding: '14px 16px',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid rgba(255,255,255,0.06)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {/* AI Avatar */}
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                background: 'rgba(139,105,20,0.2)',
                                border: '1px solid rgba(139,105,20,0.4)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <svg width="18" height="18" fill="#8B6914" viewBox="0 0 20 20">
                                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"/>
                                </svg>
                            </div>
                            <div>
                                <div style={{
                                    fontSize: '13px', fontWeight: 600,
                                    color: '#f5f0e8', letterSpacing: '0.02em'
                                }}>Trợ lý AI</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span style={{
                                        width: '6px', height: '6px', borderRadius: '50%',
                                        background: '#4ade80', display: 'inline-block'
                                    }} />
                                    <span style={{ fontSize: '11px', color: '#c8c0b0' }}>Đang hoạt động</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: '#c8c0b0', padding: '4px', borderRadius: '6px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.15s'
                            }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#f5f0e8')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#c8c0b0')}
                        >
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div style={{
                        flex: 1, overflowY: 'auto',
                        padding: '16px 14px',
                        background: '#f7f5f2',
                        display: 'flex', flexDirection: 'column', gap: '14px'
                    }}>
                        {messages.map((msg, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                alignItems: 'flex-end', gap: '8px'
                            }}>
                                {/* AI Avatar */}
                                {msg.role === 'assistant' && (
                                    <div style={{
                                        width: '30px', height: '30px', borderRadius: '50%',
                                        background: '#1a1a1a', flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        marginBottom: '2px'
                                    }}>
                                        <svg width="14" height="14" fill="#8B6914" viewBox="0 0 20 20">
                                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"/>
                                        </svg>
                                    </div>
                                )}

                                {/* Bubble */}
                                <div style={{
                                    maxWidth: '72%',
                                    padding: '10px 14px',
                                    borderRadius: msg.role === 'user'
                                        ? '18px 18px 4px 18px'
                                        : '18px 18px 18px 4px',
                                    fontSize: '13px', lineHeight: '1.6',
                                    background: msg.role === 'user' ? '#1a1a1a' : '#ffffff',
                                    color: msg.role === 'user' ? '#f5f0e8' : '#2a2a2a',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                    border: msg.role === 'assistant'
                                        ? '0.5px solid rgba(0,0,0,0.06)'
                                        : 'none'
                                }}>
                                    {msg.content}
                                </div>

                                {/* User Avatar */}
                                {msg.role === 'user' && (
                                    <div style={{
                                        width: '30px', height: '30px', borderRadius: '50%',
                                        background: '#8B6914', flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '11px', fontWeight: 700, color: '#fff',
                                        letterSpacing: '0.05em', marginBottom: '2px'
                                    }}>
                                        BẠN
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Loading dots */}
                        {isLoading && (
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                                <div style={{
                                    width: '30px', height: '30px', borderRadius: '50%',
                                    background: '#1a1a1a', flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <svg width="14" height="14" fill="#8B6914" viewBox="0 0 20 20">
                                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"/>
                                    </svg>
                                </div>
                                <div style={{
                                    padding: '12px 16px', borderRadius: '18px 18px 18px 4px',
                                    background: '#ffffff', border: '0.5px solid rgba(0,0,0,0.06)',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                    display: 'flex', gap: '5px', alignItems: 'center'
                                }}>
                                    {[0, 0.18, 0.36].map((delay, i) => (
                                        <span key={i} style={{
                                            width: '6px', height: '6px', borderRadius: '50%',
                                            background: '#c8c0b0', display: 'inline-block',
                                            animation: `chatBounce 1s ease-in-out ${delay}s infinite`
                                        }} />
                                    ))}
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div style={{
                        padding: '12px 14px',
                        background: '#ffffff',
                        borderTop: '0.5px solid rgba(0,0,0,0.06)'
                    }}>
                        <form onSubmit={handleSendMessage} style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: '#f7f5f2', borderRadius: '24px',
                            padding: '6px 6px 6px 14px',
                            border: '0.5px solid rgba(0,0,0,0.1)',
                            transition: 'border-color 0.2s'
                        }}>
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Nhập tin nhắn của bạn..."
                                disabled={isLoading}
                                style={{
                                    flex: 1, background: 'none', border: 'none',
                                    outline: 'none', fontSize: '13px',
                                    color: '#1a1a1a', padding: '4px 0'
                                }}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                style={{
                                    width: '34px', height: '34px', borderRadius: '50%',
                                    background: input.trim() && !isLoading ? '#1a1a1a' : '#e8e0d4',
                                    border: 'none', cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0, transition: 'all 0.2s'
                                }}
                            >
                                <svg width="16" height="16" fill="none"
                                    stroke={input.trim() && !isLoading ? '#f5f0e8' : '#c8c0b0'}
                                    strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Keyframe animations */}
            <style>{`
                @keyframes chatPing {
                    75%, 100% { transform: scale(2); opacity: 0; }
                }
                @keyframes chatSlideUp {
                    from { opacity: 0; transform: translateY(16px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0)   scale(1);    }
                }
                @keyframes chatBounce {
                    0%, 80%, 100% { transform: translateY(0);    opacity: 0.4; }
                    40%           { transform: translateY(-5px); opacity: 1;   }
                }
            `}</style>
        </div>
    );
};

export default Chatbot;
