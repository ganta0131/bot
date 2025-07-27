document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const messageForm = document.getElementById('messageForm');
    const messageInput = document.getElementById('messageInput');
    const messagesContainer = document.getElementById('messages');
    const welcomeScreen = document.getElementById('welcomeScreen');
    const newChatBtn = document.getElementById('newChatBtn');
    const toggleSidebarBtn = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    let isLoading = false;

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
    if (toggleSidebarBtn) toggleSidebarBtn.addEventListener('click', toggleSidebar);
    if (newChatBtn) newChatBtn.addEventListener('click', startNewChat);

    // メッセージ送信処理
    if (messageForm) {
        messageForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const message = messageInput.value.trim();
            if (!message || isLoading) return;

            // ユーザーメッセージを表示
            addMessage('user', message);
            messageInput.value = '';
            adjustTextareaHeight();
            
            // ローディング表示
            showLoading();
            
            try {
                // APIにリクエストを送信
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message }),
                    credentials: 'same-origin'
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || 'Network response was not ok');
                }

                const data = await response.json();
                
                // ローディングを非表示に
                hideLoading();
                
                // アシスタントの返答を表示
                addMessage('assistant', data.response);
            } catch (error) {
                console.error('Error:', error);
                hideLoading();
                addMessage('assistant', '申し訳ありません、エラーが発生しました。もう一度お試しください。');
            }
        });
    }

    // テキストエリアの高さを自動調整
    if (messageInput) {
        messageInput.addEventListener('input', adjustTextareaHeight);
        
        // Shift + Enterで改行、Enterで送信
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                messageForm.dispatchEvent(new Event('submit'));
            }
        });
    }

    // サジェッションボタンのイベントリスナー
    document.querySelectorAll('.suggestion-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const suggestion = e.target.textContent.trim();
            messageInput.value = suggestion;
            messageInput.focus();
            adjustTextareaHeight();
        });
    });

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
