/* Freemi Chat Widget — self-contained, no dependencies */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     CONFIG
  ───────────────────────────────────────────── */
  var scriptTag = document.currentScript;
  var widgetId = scriptTag ? scriptTag.getAttribute('data-widget-id') : '';
  var API_URL = 'https://us-central1-freemi-3f7c7.cloudfunctions.net/widgetChat';

  /* ─────────────────────────────────────────────
     SESSION
  ───────────────────────────────────────────── */
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  var SESSION_KEY = 'freemi_session_' + widgetId;
  var sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateUUID();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  var history = []; // { role: 'user'|'assistant', content: string }
  var isOpen = false;
  var isWaiting = false;
  var greetingShown = false;

  /* ─────────────────────────────────────────────
     CSS
  ───────────────────────────────────────────── */
  var css = /*css*/`
    :root {
      --fm-primary-start: #5B5FFF;
      --fm-primary-end: #7C3AED;
      --fm-primary: #5B5FFF;
      --fm-radius-panel: 20px;
      --fm-radius-bubble: 16px;
      --fm-shadow: 0 8px 40px rgba(91,95,255,0.22), 0 2px 12px rgba(0,0,0,0.12);
      --fm-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      --fm-z: 2147483647;
    }

    /* ── Floating button ── */
    #fm-launcher {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: var(--fm-z);
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--fm-primary-start), var(--fm-primary-end));
      box-shadow: 0 4px 20px rgba(91,95,255,0.45);
      cursor: pointer;
      border: none;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      outline: none;
    }
    #fm-launcher:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 28px rgba(91,95,255,0.55);
    }
    #fm-launcher:active {
      transform: scale(0.96);
    }
    #fm-launcher-icon-chat,
    #fm-launcher-icon-close {
      position: absolute;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    #fm-launcher-icon-close {
      opacity: 0;
      transform: rotate(-90deg) scale(0.7);
    }
    #fm-launcher.fm-open #fm-launcher-icon-chat {
      opacity: 0;
      transform: rotate(90deg) scale(0.7);
    }
    #fm-launcher.fm-open #fm-launcher-icon-close {
      opacity: 1;
      transform: rotate(0deg) scale(1);
    }

    /* Freemi logo mark inside button */
    .fm-logo-mark {
      width: 30px;
      height: 30px;
      background: rgba(255,255,255,0.95);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .fm-logo-mark svg {
      width: 18px;
      height: 18px;
    }

    /* ── Chat panel ── */
    #fm-panel {
      position: fixed;
      bottom: 96px;
      right: 24px;
      z-index: var(--fm-z);
      width: 380px;
      height: 520px;
      max-height: calc(100vh - 120px);
      background: #fff;
      border-radius: var(--fm-radius-panel);
      box-shadow: var(--fm-shadow);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: var(--fm-font);
      transform: translateY(20px) scale(0.97);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1), opacity 0.22s ease;
    }
    #fm-panel.fm-visible {
      transform: translateY(0) scale(1);
      opacity: 1;
      pointer-events: all;
    }

    /* ── Header ── */
    #fm-header {
      background: linear-gradient(135deg, var(--fm-primary-start) 0%, var(--fm-primary-end) 100%);
      padding: 16px 18px;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }
    #fm-header-avatar {
      width: 38px;
      height: 38px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    #fm-header-avatar svg {
      width: 22px;
      height: 22px;
    }
    #fm-header-info {
      flex: 1;
      min-width: 0;
    }
    #fm-header-name {
      color: #fff;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: -0.01em;
      line-height: 1.2;
    }
    #fm-header-status {
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 2px;
    }
    .fm-status-dot {
      width: 7px;
      height: 7px;
      background: #4ADE80;
      border-radius: 50%;
      flex-shrink: 0;
      box-shadow: 0 0 0 2px rgba(74,222,128,0.3);
    }
    #fm-header-status span {
      color: rgba(255,255,255,0.82);
      font-size: 12px;
      font-weight: 500;
    }
    #fm-close-btn {
      background: rgba(255,255,255,0.15);
      border: none;
      border-radius: 8px;
      width: 32px;
      height: 32px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.15s ease;
      outline: none;
    }
    #fm-close-btn:hover {
      background: rgba(255,255,255,0.25);
    }
    #fm-close-btn svg {
      width: 16px;
      height: 16px;
      stroke: #fff;
    }

    /* ── Messages ── */
    #fm-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      scroll-behavior: smooth;
      background: #f8f8fc;
    }
    #fm-messages::-webkit-scrollbar {
      width: 4px;
    }
    #fm-messages::-webkit-scrollbar-track {
      background: transparent;
    }
    #fm-messages::-webkit-scrollbar-thumb {
      background: rgba(91,95,255,0.18);
      border-radius: 4px;
    }

    /* ── Bubbles ── */
    .fm-msg-row {
      display: flex;
      align-items: flex-end;
      gap: 8px;
    }
    .fm-msg-row.fm-user {
      flex-direction: row-reverse;
    }
    .fm-bubble {
      max-width: 78%;
      padding: 10px 14px;
      border-radius: var(--fm-radius-bubble);
      font-size: 14px;
      line-height: 1.5;
      word-break: break-word;
    }
    .fm-user .fm-bubble {
      background: linear-gradient(135deg, var(--fm-primary-start), var(--fm-primary-end));
      color: #fff;
      border-bottom-right-radius: 4px;
    }
    .fm-bot .fm-bubble {
      background: #fff;
      color: #1a1a2e;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    .fm-avatar-mini {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--fm-primary-start), var(--fm-primary-end));
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .fm-avatar-mini svg {
      width: 14px;
      height: 14px;
    }

    /* ── Typing indicator ── */
    .fm-typing-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 10px 14px;
    }
    .fm-typing-dot {
      width: 7px;
      height: 7px;
      background: #c0b8f0;
      border-radius: 50%;
      animation: fm-bounce 1.2s ease-in-out infinite;
    }
    .fm-typing-dot:nth-child(2) { animation-delay: 0.18s; }
    .fm-typing-dot:nth-child(3) { animation-delay: 0.36s; }
    @keyframes fm-bounce {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
      30% { transform: translateY(-6px); opacity: 1; }
    }

    /* ── Quick replies ── */
    #fm-quick-replies {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      padding: 4px 14px 2px;
    }
    .fm-qr-btn {
      background: transparent;
      border: 1.5px solid var(--fm-primary);
      color: var(--fm-primary);
      border-radius: 999px;
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;
      font-family: var(--fm-font);
      outline: none;
      white-space: nowrap;
    }
    .fm-qr-btn:hover {
      background: var(--fm-primary);
      color: #fff;
    }

    /* ── Input bar ── */
    #fm-input-row {
      padding: 10px 12px 12px;
      border-top: 1px solid rgba(0,0,0,0.07);
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fff;
      flex-shrink: 0;
    }
    #fm-input {
      flex: 1;
      border: 1.5px solid rgba(91,95,255,0.2);
      border-radius: 999px;
      padding: 9px 16px;
      font-size: 14px;
      font-family: var(--fm-font);
      color: #1a1a2e;
      outline: none;
      background: #f8f8fc;
      transition: border-color 0.15s ease;
      resize: none;
    }
    #fm-input::placeholder { color: #a0a0bc; }
    #fm-input:focus {
      border-color: var(--fm-primary);
      background: #fff;
    }
    #fm-send-btn {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--fm-primary-start), var(--fm-primary-end));
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      outline: none;
    }
    #fm-send-btn:hover {
      transform: scale(1.08);
      box-shadow: 0 3px 12px rgba(91,95,255,0.4);
    }
    #fm-send-btn:active { transform: scale(0.94); }
    #fm-send-btn svg {
      width: 17px;
      height: 17px;
      fill: #fff;
      margin-left: 1px;
    }
    #fm-send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    /* ── Powered-by footer ── */
    #fm-powered {
      text-align: center;
      font-size: 11px;
      color: #a0a0bc;
      padding: 6px 0 8px;
      background: #fff;
      letter-spacing: 0.01em;
      flex-shrink: 0;
    }
    #fm-powered a {
      color: var(--fm-primary);
      text-decoration: none;
      font-weight: 500;
    }
    #fm-powered a:hover { text-decoration: underline; }

    /* ── Responsive ── */
    @media (max-width: 440px) {
      #fm-panel {
        width: calc(100vw - 16px);
        right: 8px;
        bottom: 80px;
        height: calc(100vh - 100px);
        max-height: none;
      }
      #fm-launcher {
        right: 16px;
        bottom: 16px;
      }
    }
  `;

  function injectStyles() {
    var style = document.createElement('style');
    style.id = 'freemi-widget-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ─────────────────────────────────────────────
     SVG HELPERS
  ───────────────────────────────────────────── */
  var SVG_CHAT = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="white"/></svg>';
  var SVG_CLOSE_LAUNCHER = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>';
  var SVG_CLOSE_PANEL = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke-width="2.5" stroke-linecap="round"/></svg>';
  var SVG_SEND = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z" fill="white"/></svg>';
  var SVG_LOGO_SMALL = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="url(#fg)"/><path d="M8 12h8M8 8.5h5M8 15.5h6" stroke="white" stroke-width="1.8" stroke-linecap="round"/><defs><linearGradient id="fg" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="#5B5FFF"/><stop offset="1" stop-color="#7C3AED"/></linearGradient></defs></svg>';

  /* ─────────────────────────────────────────────
     BUILD DOM
  ───────────────────────────────────────────── */
  var launcher, panel, messagesEl, inputEl, sendBtn, quickRepliesEl;

  function buildDOM() {
    /* Launcher button */
    launcher = document.createElement('button');
    launcher.id = 'fm-launcher';
    launcher.setAttribute('aria-label', 'Open Freemi chat');
    launcher.innerHTML =
      '<span id="fm-launcher-icon-chat"><span class="fm-logo-mark">' + SVG_CHAT + '</span></span>' +
      '<span id="fm-launcher-icon-close">' + SVG_CLOSE_LAUNCHER + '</span>';
    document.body.appendChild(launcher);

    /* Panel */
    panel = document.createElement('div');
    panel.id = 'fm-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Freemi chat');

    /* Header */
    var header = document.createElement('div');
    header.id = 'fm-header';
    header.innerHTML =
      '<div id="fm-header-avatar">' + SVG_LOGO_SMALL + '</div>' +
      '<div id="fm-header-info">' +
        '<div id="fm-header-name">Freemi Concierge</div>' +
        '<div id="fm-header-status"><span class="fm-status-dot"></span><span>Online now</span></div>' +
      '</div>' +
      '<button id="fm-close-btn" aria-label="Close chat">' + SVG_CLOSE_PANEL + '</button>';
    panel.appendChild(header);

    /* Messages */
    messagesEl = document.createElement('div');
    messagesEl.id = 'fm-messages';
    panel.appendChild(messagesEl);

    /* Quick replies container */
    quickRepliesEl = document.createElement('div');
    quickRepliesEl.id = 'fm-quick-replies';
    panel.appendChild(quickRepliesEl);

    /* Input row */
    var inputRow = document.createElement('div');
    inputRow.id = 'fm-input-row';

    inputEl = document.createElement('input');
    inputEl.id = 'fm-input';
    inputEl.type = 'text';
    inputEl.placeholder = 'Type a message…';
    inputEl.setAttribute('autocomplete', 'off');

    sendBtn = document.createElement('button');
    sendBtn.id = 'fm-send-btn';
    sendBtn.setAttribute('aria-label', 'Send message');
    sendBtn.innerHTML = SVG_SEND;

    inputRow.appendChild(inputEl);
    inputRow.appendChild(sendBtn);
    panel.appendChild(inputRow);

    /* Powered by */
    var powered = document.createElement('div');
    powered.id = 'fm-powered';
    powered.innerHTML = 'Powered by <a href="https://freemi.ai" target="_blank" rel="noopener">Freemi</a>';
    panel.appendChild(powered);

    document.body.appendChild(panel);
  }

  /* ─────────────────────────────────────────────
     TOGGLE
  ───────────────────────────────────────────── */
  function openPanel() {
    isOpen = true;
    panel.classList.add('fm-visible');
    launcher.classList.add('fm-open');
    launcher.setAttribute('aria-label', 'Close Freemi chat');
    if (!greetingShown) {
      greetingShown = true;
      addBotMessage("Hi! I'm your Freemi concierge. How can I help you today?", []);
    }
    setTimeout(function () { inputEl.focus(); }, 280);
  }

  function closePanel() {
    isOpen = false;
    panel.classList.remove('fm-visible');
    launcher.classList.remove('fm-open');
    launcher.setAttribute('aria-label', 'Open Freemi chat');
  }

  /* ─────────────────────────────────────────────
     MESSAGES
  ───────────────────────────────────────────── */
  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addUserMessage(text) {
    var row = document.createElement('div');
    row.className = 'fm-msg-row fm-user';
    var bubble = document.createElement('div');
    bubble.className = 'fm-bubble';
    bubble.textContent = text;
    row.appendChild(bubble);
    messagesEl.appendChild(row);
    scrollToBottom();
  }

  function addBotMessage(text, quickReplies) {
    var row = document.createElement('div');
    row.className = 'fm-msg-row fm-bot';

    var avatar = document.createElement('div');
    avatar.className = 'fm-avatar-mini';
    avatar.innerHTML = SVG_LOGO_SMALL;

    var bubble = document.createElement('div');
    bubble.className = 'fm-bubble';
    bubble.textContent = text;

    row.appendChild(avatar);
    row.appendChild(bubble);
    messagesEl.appendChild(row);
    scrollToBottom();

    /* Quick replies */
    clearQuickReplies();
    if (quickReplies && quickReplies.length) {
      quickReplies.forEach(function (label) {
        var btn = document.createElement('button');
        btn.className = 'fm-qr-btn';
        btn.textContent = label;
        btn.addEventListener('click', function () {
          clearQuickReplies();
          handleSend(label);
        });
        quickRepliesEl.appendChild(btn);
      });
    }
  }

  function clearQuickReplies() {
    quickRepliesEl.innerHTML = '';
  }

  /* ── Typing indicator ── */
  var typingRow = null;
  function showTyping() {
    if (typingRow) return;
    typingRow = document.createElement('div');
    typingRow.className = 'fm-msg-row fm-bot';

    var avatar = document.createElement('div');
    avatar.className = 'fm-avatar-mini';
    avatar.innerHTML = SVG_LOGO_SMALL;

    var bubble = document.createElement('div');
    bubble.className = 'fm-bubble fm-typing-indicator';
    bubble.innerHTML = '<span class="fm-typing-dot"></span><span class="fm-typing-dot"></span><span class="fm-typing-dot"></span>';

    typingRow.appendChild(avatar);
    typingRow.appendChild(bubble);
    messagesEl.appendChild(typingRow);
    scrollToBottom();
  }

  function hideTyping() {
    if (typingRow && typingRow.parentNode) {
      typingRow.parentNode.removeChild(typingRow);
    }
    typingRow = null;
  }

  /* ─────────────────────────────────────────────
     PARSE QUICK REPLIES
     Lines starting with "•" or "- " are extracted
  ───────────────────────────────────────────── */
  function parseResponse(raw) {
    var lines = raw.split('\n');
    var mainLines = [];
    var replies = [];
    lines.forEach(function (line) {
      var trimmed = line.trim();
      if (/^[•\-]\s+/.test(trimmed)) {
        var label = trimmed.replace(/^[•\-]\s+/, '').trim();
        if (label) replies.push(label);
      } else {
        mainLines.push(line);
      }
    });
    return {
      text: mainLines.join('\n').trim(),
      quickReplies: replies
    };
  }

  /* ─────────────────────────────────────────────
     API CALL
  ───────────────────────────────────────────── */
  function sendToAPI(message) {
    return fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        widgetId: widgetId,
        message: message,
        sessionId: sessionId,
        history: history
      })
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        return data.reply || data.message || data.response || 'Sorry, I could not understand the response.';
      });
  }

  /* ─────────────────────────────────────────────
     HANDLE SEND
  ───────────────────────────────────────────── */
  function handleSend(messageOverride) {
    var text = (messageOverride !== undefined) ? messageOverride : inputEl.value.trim();
    if (!text || isWaiting) return;

    if (!messageOverride) inputEl.value = '';
    clearQuickReplies();

    addUserMessage(text);
    history.push({ role: 'user', content: text });

    isWaiting = true;
    sendBtn.disabled = true;
    showTyping();

    sendToAPI(text)
      .then(function (reply) {
        history.push({ role: 'assistant', content: reply });
        hideTyping();
        var parsed = parseResponse(reply);
        addBotMessage(parsed.text, parsed.quickReplies);
      })
      .catch(function (err) {
        console.error('[Freemi widget]', err);
        hideTyping();
        addBotMessage("I'm having trouble connecting right now. Please try again in a moment.", []);
      })
      .finally(function () {
        isWaiting = false;
        sendBtn.disabled = false;
        inputEl.focus();
      });
  }

  /* ─────────────────────────────────────────────
     EVENTS
  ───────────────────────────────────────────── */
  function bindEvents() {
    launcher.addEventListener('click', function () {
      if (isOpen) closePanel(); else openPanel();
    });

    document.getElementById('fm-close-btn').addEventListener('click', closePanel);

    sendBtn.addEventListener('click', function () { handleSend(); });

    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });

    /* Close on outside click */
    document.addEventListener('click', function (e) {
      if (isOpen && !panel.contains(e.target) && e.target !== launcher && !launcher.contains(e.target)) {
        closePanel();
      }
    });

    /* Escape key */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) closePanel();
    });
  }

  /* ─────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────── */
  function init() {
    injectStyles();
    buildDOM();
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
