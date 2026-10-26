document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
    await loadAllData();
    renderMinimal();
    setupThemeToggle();
    initializeRag();
}

// Theme toggle functionality
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const root = document.documentElement;

    const applyTheme = (theme) => {
        root.classList.remove('light', 'dark');
        if (theme === 'light') {
            root.classList.add('light');
        } else {
            root.classList.add('dark');
        }
        localStorage.setItem('theme', theme);
        updateThemeButton(theme);
    };

    const updateThemeButton = (theme) => {
        // Icon is drawn in CSS (#theme-toggle::before); only the label changes.
        themeToggle.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`);
    };

    // Initialize theme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    applyTheme(initialTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = root.classList.contains('light') ? 'light' : 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
    });
}


// Load all JSON data files and expose them as window.<key>Data
async function loadAllData() {
    console.log('loadAllData() called');
    try {
        console.log('Starting to load configuration...');
        const response = await fetch('assets/data/config.json', { cache: 'no-cache' });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const configText = await response.text();
        console.log('Config response received, length:', configText.length);

        const config = JSON.parse(configText);
        console.log('Config parsed successfully:', Object.keys(config.dataFiles));

        // Load all data files in parallel
        const promises = Object.entries(config.dataFiles).map(async ([key, path]) => {
            try {
                console.log(`Loading ${key} from ${path}...`);
                const response = await fetch(path, { cache: 'no-cache' });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} for ${path}`);
                }
                const data = await response.json();
                window[key + 'Data'] = data;
                console.log(`Loaded ${key} data successfully, ${Object.keys(data).length} keys`);
                return data;
            } catch (error) {
                console.error(`Failed to load ${key} data from ${path}:`, error);
                return null;
            }
        });

        await Promise.all(promises);
    } catch (error) {
        console.error('Failed to load configuration:', error);
    }
}

// =============================
// RAG Integration
// =============================
function initializeRag() {
    try {
        if (window.__ragInitialized) return; // idempotent guard
        const pane = document.getElementById('rag-pane');
        if (!pane) return; // Not on this page
        window.__ragInitialized = true;

        const loadingEl = pane.querySelector('.rag-loading');
        const bgTitleEl = pane.querySelector('.rag-bg-title');
        const outputEl = pane.querySelector('#rag-output');
        const formEl = pane.querySelector('#rag-form');
        const inputEl = pane.querySelector('#rag-input');
        const sendBtn = pane.querySelector('#rag-send');

        const QUERY_URL = 'https://rag.rahulkrishnan.me/query/stream';
        const HEALTH_URL = 'https://rag.rahulkrishnan.me/health';
        const OFFLINE_MESSAGE = 'The AI assistant is offline right now. The rest of the site works normally.';

        // Immediately reveal UI without any health checks
        if (loadingEl) loadingEl.style.display = 'none';
        if (formEl) formEl.hidden = false;
        if (bgTitleEl) bgTitleEl.hidden = false;

        // Ensure thinking state is hidden until a submission occurs
        const thinkingEl = pane.querySelector('#rag-thinking');
        if (thinkingEl) {
            thinkingEl.hidden = true;
            thinkingEl.style.display = 'none';
        }

        if (inputEl) inputEl.focus();

        // Prepare a one-time cold-start note (shown only on first submit)
        let ragNoteEl = pane.querySelector('.rag-note');
        if (!ragNoteEl) {
            ragNoteEl = document.createElement('div');
            ragNoteEl.className = 'rag-note';
            ragNoteEl.hidden = true;
            if (formEl) {
                formEl.insertAdjacentElement('afterend', ragNoteEl);
            }
        }

        const SUGGESTED_QUESTIONS = [
            "What is Rahul's work experience?",
            "What projects has Rahul built?",
            "What are Rahul's technical skills?",
            "Where did Rahul study?",
        ];

        // Submit handler with conversation history, auto-scroll, stop & retry
        if (formEl && inputEl && outputEl && sendBtn) {
            let currentController = null;
            let isStreaming = false;
            let lastQuery = '';
            let userHasScrolled = false;

            // Stable per-conversation ID so the backend can condense follow-up
            // questions using chat history; rotated when the chat is cleared.
            const newSessionId = () => (window.crypto && crypto.randomUUID)
                ? crypto.randomUUID()
                : 'sid-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
            let ragSessionId = newSessionId();

            // Track manual scrolling to pause auto-scroll
            outputEl.addEventListener('scroll', () => {
                if (!isStreaming) return;
                const atBottom = outputEl.scrollHeight - outputEl.scrollTop - outputEl.clientHeight < 40;
                userHasScrolled = !atBottom;
            });

            function autoScroll() {
                if (!userHasScrolled) {
                    outputEl.scrollTop = outputEl.scrollHeight;
                }
            }

            function setStopMode(on) {
                if (on) {
                    sendBtn.textContent = 'Stop';
                    sendBtn.classList.add('rag-stop');
                    sendBtn.disabled = false;
                    inputEl.disabled = true;
                } else {
                    sendBtn.textContent = 'Ask';
                    sendBtn.classList.remove('rag-stop');
                    sendBtn.disabled = false;
                    inputEl.disabled = false;
                }
            }

            function showSuggestions() {
                const wrapper = document.createElement('div');
                wrapper.className = 'rag-suggestions';
                wrapper.id = 'rag-suggestions';
                SUGGESTED_QUESTIONS.forEach(q => {
                    const pill = document.createElement('button');
                    pill.type = 'button';
                    pill.className = 'rag-suggestion-pill';
                    pill.textContent = q;
                    pill.addEventListener('click', () => {
                        submitQuery(q);
                    });
                    wrapper.appendChild(pill);
                });
                outputEl.appendChild(wrapper);
            }

            showSuggestions();

            // Offline handling: the backend is self-hosted and may be down.
            // Probe it in the background; while unreachable, disable the chat
            // and say so instead of letting questions hang.
            const defaultPlaceholder = inputEl.placeholder;

            async function isRagReachable() {
                try {
                    const resp = await requestWithTimeout(HEALTH_URL, { method: 'GET', cache: 'no-store' }, 6000);
                    if (!resp.ok) return false;
                    const data = await resp.json().catch(() => ({}));
                    return !!data && String(data.status).toLowerCase() === 'ok';
                } catch (_) {
                    return false;
                }
            }

            function setRagOffline(offline) {
                inputEl.disabled = offline;
                sendBtn.disabled = offline;
                inputEl.placeholder = offline ? 'Assistant offline' : defaultPlaceholder;
                outputEl.querySelectorAll('.rag-suggestion-pill').forEach(pill => { pill.disabled = offline; });
                if (!ragNoteEl) return;
                ragNoteEl.textContent = '';
                ragNoteEl.hidden = !offline;
                if (!offline) return;
                ragNoteEl.appendChild(document.createTextNode(OFFLINE_MESSAGE + ' '));
                const checkBtn = document.createElement('button');
                checkBtn.type = 'button';
                checkBtn.className = 'rag-retry';
                checkBtn.textContent = 'Check again';
                checkBtn.addEventListener('click', async () => {
                    checkBtn.disabled = true;
                    checkBtn.textContent = 'Checking...';
                    setRagOffline(!(await isRagReachable()));
                });
                ragNoteEl.appendChild(checkBtn);
            }

            isRagReachable().then(ok => { if (!ok && !isStreaming) setRagOffline(true); });

            async function submitQuery(query) {
                const suggestionsEl = document.getElementById('rag-suggestions');
                if (suggestionsEl) suggestionsEl.remove();
                inputEl.value = '';
                lastQuery = query;
                isStreaming = true;
                userHasScrolled = false;

                // Hide background title
                if (bgTitleEl) bgTitleEl.hidden = true;
                outputEl.style.opacity = '1';
                outputEl.style.transform = 'translateY(0)';

                // Append user bubble
                const userBubble = document.createElement('div');
                userBubble.className = 'rag-msg rag-msg-user';
                userBubble.textContent = query;
                outputEl.appendChild(userBubble);
                autoScroll();

                // Create AI bubble with typing dots
                const aiBubble = document.createElement('div');
                aiBubble.className = 'rag-msg rag-msg-ai';
                const typingIndicator = document.createElement('div');
                typingIndicator.className = 'rag-typing';
                typingIndicator.innerHTML = '<span class="rag-typing-dot"></span><span class="rag-typing-dot"></span><span class="rag-typing-dot"></span>';
                aiBubble.appendChild(typingIndicator);
                outputEl.appendChild(aiBubble);
                autoScroll();

                let accumulated = '';
                let userAborted = false;
                let timedOut = false;
                let wentOffline = false;

                // Cold-start note: show after 5s if still loading on first use
                let coldStartTimer = null;
                if (sessionStorage.getItem('ragColdStartShown') !== '1' && ragNoteEl) {
                    coldStartTimer = setTimeout(() => {
                        if (isStreaming && !accumulated) {
                            ragNoteEl.textContent = 'The instance is cold starting - this may take a moment.';
                            ragNoteEl.hidden = false;
                        }
                    }, 5000);
                }

                setStopMode(true);

                try {
                    currentController = new AbortController();
                    // Allow room for the backend's no-token fallback: a hung
                    // upstream stream can take ~20s to raise before the server
                    // retries via the non-streaming path.
                    const timeoutId = setTimeout(() => {
                        timedOut = true;
                        currentController.abort();
                    }, 45000);

                    const resp = await fetch(QUERY_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query, top_k: 5, session_id: ragSessionId }),
                        signal: currentController.signal
                    });
                    clearTimeout(timeoutId);

                    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

                    // Add cursor
                    const cursor = document.createElement('span');
                    cursor.className = 'rag-cursor';
                    aiBubble.appendChild(cursor);

                    const reader = resp.body.getReader();
                    const decoder = new TextDecoder();
                    let buffer = '';
                    let firstToken = true;

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split('\n');
                        buffer = lines.pop();

                        for (const line of lines) {
                            const trimmed = line.trim();
                            if (!trimmed.startsWith('data:')) continue;
                            const payload = trimmed.slice(5).trim();
                            if (payload === '[DONE]') continue;

                            let parsed = null;
                            try {
                                parsed = JSON.parse(payload);
                            } catch (_) { continue; /* skip malformed JSON */ }

                            if (parsed.error != null) {
                                // Backend signals an interrupted stream; keep any
                                // partial answer, otherwise surface the retry UI.
                                if (!accumulated) throw new Error(parsed.error);
                                const note = document.createElement('p');
                                note.className = 'rag-stream-note';
                                note.textContent = '(answer may be incomplete - the stream was interrupted)';
                                aiBubble.appendChild(note);
                            } else if (parsed.token != null) {
                                if (firstToken) {
                                    firstToken = false;
                                    // Remove typing dots
                                    if (typingIndicator.parentNode) typingIndicator.remove();
                                }
                                accumulated += parsed.token;
                                aiBubble.innerHTML = renderMarkdown(accumulated);
                                aiBubble.appendChild(cursor);
                                autoScroll();
                            }
                        }
                    }

                    if (cursor.parentNode) cursor.remove();

                    if (!accumulated) {
                        aiBubble.innerHTML = renderMarkdown('No answer returned.');
                    }
                } catch (err) {
                    // A timeout with a partial answer is treated like a stop.
                    userAborted = err.name === 'AbortError' && !(timedOut && !accumulated);
                    if (typingIndicator.parentNode) typingIndicator.remove();

                    // No HTTP response at all (network error or timeout):
                    // check whether the backend is down rather than flaky.
                    const unreachable = !userAborted && !accumulated && !/^HTTP /.test(err.message || '');
                    if (unreachable && !(await isRagReachable())) {
                        aiBubble.innerHTML = renderMarkdown("Couldn't reach the assistant - it seems to be offline. Please try again later.");
                        wentOffline = true;
                    } else if (userAborted) {
                        // Keep partial answer if any, or show stopped message
                        if (!accumulated) {
                            aiBubble.innerHTML = renderMarkdown('*Generation stopped.*');
                        }
                    } else {
                        console.error('RAG query failed:', err);
                        aiBubble.innerHTML = renderMarkdown('Something went wrong while fetching the answer.');
                        // Add retry button
                        const retryBtn = document.createElement('button');
                        retryBtn.className = 'rag-retry';
                        retryBtn.textContent = 'Retry';
                        retryBtn.addEventListener('click', () => {
                            // Remove the error bubble
                            aiBubble.remove();
                            // Re-submit
                            submitQuery(lastQuery);
                        });
                        aiBubble.appendChild(retryBtn);
                    }
                } finally {
                    isStreaming = false;
                    currentController = null;
                    setStopMode(false);
                    inputEl.value = '';
                    if (coldStartTimer) clearTimeout(coldStartTimer);
                    try { sessionStorage.setItem('ragColdStartShown', '1'); } catch (_) {}
                    if (ragNoteEl) ragNoteEl.hidden = true;
                    if (wentOffline) {
                        setRagOffline(true);
                    } else {
                        inputEl.focus();
                    }
                    autoScroll();
                }
            }

            formEl.addEventListener('submit', (e) => {
                e.preventDefault();
                // If streaming, treat submit as stop
                if (isStreaming && currentController) {
                    currentController.abort();
                    return;
                }
                const query = (inputEl.value || '').trim();
                if (!query) {
                    inputEl.focus();
                    return;
                }
                submitQuery(query);
            });

            // Esc to clear and reset
            inputEl.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    // If streaming, stop first
                    if (isStreaming && currentController) {
                        currentController.abort();
                    }
                    inputEl.value = '';
                    outputEl.innerHTML = '';
                    outputEl.style.opacity = '0';
                    if (bgTitleEl) bgTitleEl.hidden = false;
                    // Clearing the chat starts a fresh conversation on the backend too
                    ragSessionId = newSessionId();
                    showSuggestions();
                }
            });
        }
    } catch (e) {
        console.error('initializeRag failed:', e);
    }
}

async function pollRagHealth(url) {
    const maxAttempts = 8; // ~ up to ~2m with backoff
    let delay = 2000;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const resp = await requestWithTimeout(url, { method: 'GET' }, 12000);
            if (resp.ok) {
                const data = await resp.json().catch(() => ({}));
                if (data && (data.status === 'ok' || data.status === 'OK')) {
                    return true;
                }
            }
        } catch (e) {
            // ignore and retry
        }
        await new Promise(r => setTimeout(r, delay));
        delay = Math.min(delay * 2, 10000);
    }
    return false;
}

function requestWithTimeout(resource, options = {}, timeoutMs = 10000) {
    const controller = new AbortController();
    const { signal: _ignored, ...rest } = options || {};
    const timerId = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(resource, { ...rest, signal: controller.signal })
        .finally(() => clearTimeout(timerId))
        .catch((err) => {
            if (err && err.name === 'AbortError') {
                throw new Error('Request timed out');
            }
            throw err;
        });
}

// =============================
// Enhanced RAG Animation Functions
// =============================

async function showEnhancedThinkingStates(pane) {
    const thinkingEl = pane.querySelector('#rag-thinking');
    const pipelineEl = pane.querySelector('.rag-pipeline');
    const bgTitleEl = pane.querySelector('.rag-bg-title');

    // Proceed even if pipeline UI is not present
    if (!thinkingEl) return;

    // Ensure the helper title is hidden during processing
    if (bgTitleEl) bgTitleEl.hidden = true;

    // Show thinking states (robust toggle)
    thinkingEl.hidden = false;
    thinkingEl.style.display = 'flex';
    thinkingEl.style.opacity = '0';
    thinkingEl.style.transform = 'translateY(10px)';

    // Animate in
    requestAnimationFrame(() => {
        thinkingEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        thinkingEl.style.opacity = '1';
        thinkingEl.style.transform = 'translateY(0)';
    });

    // Start pipeline animation if present
    if (pipelineEl) startPipelineAnimation(pipelineEl);
    
    // Stage 1: Retrieval (1.5s)
    const retrievalStage = thinkingEl.querySelector('#thinking-retrieval');
    if (retrievalStage) {
        retrievalStage.classList.add('active');
        if (pipelineEl) activatePipelineNode(pipelineEl, 'retrieval');
    }

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Stage 2: Generation - keep highlighted until response completes
    if (retrievalStage) retrievalStage.classList.remove('active');
    const generationStage = thinkingEl.querySelector('#thinking-generation');
    if (generationStage) {
        generationStage.classList.add('active');
        if (pipelineEl) activatePipelineNode(pipelineEl, 'llm');
    }
    // Do not auto-clear the generation highlight here; it will be cleared
    // when hideEnhancedThinkingStates() is called after the response arrives.
}

function hideEnhancedThinkingStates(pane, immediate = false) {
    const thinkingEl = pane.querySelector('#rag-thinking');
    if (!thinkingEl) return;
    
    if (immediate) {
        thinkingEl.hidden = true;
        thinkingEl.style.display = 'none';
        thinkingEl.style.opacity = '0';
        thinkingEl.style.transform = 'translateY(0)';
        const stages = thinkingEl.querySelectorAll('.thinking-stage');
        stages.forEach(stage => stage.classList.remove('active'));
        return;
    }

    thinkingEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    thinkingEl.style.opacity = '0';
    thinkingEl.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
        thinkingEl.hidden = true;
        thinkingEl.style.display = 'none';
        // Reset all stages
        const stages = thinkingEl.querySelectorAll('.thinking-stage');
        stages.forEach(stage => stage.classList.remove('active'));
    }, 300);
}

function startPipelineAnimation(pipelineEl) {
    if (!pipelineEl) return;
    
    // Add subtle pulse to query node
    const queryNode = pipelineEl.querySelector('[data-stage="query"]');
    if (queryNode) {
        queryNode.classList.add('active');
    }
}

function activatePipelineNode(pipelineEl, stage) {
    if (!pipelineEl) return;
    
    // Remove all active states
    const nodes = pipelineEl.querySelectorAll('.pipeline-node');
    nodes.forEach(node => {
        node.classList.remove('active', 'processing');
    });
    
    // Activate current stage
    const activeNode = pipelineEl.querySelector(`[data-stage="${stage}"]`);
    if (activeNode) {
        activeNode.classList.add('processing');
    }
}

function resetPipelineAnimation(pane) {
    const pipelineEl = pane.querySelector('.rag-pipeline');
    if (!pipelineEl) return;
    
    const nodes = pipelineEl.querySelectorAll('.pipeline-node');
    nodes.forEach(node => {
        node.classList.remove('active', 'processing');
    });
}

function renderMarkdown(text) {
    // Escape HTML
    let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Code blocks (```)
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Bullet lists: consecutive lines starting with "- "
    html = html.replace(/(^|\n)(- .+(?:\n- .+)*)/g, (_, before, block) => {
        const items = block.split('\n').map(line =>
            '<li>' + line.replace(/^- /, '') + '</li>'
        ).join('');
        return before + '<ul>' + items + '</ul>';
    });

    // Line breaks (but not inside <ul> or <pre>)
    html = html.replace(/\n/g, '<br>');
    // Clean up extra <br> around block elements
    html = html.replace(/<br>\s*<ul>/g, '<ul>');
    html = html.replace(/<\/ul>\s*<br>/g, '</ul>');
    html = html.replace(/<br>\s*<pre>/g, '<pre>');
    html = html.replace(/<\/pre>\s*<br>/g, '</pre>');

    return html;
}
