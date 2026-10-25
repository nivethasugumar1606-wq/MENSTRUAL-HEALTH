/**
 * NUTURA - Ask Nutura Clinical Self-Care & Educational Chatbot
 * 
 * 100% Offline & Private AI Assistant
 * Implements 3-tier clinical safety assessment before every response.
 * Zero external network calls. Zero third-party trackers.
 */

import { store } from './data/store.js';
import { assessSafety, generateSafeResponse, SAFETY_LEVELS, EMERGENCY_RESOURCES } from './logic/safety.js';
import { ILLUSTRATION_IMAGES } from './illustrations.js';

export function renderAskMimiPage(state) {
  state = state || store.getState();
  const messages = state.chatMessages || [];

  const suggestedQuestions = [
    'Why do I have period cramps and how to soothe them?',
    'What is a normal cycle length variation?',
    'Could my cycle gaps be connected to PCOS?',
    'What should I ask my doctor during a visit?',
    'How do I soothe mild bloating or stomach upset?',
    'Can I exercise or shower during my period?'
  ];

  return `
    <div class="ask-mimi-page-wrapper" style="max-width: 960px; margin: 0 auto; padding: 20px 16px 40px; font-family: var(--font-sans);">
      
      <!-- Top Header & Safety Credentials Banner (Mild Purple Theme Matching Nutura) -->
      <div style="background: linear-gradient(135deg, #4F4370 0%, #64558C 100%); color: #FFFFFF; border-radius: 16px; padding: 24px 28px; margin-bottom: 20px; box-shadow: 0 4px 20px rgba(71, 62, 105, 0.12); border: 1px solid rgba(255, 255, 255, 0.18); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 18px;">
          <div style="width: 60px; height: 60px; border-radius: 50%; background: rgba(255,255,255,0.16); border: 2px solid rgba(255,255,255,0.28); display: flex; align-items: center; justify-content: center; font-size: 2rem; flex-shrink: 0;">
            🌸
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <h1 style="font-size: 1.75rem; font-weight: 700; margin: 0; color: #FAF7F2; font-family: var(--font-sans);">
                Ask Nutura
              </h1>
              <span style="background: rgba(255, 255, 255, 0.16); color: #F0ECF8; border: 1px solid rgba(255, 255, 255, 0.28); padding: 3px 12px; border-radius: 9999px; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.5px;">
                ● 100% OFFLINE & PRIVATE
              </span>
            </div>
            <p style="color: #E2DAF0; font-size: 0.88rem; margin: 4px 0 0; line-height: 1.45;">
              Inclusive menstrual health, PCOS education, and evidence-informed self-care companion.
            </p>
          </div>
        </div>

        <div style="display: flex; gap: 10px; align-items: center;">
          <button id="btn-clear-chat" style="background: rgba(255,255,255,0.14); color: #FAF7F2; border: 1px solid rgba(255,255,255,0.25); border-radius: 8px; padding: 8px 14px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px;">
            <span>🗑️</span> Clear Chat
          </button>
        </div>
      </div>

      <!-- Professional Care Disclaimer Box -->
      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-left: 4px solid #4F4370; border-radius: 10px; padding: 12px 16px; margin-bottom: 18px; font-size: 0.8rem; color: #475569; line-height: 1.5; display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 1.25rem; flex-shrink: 0;">ℹ️</span>
        <div>
          <strong>Medical Guidance Notice:</strong> Nutura is an offline health education and tracking companion, not a licensed healthcare provider. Nutura provides clinically reviewed general guidance and never makes medical diagnoses, prescribes medications, or promises cures. In any acute emergency, dial <strong>112</strong> or <strong>108</strong> immediately.
        </div>
      </div>

      <!-- Suggested Quick Questions Chips -->
      <div style="margin-bottom: 16px;">
        <div style="font-size: 0.76rem; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
          💡 Suggested Topics & Safe Questions:
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${suggestedQuestions.map(q => `
            <button class="btn-suggested-q" data-question="${q}" style="background: #FFFFFF; border: 1px solid #CBD5E1; color: #334155; padding: 6px 12px; border-radius: 9999px; font-size: 0.78rem; font-weight: 500; cursor: pointer; transition: all 0.2s; text-align: left;">
              ${q}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Chat Feed Container -->
      <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.04); overflow: hidden; display: flex; flex-direction: column; min-height: 520px;">
        
        <!-- Messages Scroll Area -->
        <div id="chat-messages-container" style="flex: 1; padding: 24px; overflow-y: auto; max-height: 520px; display: flex; flex-direction: column; gap: 20px; background: #FAF9F6;">
          ${messages.map(m => renderMessageBubble(m)).join('')}
        </div>

        <!-- Chat Input Form -->
        <div style="padding: 16px 20px; background: #FFFFFF; border-top: 1px solid #E2E8F0;">
          <form id="form-ask-mimi" style="display: flex; gap: 12px; align-items: center;">
            <input 
              type="text" 
              id="input-chat-query" 
              placeholder="Ask Nutura anything about puberty, cramps, PCOS, or your cycle..." 
              style="flex: 1; border: 1.5px solid #CBD5E1; border-radius: 12px; padding: 12px 18px; font-size: 0.92rem; outline: none; background: #F8FAFC; transition: border-color 0.2s, background 0.2s;"
              autocomplete="off"
              required 
            />
            <button 
              type="submit" 
              id="btn-send-chat" 
              style="background: #473E69; color: #FFFFFF; border: none; border-radius: 12px; padding: 12px 24px; font-weight: 600; font-size: 0.92rem; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(71, 62, 105, 0.2); transition: background 0.2s;"
            >
              <span>Send</span>
              <span>➤</span>
            </button>
          </form>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; color: #94A3B8; margin-top: 8px;">
            <span>🛡️ All chats run locally with zero network requests</span>
            <span>Shift + Enter for multiline</span>
          </div>
        </div>

      </div>

    </div>
  `;
}

/**
 * Renders an individual chat message bubble with clinical badges & emergency helplines
 */
function renderMessageBubble(msg) {
  const isUser = msg.sender === 'user';
  const timeStr = new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isUser) {
    return `
      <div style="display: flex; justify-content: flex-end; align-items: flex-end; gap: 8px;">
        <div style="max-width: 78%; display: flex; flex-direction: column; align-items: flex-end;">
          <div style="background: linear-gradient(135deg, #4F4370 0%, #64558C 100%); color: #FFFFFF; padding: 12px 18px; border-radius: 16px 16px 4px 16px; font-size: 0.92rem; line-height: 1.5; box-shadow: 0 2px 6px rgba(71, 62, 105, 0.15); word-break: break-word;">
            ${escapeHtml(msg.text)}
          </div>
          <span style="font-size: 0.7rem; color: #94A3B8; margin-top: 4px; padding-right: 4px;">${timeStr}</span>
        </div>
        <div style="width: 32px; height: 32px; border-radius: 50%; background: #E2E8F0; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; flex-shrink: 0;">
          👤
        </div>
      </div>
    `;
  }

  // Determine badge styling
  let badgeBg = '#E0F2FE';
  let badgeColor = '#0369A1';
  let borderLeftColor = '#0284C7';

  if (msg.level === SAFETY_LEVELS.EMERGENCY || msg.isEmergency) {
    badgeBg = '#FEE2E2';
    badgeColor = '#991B1B';
    borderLeftColor = '#DC2626';
  } else if (msg.level === SAFETY_LEVELS.MEDICAL_ASSESSMENT) {
    badgeBg = '#FEF3C7';
    badgeColor = '#92400E';
    borderLeftColor = '#F59E0B';
  } else if (msg.level === SAFETY_LEVELS.MILD_CONCERN) {
    badgeBg = '#D1FAE5';
    badgeColor = '#065F46';
    borderLeftColor = '#10B981';
  } else if (msg.level === SAFETY_LEVELS.BOUNDARY_NOTICE) {
    badgeBg = '#EDE9FE';
    badgeColor = '#5B21B6';
    borderLeftColor = '#7C3AED';
  }

  // Parse markdown-like bold and bullet formatting into HTML safely
  const formattedHtml = formatChatMarkdown(msg.text);

  return `
    <div style="display: flex; justify-content: flex-start; align-items: flex-start; gap: 10px;">
      <div style="width: 36px; height: 36px; border-radius: 50%; background: #F3EEF8; border: 1.5px solid #D6CCE4; display: flex; align-items: center; justify-content: center; font-size: 1.15rem; flex-shrink: 0; margin-top: 2px;">
        🌸
      </div>
      <div style="max-width: 82%; display: flex; flex-direction: column; align-items: flex-start;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap;">
          <span style="font-weight: 700; font-size: 0.82rem; color: #372F54;">Nutura</span>
          ${msg.badge ? `
            <span style="background: ${badgeBg}; color: ${badgeColor}; font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 9999px;">
              ${msg.badge}
            </span>
          ` : ''}
          <span style="font-size: 0.7rem; color: #94A3B8;">${timeStr}</span>
        </div>

        <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-left: 4px solid ${borderLeftColor}; border-radius: 4px 16px 16px 16px; padding: 14px 18px; font-size: 0.9rem; line-height: 1.6; color: #1E293B; box-shadow: 0 1px 4px rgba(0,0,0,0.03); width: 100%;">
          ${formattedHtml}

          ${msg.helplines && msg.helplines.length > 0 ? `
            <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #F1F5F9;">
              <div style="font-size: 0.78rem; font-weight: 700; color: #991B1B; margin-bottom: 8px; text-transform: uppercase;">
                📞 Immediate Emergency & Support Contacts:
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${msg.helplines.map(h => `
                  <a href="${h.link}" style="background: #FEF2F2; border: 1px solid #FEE2E2; border-radius: 8px; padding: 8px 12px; text-decoration: none; color: #991B1B; display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; font-weight: 600;">
                    <span>${h.name}</span>
                    <span style="background: #DC2626; color: #FFF; padding: 2px 8px; border-radius: 4px; font-size: 0.76rem;">${h.number}</span>
                  </a>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

/**
 * Markdown converter for clean chat bubbles
 */
function formatChatMarkdown(text = '') {
  if (!text) return '';
  return text
    .replace(/^### (.*$)/gim, '<div style="font-weight: 700; font-size: 1rem; color: #1E1B4B; margin-bottom: 6px;">$1</div>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/---/g, '<hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 12px 0;" />')
    .replace(/^• (.*$)/gim, '<div style="margin-left: 12px; margin-bottom: 4px;">• $1</div>')
    .replace(/^\d+\. (.*$)/gim, '<div style="margin-left: 12px; margin-bottom: 4px;">$1</div>')
    .replace(/\n\n/g, '<div style="margin-bottom: 10px;"></div>');
}

function escapeHtml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Event bindings for Ask Mimi Chatbot
 */
export function bindAskMimiEvents(renderFn) {
  // Auto-scroll chat feed to bottom
  const container = document.getElementById('chat-messages-container');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }

  // Submit Query Form
  const form = document.getElementById('form-ask-mimi');
  const input = document.getElementById('input-chat-query');

  if (form && input) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      // 1. Add user message
      store.addChatMessage({
        sender: 'user',
        text: text
      });
      input.value = '';

      // 2. Perform clinical safety assessment
      const assessment = assessSafety(text, store.getState().chatMessages);

      // 3. Formulate safe medical response
      const response = generateSafeResponse(text, assessment);

      // 4. Save Nutura's response
      store.addChatMessage({
        sender: 'nutura',
        text: response.text,
        level: response.level,
        badge: response.badge,
        badgeClass: response.badgeClass,
        helplines: response.helplines || [],
        isEmergency: Boolean(response.isEmergency)
      });

      if (renderFn) renderFn();
    });
  }

  // Quick Suggested Questions
  document.querySelectorAll('.btn-suggested-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-question');
      if (input) {
        input.value = q;
        input.focus();
      }
    });
  });

  // Clear Chat History
  const btnClear = document.getElementById('btn-clear-chat');
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (confirm('Clear your private local chat history? This will remove all messages from this device.')) {
        store.clearChatMessages();
        if (renderFn) renderFn();
      }
    });
  }
}
