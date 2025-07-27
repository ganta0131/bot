// グローバル変数
let isLoading = false;

// DOMの読み込みを待つ
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    
    // DOM要素の取得
    const messageForm = document.getElementById('messageForm');
    const messageInput = document.getElementById('messageInput');
    const messagesContainer = document.getElementById('messages');
    const welcomeScreen = document.getElementById('welcomeScreen');
    const newChatBtn = document.getElementById('newChatBtn');
    const toggleSidebarBtn = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    
    console.log('DOM elements:', {
        messageForm: !!messageForm,
        messageInput: !!messageInput,
        messagesContainer: !!messagesContainer,
        welcomeScreen: !!welcomeScreen,
        newChatBtn: !!newChatBtn,
        toggleSidebarBtn: !!toggleSidebarBtn,
        sidebar: !!sidebar
    });

    // サイドバーのトグル
    function toggleSidebar() {
        sidebar.classList.toggle('open');
        document.body.classList.toggle('overflow-hidden');
        
        // バックドロップの作成/削除
        let backdrop = document.querySelector('.backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'backdrop';
            backdrop.onclick = closeSidebar;
            document.body.appendChild(backdrop);
        }
        backdrop.classList.toggle('open');
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        document.body.classList.remove('overflow-hidden');
        const backdrop = document.querySelector('.backdrop');
        if (backdrop) {
            backdrop.classList.remove('open');
        }
    }

    // イベントリスナーの設定
    function setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // サイドバートグル
        if (toggleSidebarBtn) {
            console.log('Adding click listener to toggleSidebarBtn');
            toggleSidebarBtn.addEventListener('click', toggleSidebar);
        }
        
        // 新しいチャットボタン
        if (newChatBtn) {
            console.log('Adding click listener to newChatBtn');
            newChatBtn.addEventListener('click', startNewChat);
        }
        
        // メッセージ送信フォーム
        if (messageForm) {
            console.log('Adding submit listener to messageForm');
            messageForm.addEventListener('submit', handleSubmit);
        }
        
        // テキストエリアの高さ調整
        if (messageInput) {
            console.log('Adding input listener to messageInput');
            messageInput.addEventListener('input', adjustTextareaHeight);
            
            // Enterキーでの送信
            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    console.log('Enter key pressed, submitting form');
                    messageForm.dispatchEvent(new Event('submit'));
                }
            });
        }
        
        // サジェッションボタン
        document.querySelectorAll('.suggestion-btn').forEach((button, index) => {
            console.log(`Adding click listener to suggestion button ${index + 1}`);
            button.addEventListener('click', (e) => {
                const suggestion = e.target.textContent.trim();
                console.log('Suggestion button clicked:', suggestion);
                messageInput.value = suggestion;
                messageInput.focus();
                adjustTextareaHeight();
                
                // 自動送信
                setTimeout(() => {
                    messageForm.dispatchEvent(new Event('submit'));
                }, 100);
            });
        });
    }
    
    // フォーム送信ハンドラ
    async function handleSubmit(e) {
        e.preventDefault();
        console.log('Form submitted');
        
        const message = messageInput.value.trim();
        if (!message || isLoading) {
            console.log('Message is empty or already loading');
            return;
        }
        
        console.log('Sending message:', message);
        
        // ユーザーメッセージを表示
        addMessage('user', message);
        messageInput.value = '';
        adjustTextareaHeight();
        
        // ローディング表示
        showLoading();
        
        try {
            // APIにリクエストを送信
            const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000/api/chat' : '/api/chat';
            console.log('Calling API:', apiUrl);
            
            console.log('Sending request to:', apiUrl);
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ message }),
                credentials: 'include'
            });

            console.log('API response status:', response.status);
            
            const data = await response.json().catch(error => {
                console.error('Failed to parse JSON response:', error);
                throw new Error('Invalid response from server');
            });
            
            console.log('API response data:', data);
            
            if (!response.ok || !data.success) {
                console.error('API error:', data.error || 'Unknown error');
                throw new Error(data.error || 'Request failed');
            }
            
            // ローディングを非表示に
            hideLoading();
            
            // アシスタントの返答を表示
            if (data.response) {
                addMessage('assistant', data.response);
            } else {
                throw new Error('No response content');
            }
        } catch (error) {
            console.error('Error:', error);
            hideLoading();
            addMessage('assistant', '申し訳ありません、エラーが発生しました。もう一度お試しください。');
        }
    }

    // イベントリスナーのセットアップを実行
    setupEventListeners();
    console.log('Event listeners setup completed');

    // メッセージを追加する関数
    function addMessage(role, content) {
        // ウェルカム画面を非表示
        if (welcomeScreen) welcomeScreen.classList.add('hidden');
        
        // メッセージコンテナを表示
        if (messagesContainer) messagesContainer.classList.remove('hidden');
        
        const messageElement = document.createElement('div');
        messageElement.className = `py-6 px-4 ${role === 'user' ? 'bg-white' : 'bg-gray-50'} border-b border-gray-100`;
        
        messageElement.innerHTML = `
            <div class="max-w-3xl mx-auto flex gap-4">
                <div class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${role === 'user' ? 'bg-blue-500' : 'bg-green-500'} text-white">
                    ${role === 'user' ? 'Y' : '小'}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="font-semibold mb-1">
                        ${role === 'user' ? 'あなた' : '小島健太郎'}
                    </div>
                    <div class="whitespace-pre-wrap">${content}</div>
                </div>
            </div>
        `;
        
        if (messagesContainer) {
            messagesContainer.appendChild(messageElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    // ローディング表示
    function showLoading() {
        isLoading = true;
        const loadingElement = document.createElement('div');
        loadingElement.className = 'py-6 px-4 bg-gray-50';
        loadingElement.id = 'loading';
        loadingElement.innerHTML = `
            <div class="max-w-3xl mx-auto flex gap-4">
                <div class="w-8 h-8 rounded-full bg-green-500 text-white flex-shrink-0 flex items-center justify-center">
                    小
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 bg-gray-400 rounded-full bounce-animation" style="animation-delay: 0ms"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full bounce-animation" style="animation-delay: 150ms"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full bounce-animation" style="animation-delay: 300ms"></div>
                </div>
            </div>
        `;
        if (messagesContainer) {
            messagesContainer.appendChild(loadingElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    // ローディング非表示
    function hideLoading() {
        isLoading = false;
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    // テキストエリアの高さを自動調整
    function adjustTextareaHeight() {
        if (messageInput) {
            messageInput.style.height = 'auto';
            messageInput.style.height = `${messageInput.scrollHeight}px`;
        }
    }

    // 新しいチャットを開始
    function startNewChat() {
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
            messagesContainer.classList.add('hidden');
        }
        if (welcomeScreen) welcomeScreen.classList.remove('hidden');
        closeSidebar();
    }
});
