// グローバル変数
export let isLoading = false;

// DOMの読み込みを待つ
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    
    // DOM要素の取得
    const messageForm = document.getElementById('messageForm');
    const messageInput = document.getElementById('messageInput');
    const messagesContainer = document.getElementById('messages');
    const welcomeScreen = document.getElementById('welcomeScreen');
    const suggestionButtons = document.querySelectorAll('.suggestion-btn');
    
    console.log('DOM elements:', {
        messageForm: !!messageForm,
        messageInput: !!messageInput,
        messagesContainer: !!messagesContainer,
        welcomeScreen: !!welcomeScreen,
        suggestionButtons: suggestionButtons.length
    });

    // メッセージ送信処理
    async function sendMessage(message) {
        if (!message || isLoading) return;
        
        console.log('Sending message:', message);
        isLoading = true;
        
        // ウェルカム画面を非表示
        if (welcomeScreen) {
            welcomeScreen.classList.add('hidden');
        }
        
        // メッセージを表示
        addMessage('user', message);
        
        // 入力欄をクリア
        if (messageInput) {
            messageInput.value = '';
            adjustTextareaHeight();
        }
        
        // ローディング表示
        showLoading();
        
        try {
            const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000/api/chat' : '/api/chat';
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    const errorMessage = data.error || data.message || 'API request failed';
                    console.error('API Error:', {
                        status: response.status,
                        statusText: response.statusText,
                        error: errorMessage,
                        details: data.details
                    });
                    throw new Error(`サーバーエラーが発生しました: ${errorMessage}`);
                }
                
                if (data.success && data.response) {
                    addMessage('assistant', data.response);
                } else {
                    console.error('Invalid response format:', data);
                    throw new Error('無効なレスポンス形式です');
                }
            } catch (error) {
                console.error('Error:', error);
                const errorMessage = error.message || '申し訳ありません、エラーが発生しました。もう一度お試しください。';
                addMessage('assistant', errorMessage);
            } finally {
                hideLoading();
                isLoading = false;
            }
        } catch (error) {
            console.error('Error:', error);
            addMessage('assistant', '申し訳ありません、エラーが発生しました。もう一度お試しください。');
        }
    }

    // メッセージを追加する関数
    function addMessage(role, content) {
        if (!messagesContainer) return;
        
        // メッセージコンテナが非表示の場合は表示する
        messagesContainer.classList.remove('hidden');
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `p-4 ${role === 'user' ? 'bg-blue-50' : 'bg-white'}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'max-w-3xl mx-auto';
        
        // メッセージの内容を改行で分割して、段落ごとに表示
        const paragraphs = content.split('\n');
        paragraphs.forEach(paragraph => {
            if (paragraph.trim() !== '') {
                const p = document.createElement('p');
                p.className = 'text-gray-800';
                p.textContent = paragraph;
                messageContent.appendChild(p);
            }
        });
        
        messageDiv.appendChild(messageContent);
        messagesContainer.appendChild(messageDiv);
        
        // スクロールを最下部に移動
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // ローディング表示
    function showLoading() {
        if (!messagesContainer) return;
        
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading';
        loadingDiv.className = 'p-4 bg-white';
        
        const loadingContent = document.createElement('div');
        loadingContent.className = 'max-w-3xl mx-auto flex items-center space-x-2';
        
        // ドットのローディングアニメーション
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'w-2 h-2 bg-gray-400 rounded-full animate-bounce';
            dot.style.animationDelay = `${i * 0.15}s`;
            loadingContent.appendChild(dot);
        }
        
        loadingDiv.appendChild(loadingContent);
        messagesContainer.appendChild(loadingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // ローディング非表示
    function hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.remove();
        }
    }
    
    // テキストエリアの高さを自動調整
    function adjustTextareaHeight() {
        if (messageInput) {
            messageInput.style.height = 'auto';
            messageInput.style.height = `${messageInput.scrollHeight}px`;
        }
    }

    // イベントリスナーの設定
    function setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // メッセージ送信フォーム
        if (messageForm) {
            console.log('Adding submit listener to messageForm');
            messageForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const message = messageInput ? messageInput.value.trim() : '';
                if (message) {
                    sendMessage(message);
                }
            });
        }
        
        // サジェッションボタン
        suggestionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const message = e.target.textContent.trim();
                if (message) {
                    sendMessage(message);
                }
            });
        });
        
        // テキストエリアの高さ調整
        if (messageInput) {
            console.log('Adding input listener to messageInput');
            messageInput.addEventListener('input', adjustTextareaHeight);
            
            // Enterキーでの送信（Shift+Enterで改行）
            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const message = messageInput.value.trim();
                    if (message) {
                        messageForm.dispatchEvent(new Event('submit'));
                    }
                }
            });
        }
    }

    // イベントリスナーのセットアップを実行
    setupEventListeners();
    console.log('Event listeners setup completed');
});
