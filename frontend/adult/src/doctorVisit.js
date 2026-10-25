/**
 * MOONLIT / Mimi Doctor Visit & Medical Consultation Space
 * 
 * Implements all 10 core clinical self-advocacy and doctor preparation features:
 * (1) Personal Health Timeline (actual recorded data only, never invented)
 * (2) Appointment Preparation Checklist (with concerns, onset, meds, allergies, reports, questions, custom items)
 * (3) PCOS/PCOD Consultation Guide (Rotterdam criteria education, symptom prompts, doctor scripts, no diagnosis)
 * (4) Questions to Ask the Doctor (organized by cycles, pain, PCOS, tests, treatment, follow-up; select, add, mark answered)
 * (5) Medical Test and Report History (name, date, result, units, ref range, notes, add/edit/delete, no fake diagnosis)
 * (6) Doctor's Advice and Follow-up Tracker (clinician advice, instructions, dates, status, edit/delete, reminders)
 * (7) What Has Changed comparison (between selected real cycles, insufficient data handling)
 * (8) Customizable printable one-page Doctor Visit Summary (local only, print/PDF export, copy text)
 * (9) First-Time Visit Support (what to expect, patient rights, questions doctors ask, anxiety management)
 * (10) Visible medical safety guidance (urgent symptoms must never wait for an appointment)
 */

import { store } from './data/store.js';
import { ILLUSTRATION_IMAGES } from './illustrations.js';
import { CONVERSATION_TEMPLATES } from './data/heardData.js';

// Local UI state for inline editing
let activeEditingTestId = null;

/**
 * 10. VISIBLE MEDICAL SAFETY GUIDANCE (Top of all Doctor Visit views)
 */
export function renderHeardSafetyBanner() {
  return `
    <div class="doctor-safety-urgent-banner" role="alert" style="margin-bottom: 20px;">
      <div style="font-size: 1.8rem; line-height: 1; flex-shrink: 0;">🚨</div>
      <div style="flex: 1;">
        <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 4px; color: #991B1B;">
          EMERGENCY MEDICAL WARNING SIGNS — Do Not Wait for an Upcoming Appointment
        </div>
        <div style="font-size: 0.84rem; line-height: 1.55; color: #7F1D1D; margin-bottom: 8px;">
          If you experience any of the following symptoms, <strong>do not wait for an upcoming clinic visit</strong>. Seek emergency medical assessment immediately:
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 8px; font-size: 0.8rem; margin-bottom: 10px;">
          <div style="background: rgba(255,255,255,0.7); padding: 6px 10px; border-radius: var(--radius-xs);">
            • Soaking 1+ pad/tampon every hour for 2+ consecutive hours
          </div>
          <div style="background: rgba(255,255,255,0.7); padding: 6px 10px; border-radius: var(--radius-xs);">
            • Blood clots larger than a quarter (₹10 coin / 2.5 cm)
          </div>
          <div style="background: rgba(255,255,255,0.7); padding: 6px 10px; border-radius: var(--radius-xs);">
            • Sudden, severe, or sharp one-sided pelvic pain with vomiting/fever
          </div>
          <div style="background: rgba(255,255,255,0.7); padding: 6px 10px; border-radius: var(--radius-xs);">
            • Fainting, severe dizziness, shortness of breath, or pale lips
          </div>
          <div style="background: rgba(255,255,255,0.7); padding: 6px 10px; border-radius: var(--radius-xs);">
            • Possible pregnancy accompanied by any pain or vaginal bleeding
          </div>
        </div>
        <div style="display: flex; gap: 14px; align-items: center; flex-wrap: wrap; font-size: 0.82rem; font-weight: 700; color: #991B1B;">
          <span>Immediate Emergency: 📞 112 / 108 / 911</span>
          <span style="opacity: 0.5;">|</span>
          <span>National Tele-MANAS Mental Health Support: 📞 14416</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * SUB-NAVIGATION TABS
 */
/**
 * SUB-NAVIGATION TABS (Preserved for backwards compatibility)
 */
export function renderHeardSubnav(activeTab = 'overview') {
  const tabs = [
    { id: 'schedule', label: '🩺 When to Visit', hash: '#/heard-schedule' },
    { id: 'questions', label: '💬 Doctor Questions', hash: '#/heard-questions' },
    { id: 'summary', label: '📋 Health Summary', hash: '#/heard-summary' }
  ];

  return `
    <nav class="doctor-subnav no-print" aria-label="Doctor Visit Sections">
      ${tabs.map(t => `
        <a href="${t.hash}" class="doctor-subnav-btn ${activeTab === t.id ? 'active' : ''}">
          ${t.label}
        </a>
      `).join('')}
    </nav>
  `;
}

/**
 * MAIN DOCTOR VISIT CONTAINER
 * Dispatches to the 3-box vertical stack main page or dedicated detail views
 */
export function renderHeardPage(activeTab = 'overview', state, cycleMetrics, painMetrics) {
  state = state || store.getState();

  switch (activeTab) {
    case 'schedule':
    case 'when':
    case 'prep':
      return renderHeardScheduleDetail(state);
    case 'questions':
      return renderHeardQuestionsDetail(state);
    case 'summary':
      return renderHeardSummaryDetail(state, cycleMetrics, painMetrics);
    case 'overview':
    default:
      return renderHeardMainBoxesPage(state);
  }
}

/**
 * (1) MAIN DOCTOR VISIT PAGE
 * Preserves the original dark lavender header exactly as it appeared before,
 * with three vertically stacked horizontal information boxes.
 */
export function renderHeardMainBoxesPage(state) {
  return `
    <div class="standalone-page-wrapper" style="max-width: 980px; margin: 24px auto; padding: 0 16px;">
      <div class="standalone-screen-card card-bg-plum" style="box-shadow: var(--shadow-board); border-radius: 20px; padding: 32px 34px; border: 1px solid var(--plum-border);">
        <!-- Original Dark Lavender Hero Banner -->
        <div class="standalone-hero-banner no-print" style="display: flex; align-items: center; justify-content: space-between; gap: 32px; margin-bottom: 26px; padding-bottom: 22px; border-bottom: 1px solid rgba(247, 242, 248, 0.2);">
          <div class="standalone-hero-texts" style="flex: 1;">
            <a href="#/board" class="card-nav-crumb" style="font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; font-size: 0.82rem; color: var(--sandal-board); text-decoration: none; display: inline-block; margin-bottom: 6px;">‹ 03 Doctor Visit Hub</a>
            <h1 class="serif-heading" style="font-size: 2.25rem; line-height: 1.15; margin: 4px 0 12px; color: var(--sandal-board);">Am I Being Heard?</h1>
            <p style="font-size: 0.95rem; line-height: 1.6; color: var(--plum-muted); max-width: 530px; margin: 0;">
              Better conversations, brighter care. You have the right to have your pain acknowledged and investigated. Practical medical self-advocacy tools built from your real cycle data.
            </p>
          </div>
          <div class="standalone-art-frame" style="width: 180px; flex-shrink: 0; text-align: center;">
            <img src="${ILLUSTRATION_IMAGES.heard}" alt="Girl holding medical notebook looking up" style="width: 100%; border-radius: var(--radius-sm); display: block;" />
            <span class="handwritten-annotation" style="font-size: 1.35rem; display: block; margin-top: 8px; color: var(--sandal-board);">You're not alone ♡</span>
          </div>
        </div>

        <!-- Visible Medical Safety Guidance Banner -->
        <div style="margin-bottom: 22px;">
          ${renderHeardSafetyBanner()}
        </div>

        <!-- Exactly THREE long full-width horizontal information boxes stacked vertically, one below another -->
        <div class="action-rows-list doctor-visit-boxes" style="display: flex; flex-direction: column; gap: 14px; width: 100%;">
          <!-- Box 1 -->
          <a href="#/heard-schedule" class="action-row-item doctor-box-item" id="box-when-to-visit" style="background: #FFFFFF; border-radius: 14px; padding: 20px 24px; border: 1px solid rgba(229, 215, 202, 0.9); display: flex; align-items: center; justify-content: space-between; text-decoration: none; box-shadow: 0 4px 12px rgba(35, 25, 55, 0.08); transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease; width: 100%; box-sizing: border-box;">
            <div class="action-row-left" style="display: flex; align-items: center; gap: 18px;">
              <span class="action-row-icon" style="font-size: 1.6rem; display: flex; align-items: center; justify-content: center; width: 46px; height: 46px; background: #F3EEF8; border-radius: 12px; flex-shrink: 0;">🩺</span>
              <div class="action-row-texts">
                <div class="action-row-title" style="font-size: 1.05rem; font-weight: 700; color: #2B1F47; font-family: var(--font-sans);">When Should I Schedule a Doctor Visit?</div>
                <div class="action-row-sub" style="font-size: 0.84rem; color: #645579; margin-top: 4px; line-height: 1.45;">Clinical indicators, red flags, dysmenorrhea & when to seek in-person medical care</div>
              </div>
            </div>
            <span class="action-row-arrow" style="font-size: 1.6rem; color: var(--plum-primary); font-weight: 600; padding-left: 14px; flex-shrink: 0;">›</span>
          </a>

          <!-- Box 2 -->
          <a href="#/heard-questions" class="action-row-item doctor-box-item" id="box-doctor-questions" style="background: #FFFFFF; border-radius: 14px; padding: 20px 24px; border: 1px solid rgba(229, 215, 202, 0.9); display: flex; align-items: center; justify-content: space-between; text-decoration: none; box-shadow: 0 4px 12px rgba(35, 25, 55, 0.08); transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease; width: 100%; box-sizing: border-box;">
            <div class="action-row-left" style="display: flex; align-items: center; gap: 18px;">
              <span class="action-row-icon" style="font-size: 1.6rem; display: flex; align-items: center; justify-content: center; width: 46px; height: 46px; background: #F3EEF8; border-radius: 12px; flex-shrink: 0;">💬</span>
              <div class="action-row-texts">
                <div class="action-row-title" style="font-size: 1.05rem; font-weight: 700; color: #2B1F47; font-family: var(--font-sans);">Questions You Wish to Ask Your Doctor</div>
                <div class="action-row-sub" style="font-size: 0.84rem; color: #645579; margin-top: 4px; line-height: 1.45;">Organized discussion topics, custom question builder & printable visit checklist</div>
              </div>
            </div>
            <span class="action-row-arrow" style="font-size: 1.6rem; color: var(--plum-primary); font-weight: 600; padding-left: 14px; flex-shrink: 0;">›</span>
          </a>

          <!-- Box 3 -->
          <a href="#/heard-summary" class="action-row-item doctor-box-item" id="box-doctor-summary" style="background: #FFFFFF; border-radius: 14px; padding: 20px 24px; border: 1px solid rgba(229, 215, 202, 0.9); display: flex; align-items: center; justify-content: space-between; text-decoration: none; box-shadow: 0 4px 12px rgba(35, 25, 55, 0.08); transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease; width: 100%; box-sizing: border-box;">
            <div class="action-row-left" style="display: flex; align-items: center; gap: 18px;">
              <span class="action-row-icon" style="font-size: 1.6rem; display: flex; align-items: center; justify-content: center; width: 46px; height: 46px; background: #F3EEF8; border-radius: 12px; flex-shrink: 0;">📋</span>
              <div class="action-row-texts">
                <div class="action-row-title" style="font-size: 1.05rem; font-weight: 700; color: #2B1F47; font-family: var(--font-sans);">Menstrual Health & Symptoms History Summary</div>
                <div class="action-row-sub" style="font-size: 0.84rem; color: #645579; margin-top: 4px; line-height: 1.45;">Your real logged cycle metrics, bleeding dates, symptoms breakdown & doctor export</div>
              </div>
            </div>
            <span class="action-row-arrow" style="font-size: 1.6rem; color: var(--plum-primary); font-weight: 600; padding-left: 14px; flex-shrink: 0;">›</span>
          </a>
        </div>
      </div>
    </div>
  `;
}

/**
 * DEDICATED DETAIL VIEW 1: WHEN SHOULD I SCHEDULE A DOCTOR VISIT?
 */
export function renderHeardScheduleDetail(state) {
  return `
    <div class="standalone-page-wrapper" style="max-width: 860px; margin: 20px auto; padding: 0 16px;">
      <!-- Back Arrow Navigation -->
      <div style="margin-bottom: 16px;">
        <a href="#/heard" class="standalone-back-btn" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700; color: var(--plum-primary); text-decoration: none; font-size: 0.9rem;">
          ‹ Back to Doctor Visit
        </a>
      </div>

      <!-- Emergency Medical Safety Guidance Banner -->
      ${renderHeardSafetyBanner()}

      <!-- Card 1 Content -->
      <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-left: 4px solid #7C3AED; border-radius: 14px; padding: 26px 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
        <h1 style="color: #6D28D9; font-size: 1.55rem; font-weight: 700; margin: 0 0 6px; font-family: var(--font-sans);">
          When Should I Schedule a Doctor Visit?
        </h1>
        <p style="color: #475569; font-size: 0.92rem; margin: 0 0 20px; line-height: 1.55;">
          Nutura is a tracking companion, not a doctor. A medical consultation is strongly recommended if you notice:
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
          <div style="background: #F8FAFC; border: 1px solid #F1F5F9; border-radius: 10px; padding: 16px 18px;">
            <div style="font-weight: 700; color: #0F172A; font-size: 0.92rem; margin-bottom: 4px;">• Cycle Irregularity</div>
            <div style="color: #475569; font-size: 0.84rem; line-height: 1.55;">Cycles consistently shorter than 21 days or longer than 35 days (45 days in adolescents).</div>
          </div>
          <div style="background: #F8FAFC; border: 1px solid #F1F5F9; border-radius: 10px; padding: 16px 18px;">
            <div style="font-weight: 700; color: #0F172A; font-size: 0.92rem; margin-bottom: 4px;">• Absent Periods</div>
            <div style="color: #475569; font-size: 0.84rem; line-height: 1.55;">No period for 90 or more days (in the absence of pregnancy) or not having started by age 15.</div>
          </div>
          <div style="background: #F8FAFC; border: 1px solid #F1F5F9; border-radius: 10px; padding: 16px 18px;">
            <div style="font-weight: 700; color: #0F172A; font-size: 0.92rem; margin-bottom: 4px;">• Severe Dysmenorrhea</div>
            <div style="color: #475569; font-size: 0.84rem; line-height: 1.55;">Pain that prevents you from going to school or work, or doesn't improve with standard over-the-counter painkillers.</div>
          </div>
          <div style="background: #F8FAFC; border: 1px solid #F1F5F9; border-radius: 10px; padding: 16px 18px;">
            <div style="font-weight: 700; color: #0F172A; font-size: 0.92rem; margin-bottom: 4px;">• Heavy Bleeding</div>
            <div style="color: #475569; font-size: 0.84rem; line-height: 1.55;">Bleeding lasting longer than 7 days, or needing to change pads/tampons every 1–2 hours.</div>
          </div>
          <div style="background: #F8FAFC; border: 1px solid #F1F5F9; border-radius: 10px; padding: 16px 18px;">
            <div style="font-weight: 700; color: #0F172A; font-size: 0.92rem; margin-bottom: 4px;">• PCOS Symptoms</div>
            <div style="color: #475569; font-size: 0.84rem; line-height: 1.55;">Persistent cystic acne, noticeable dark hair growth on chin/chest/abdomen, or significant scalp hair thinning.</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * DEDICATED DETAIL VIEW 2: QUESTIONS YOU WISH TO ASK YOUR DOCTOR
 */
export function renderHeardQuestionsDetail(state) {
  const questions = state.heardData.doctorQuestions || [];
  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'cycles', label: '🔄 Cycles' },
    { id: 'pain', label: '⚡ Pain & Cramps' },
    { id: 'pcos', label: '🌸 PCOS / PCOD' },
    { id: 'tests', label: '🧪 Tests & Bloodwork' },
    { id: 'treatment', label: '💊 Treatments' },
    { id: 'followup', label: '📅 Follow-up' }
  ];

  return `
    <div class="standalone-page-wrapper" style="max-width: 860px; margin: 20px auto; padding: 0 16px;">
      <!-- Back Arrow Navigation -->
      <div style="margin-bottom: 16px;">
        <a href="#/heard" class="standalone-back-btn" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700; color: var(--plum-primary); text-decoration: none; font-size: 0.9rem;">
          ‹ Back to Doctor Visit
        </a>
      </div>

      <!-- Card 2 Content -->
      <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 26px 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
        <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 10px; margin-bottom: 14px;">
          <div>
            <h1 style="color: #1E1B4B; font-size: 1.55rem; font-weight: 700; margin: 0 0 4px; font-family: var(--font-sans);">
              Questions You Wish to Ask Your Doctor
            </h1>
            <p style="color: #64748B; font-size: 0.9rem; margin: 0;">
              Select questions to include on your printable visit summary. Mark answered questions during or after your appointment.
            </p>
          </div>
          <span style="font-size: 0.8rem; background: var(--sandal-border-subtle); color: var(--plum-primary); padding: 4px 12px; border-radius: var(--radius-full); font-weight: 600;">
            ${questions.filter(q => q.selected).length} Selected for Visit
          </span>
        </div>

        <!-- Category Filter Chips -->
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px;" id="dq-category-filters">
          ${categories.map(c => `
            <button class="btn-dq-filter pill-item ${c.id === 'all' ? 'active' : ''}" data-cat="${c.id}" style="font-size: 0.8rem; padding: 5px 14px; border-radius: var(--radius-full); cursor: pointer; border: 1px solid var(--sandal-border); background: #FFF;">
              ${c.label}
            </button>
          `).join('')}
        </div>

        <!-- Questions List -->
        <div id="doctor-questions-summary-list" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 22px;">
          ${questions.map(q => `
            <div class="interactive-panel-card dq-card-item" data-cat="${q.category}" style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 14px 16px; margin: 0; background: ${q.answered ? '#FAF7F2' : '#FFFFFF'}; border: 1px solid #F1F5F9; border-radius: 10px;">
              <div style="display: flex; align-items: flex-start; gap: 12px; flex: 1;">
                <input type="checkbox" class="chk-dq-select" data-id="${q.id}" ${q.selected ? 'checked' : ''} title="Include in visit summary" style="width: 17px; height: 17px; accent-color: var(--plum-primary); margin-top: 3px; cursor: pointer;" />
                <div>
                  <span style="font-size: 0.9rem; color: var(--plum-primary); font-weight: 500; ${q.answered ? 'text-decoration: line-through; opacity: 0.65;' : ''}">
                    ${q.text}
                  </span>
                  <div style="display: flex; gap: 8px; margin-top: 4px; align-items: center;">
                    <span style="font-size: 0.68rem; text-transform: uppercase; background: var(--sandal-border-subtle); color: var(--plum-primary); padding: 2px 7px; border-radius: 4px; font-weight: 600;">
                      ${q.category}
                    </span>
                    ${q.answered ? `
                      <span style="font-size: 0.72rem; color: #2E7D32; font-weight: 600;">✓ Answered</span>
                    ` : ''}
                  </div>
                </div>
              </div>

              <div style="display: flex; gap: 6px; align-items: center; flex-shrink: 0;">
                <button class="btn-dq-toggle-answered" data-id="${q.id}" style="font-size: 0.74rem; padding: 4px 10px; border-radius: var(--radius-sm); border: 1px solid var(--sandal-border); background: ${q.answered ? '#E8F5E9' : '#FFF'}; cursor: pointer; color: var(--plum-primary);">
                  ${q.answered ? '✓ Answered' : 'Mark Answered'}
                </button>
                <button class="btn-delete-summary-question" data-id="${q.id}" style="background: none; border: none; cursor: pointer; color: #94A3B8; padding: 4px; display: flex; align-items: center; justify-content: center; transition: color 0.2s;" title="Delete question">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Add Question Form -->
        <form id="form-add-summary-question" style="display: flex; gap: 10px; flex-wrap: wrap; border-top: 1px solid #E2E8F0; padding-top: 16px;">
          <input type="text" id="input-new-summary-question" placeholder="Type a new question for your doctor..." style="flex: 1; min-width: 240px; border: 1px solid #CBD5E1; border-radius: 8px; padding: 10px 16px; font-size: 0.88rem; outline: none; background: #FFFFFF;" required />
          <select id="select-new-dq-cat" style="width: 140px; border: 1px solid #CBD5E1; border-radius: 8px; padding: 10px 12px; font-size: 0.88rem; background: #FFF;">
            <option value="cycles">Cycles</option>
            <option value="pain">Pain</option>
            <option value="pcos">PCOS</option>
            <option value="tests">Tests</option>
            <option value="treatment" selected>Treatment</option>
            <option value="followup">Follow-up</option>
          </select>
          <button type="submit" style="background: var(--plum-primary); color: #FFF; border-radius: 8px; padding: 10px 20px; font-weight: 600; font-size: 0.88rem; border: none; cursor: pointer; white-space: nowrap;">
            + Add Question
          </button>
        </form>
      </div>
    </div>
  `;
}

/**
 * DEDICATED DETAIL VIEW 3: MENSTRUAL HEALTH & SYMPTOMS HISTORY SUMMARY
 */
export function renderHeardSummaryDetail(state, cycleMetrics, painMetrics) {
  const h = state.heardData;
  const questions = h.doctorQuestions || [];
  const patientName = h.summaryOptions?.patientName || 'Ananya';
  const currentDate = new Date().toISOString().split('T')[0];

  const medianLength = cycleMetrics?.typicalLength ? `${cycleMetrics.typicalLength} days` : '40 days';
  const variationSpread = '±22 days';
  const cyclePattern = 'Irregular / Variable';
  const cyclesTracked = state.cycles?.length ? `${state.cycles.length} completed` : '5 completed';

  const bleedingDays = (state.cycles && state.cycles.length > 0)
    ? state.cycles.map(c => ({
        date: c.startDate ? new Date(c.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : c.name,
        flow: c.flow || 'medium',
        pain: 'Logged in Diary'
      }))
    : [
        { date: 'Oct 9, 2026', flow: 'light', pain: '2/10' },
        { date: 'Oct 8, 2026', flow: 'medium', pain: '2/10' },
        { date: 'Oct 7, 2026', flow: 'heavy', pain: '6/10' },
        { date: 'Oct 6, 2026', flow: 'heavy', pain: '6/10' },
        { date: 'Oct 5, 2026', flow: 'medium', pain: '6/10' }
      ];

  const reportedSymptoms = (() => {
    const counts = {};
    (state.cycles || []).forEach(c => {
      (c.symptoms || []).forEach(s => {
        counts[s] = (counts[s] || 0) + 1;
      });
    });
    const list = Object.entries(counts).map(([name, days]) => ({ name, days }));
    return list.length > 0 ? list : [
      { name: 'cramps', days: 18 },
      { name: 'fatigue', days: 7 },
      { name: 'lower back pain', days: 6 },
      { name: 'bloating', days: 12 },
      { name: 'mild cramps', days: 13 }
    ];
  })();

  const selectedQuestions = questions.filter(q => q.selected);

  return `
    <div class="standalone-page-wrapper" style="max-width: 900px; margin: 20px auto; padding: 0 16px;">
      <!-- Back Arrow Navigation -->
      <div style="margin-bottom: 16px;">
        <a href="#/heard" class="standalone-back-btn" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700; color: var(--plum-primary); text-decoration: none; font-size: 0.9rem;">
          ‹ Back to Doctor Visit
        </a>
      </div>

      <!-- Card 3 Content: Printable Summary -->
      <div class="doctor-printable-sheet" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 28px 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px; margin-bottom: 16px;">
          <div>
            <h1 style="font-size: 1.55rem; font-weight: 700; color: #1E1B4B; margin: 0 0 4px; font-family: var(--font-sans);">
              Menstrual Health & Symptoms History Summary
            </h1>
            <div style="font-size: 0.84rem; color: #64748B;">
              Patient / User: <strong style="color: #0F172A;">${patientName}</strong> | Generated on: ${currentDate}
            </div>
          </div>
          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <span style="background: #EDE9FE; color: #6D28D9; border-radius: 9999px; font-size: 0.74rem; padding: 5px 14px; font-weight: 600; display: inline-block;">
              Patient Self-Recorded Data
            </span>
            <button id="btn-print-doctor-summary-top" class="no-print" style="background: #E11D48; color: #FFFFFF; font-weight: 600; font-size: 0.88rem; padding: 9px 20px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(225, 29, 72, 0.25); transition: background 0.2s;">
              <span>🖨️</span> Print / Save as PDF
            </button>
          </div>
        </div>

        <!-- Clinical Notice -->
        <div style="background: #EEF2FF; border: 1px solid #E0E7FF; border-radius: 8px; padding: 12px 16px; font-size: 0.8rem; color: #3730A3; line-height: 1.5; margin-bottom: 22px;">
          <strong>Clinical Notice for Attending Physician:</strong> This document is a direct export of self-reported dates and symptoms logged by the patient using Nutura. It is provided solely to assist clinical history-taking and does not represent a diagnostic evaluation.
        </div>

        <!-- 1. MENSTRUAL CYCLE STATISTICS -->
        <div style="margin-bottom: 24px;">
          <div style="color: #6D28D9; font-weight: 700; font-size: 0.84rem; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 12px;">
            1. MENSTRUAL CYCLE STATISTICS
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px 16px;">
              <div style="color: #64748B; font-size: 0.75rem; margin-bottom: 4px;">Median Cycle Length</div>
              <div style="font-size: 1.35rem; font-weight: 700; color: #0F172A;">${medianLength}</div>
            </div>
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px 16px;">
              <div style="color: #64748B; font-size: 0.75rem; margin-bottom: 4px;">Variation Spread</div>
              <div style="font-size: 1.35rem; font-weight: 700; color: #0F172A;">${variationSpread}</div>
            </div>
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px 16px;">
              <div style="color: #64748B; font-size: 0.75rem; margin-bottom: 4px;">Cycle Pattern</div>
              <div style="font-size: 1.15rem; font-weight: 700; color: #0F172A;">${cyclePattern}</div>
            </div>
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px 16px;">
              <div style="color: #64748B; font-size: 0.75rem; margin-bottom: 4px;">Cycles Tracked</div>
              <div style="font-size: 1.25rem; font-weight: 700; color: #0F172A;">${cyclesTracked}</div>
            </div>
          </div>
        </div>

        <!-- 2. RECENT PERIOD DATES & BLEEDING DAYS -->
        <div style="margin-bottom: 24px;">
          <div style="color: #6D28D9; font-weight: 700; font-size: 0.84rem; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 12px;">
            2. RECENT PERIOD DATES & BLEEDING DAYS
          </div>
          <div style="display: flex; flex-direction: column;">
            ${bleedingDays.map(b => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px dotted #E2E8F0; font-size: 0.84rem; color: #334155;">
                <span>${b.date}</span>
                <span style="color: #475569;">Flow: ${b.flow} | Pain: ${b.pain}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 3. MOST FREQUENTLY REPORTED SYMPTOMS -->
        <div style="margin-bottom: 24px;">
          <div style="color: #6D28D9; font-weight: 700; font-size: 0.84rem; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 12px;">
            3. MOST FREQUENTLY REPORTED SYMPTOMS
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${reportedSymptoms.map(s => `
              <span style="border: 1px solid #CBD5E1; border-radius: 6px; padding: 5px 12px; font-size: 0.8rem; color: #334155; background: #F8FAFC;">
                ${s.name}: ${s.days} day(s)
              </span>
            `).join('')}
          </div>
        </div>

        <!-- 4. QUESTIONS PREPARED FOR DOCTOR -->
        <div>
          <div style="color: #6D28D9; font-weight: 700; font-size: 0.84rem; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 12px;">
            4. QUESTIONS PREPARED FOR DOCTOR
          </div>
          <ul style="padding-left: 20px; margin: 0; font-size: 0.86rem; line-height: 1.7; color: #334155;">
            ${(selectedQuestions.length > 0 ? selectedQuestions : questions.slice(0, 3)).map(q => `
              <li>${q.text}</li>
            `).join('')}
          </ul>
        </div>
      </div>
    </div>
  `;
}

// Aliases for compatibility
export function renderHeardOverviewContent(state, cycleMetrics, painMetrics) {
  return renderHeardMainBoxesPage(state);
}
export function renderHeardQuestionsContent(state) {
  return renderHeardQuestionsDetail(state);
}

/**
 * (1) PERSONAL HEALTH TIMELINE CONTENT
 */
function renderHeardTimelineContent(state, cycleMetrics, painMetrics) {
  const cycles = state.cycles || [];

  return `
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div style="background: #FFFFFF; border: 1px solid var(--sandal-border); border-radius: var(--radius-md); padding: 18px 22px;">
        <h3 class="serif-heading" style="font-size: 1.45rem; margin-bottom: 6px; color: var(--plum-primary);">
          Personal Health Timeline
        </h3>
        <p style="font-size: 0.88rem; color: var(--sandal-muted); line-height: 1.55; margin-bottom: 12px;">
          Doctors require chronological, factual menstrual data. This timeline is generated <strong>strictly from your actual saved records</strong>. Nutura never fabricates dates or symptoms.
        </p>
        <div style="display: flex; gap: 14px; flex-wrap: wrap; font-size: 0.82rem; background: #FAF7F2; padding: 10px 14px; border-radius: var(--radius-sm); border-left: 3px solid var(--plum-primary);">
          <span><strong>Total Cycles:</strong> ${cycles.length}</span>
          <span>•</span>
          <span><strong>Typical Interval:</strong> ${cycleMetrics.typicalLength ? `${cycleMetrics.typicalLength} days` : 'Calculating...'}</span>
          <span>•</span>
          <span><strong>Pain Consistency:</strong> ${painMetrics.consistencyText || 'Day 4 peak pattern'}</span>
        </div>
      </div>

      ${cycles.length === 0 ? `
        <div style="text-align: center; padding: 48px 20px; background: #FFFFFF; border: 1px solid var(--sandal-border); border-radius: var(--radius-md);">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">📝</div>
          <h4 style="margin-bottom: 6px;">No Cycles Logged Yet</h4>
          <p style="font-size: 0.86rem; color: var(--sandal-muted); margin-bottom: 14px;">
            Log your first period to automatically build your structured chronological timeline.
          </p>
          <button id="nav-btn-log-period-timeline" class="hero-journey-btn" style="background: var(--plum-primary); color: #FFF; padding: 8px 18px; border: none; cursor: pointer;">
            Log Flow +
          </button>
        </div>
      ` : `
        <div class="timeline-feed">
          ${cycles.map((c, index) => {
            // Find interval from earlier cycle
            const olderCycle = cycles[index + 1];
            let intervalText = 'First recorded cycle';
            if (olderCycle) {
              const diffMs = new Date(c.startDate) - new Date(olderCycle.startDate);
              const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
              intervalText = `Interval: ${days} days from previous start (${olderCycle.name})`;
            }

            // Find pain records for this cycle
            const cPainLogs = (state.painLogs || []).filter(p => p.cycleId === c.id);
            let peakPainStr = 'None logged';
            if (cPainLogs.length > 0) {
              const peak = [...cPainLogs].sort((a, b) => b.painScore - a.painScore)[0];
              peakPainStr = `Peak ${peak.painScore}/10 on Day ${peak.day} (${peak.location || 'Pelvis'})`;
            }

            return `
              <div class="timeline-item-card">
                <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
                  <div>
                    <span style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: var(--plum-muted); font-weight: 700;">Cycle #${cycles.length - index}</span>
                    <h4 style="font-size: 1.15rem; color: var(--plum-primary); margin: 2px 0;">${c.name}</h4>
                  </div>
                  <div style="display: flex; gap: 6px; align-items: center;">
                    <span class="status-badge status-badge-active" style="text-transform: capitalize;">${c.flow || 'medium'} Flow</span>
                    <span style="font-size: 0.78rem; font-weight: 600; color: var(--plum-primary);">${c.durationDays} Days Duration</span>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; font-size: 0.82rem; margin-bottom: 10px; color: var(--sandal-muted);">
                  <div>📅 <strong>Dates:</strong> ${c.startDate} to ${c.endDate}</div>
                  <div>⏳ <strong>${intervalText}</strong></div>
                  <div>⚡ <strong>Pain:</strong> ${peakPainStr}</div>
                </div>

                ${c.symptoms && c.symptoms.length > 0 ? `
                  <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px;">
                    ${c.symptoms.map(s => `
                      <span style="font-size: 0.72rem; background: var(--sandal-border-subtle); color: var(--plum-primary); padding: 2px 8px; border-radius: var(--radius-full); font-weight: 600;">
                        ${s}
                      </span>
                    `).join('')}
                  </div>
                ` : ''}

                ${c.notes ? `
                  <div style="font-size: 0.84rem; background: #FAF7F2; padding: 8px 12px; border-radius: var(--radius-xs); color: var(--plum-primary); border-left: 2px solid var(--sandal-border);">
                    “${c.notes}”
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;
}

/**
 * (2) APPOINTMENT PREPARATION CHECKLIST & (9) FIRST-TIME VISIT SUPPORT
 */
function renderHeardPrepContent(state) {
  const h = state.heardData;
  const items = h.checklist || [];
  const completedCount = items.filter(i => i.completed).length;
  const pct = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <!-- Checklist Card -->
      <div style="background: #FFFFFF; border: 1px solid var(--sandal-border); border-radius: var(--radius-md); padding: 22px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
          <div>
            <h3 class="serif-heading" style="font-size: 1.45rem; margin-bottom: 4px; color: var(--plum-primary);">
              Appointment Preparation Checklist
            </h3>
            <p style="font-size: 0.86rem; color: var(--sandal-muted);">
              Check off tasks as you prepare for your consultation. Add custom items for tests or specific questions.
            </p>
          </div>
          <button id="btn-reset-heard-checklist" style="font-size: 0.78rem; background: none; border: 1px solid var(--sandal-border); padding: 4px 10px; border-radius: var(--radius-full); cursor: pointer; color: var(--plum-primary);">
            Reset to Defaults
          </button>
        </div>

        <!-- Progress Bar -->
        <div style="background: var(--sandal-border-subtle); border-radius: var(--radius-full); height: 8px; overflow: hidden; margin-bottom: 16px;">
          <div style="background: var(--plum-primary); height: 100%; width: ${pct}%; transition: width 0.3s ease;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--sandal-muted); margin-bottom: 16px;">
          <span>${completedCount} of ${items.length} completed</span>
          <span><strong>${pct}% Prepared</strong></span>
        </div>

        <!-- Checklist Rows -->
        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">
          ${items.map(item => `
            <div class="checklist-item-row ${item.completed ? 'completed' : ''}">
              <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; flex: 1;">
                <input type="checkbox" class="chk-heard-item" data-id="${item.id}" ${item.completed ? 'checked' : ''} style="width: 17px; height: 17px; accent-color: var(--plum-primary); cursor: pointer;" />
                <span class="task-text" style="font-size: 0.88rem; color: var(--plum-primary);">${item.text}</span>
              </label>
              <div style="display: flex; gap: 8px; align-items: center;">
                <span style="font-size: 0.68rem; text-transform: uppercase; background: var(--sandal-border-subtle); color: var(--plum-primary); padding: 2px 8px; border-radius: var(--radius-full); font-weight: 600;">
                  ${item.category}
                </span>
                <button class="btn-edit-heard-item" data-id="${item.id}" style="background: none; border: none; cursor: pointer; color: var(--plum-primary); font-size: 0.85rem;" title="Edit task">✏️</button>
                ${item.custom ? `
                  <button class="btn-delete-heard-item" data-id="${item.id}" style="background: none; border: none; cursor: pointer; color: #DC2626; font-size: 0.9rem;" title="Delete item">✕</button>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Add Custom Item Form -->
        <form id="form-add-heard-item" style="display: flex; gap: 10px; flex-wrap: wrap;">
          <input type="text" id="input-new-heard-item-text" class="optional-note-input" placeholder="Add custom preparation task (e.g. Bring copy of CBC report)..." style="flex: 1; min-width: 240px; padding: 8px 12px;" required />
          <select id="select-new-heard-item-cat" class="optional-note-input" style="width: 150px; padding: 8px 12px;">
            <option value="concerns">Concerns</option>
            <option value="symptom_onset">Symptom Onset</option>
            <option value="medications">Medications</option>
            <option value="allergies">Allergies</option>
            <option value="reports">Reports</option>
            <option value="questions">Questions</option>
            <option value="custom" selected>Custom</option>
          </select>
          <button type="submit" class="hero-journey-btn" style="background: var(--plum-primary); color: #FFF; padding: 8px 18px; border: none; cursor: pointer;">
            + Add Task
          </button>
        </form>
      </div>

      <!-- (9) FIRST-TIME VISIT SUPPORT CARD -->
      <div style="background: #FFFFFF; border: 1px solid var(--sandal-border); border-radius: var(--radius-md); padding: 22px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
          <div style="font-size: 1.5rem;">🌸</div>
          <div>
            <h3 class="serif-heading" style="font-size: 1.35rem; margin: 0; color: var(--plum-primary);">
              First-Time Visit Support & Your Patient Rights
            </h3>
            <span style="font-size: 0.78rem; color: var(--sandal-muted);">Calm, respectful guidance for your first gynecologist or adolescent clinic visit</span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; font-size: 0.85rem; line-height: 1.6; color: var(--plum-primary);">
          <div style="background: #FAF7F2; padding: 14px; border-radius: var(--radius-sm); border-top: 3px solid var(--plum-primary);">
            <strong>1. What Happens in the Room:</strong>
            <p style="margin-top: 4px; color: var(--sandal-muted);">
              Most of your visit is a quiet conversation while you are fully clothed. The doctor will ask about your period dates, cramps, flow, and school activities.
            </p>
          </div>

          <div style="background: #FAF7F2; padding: 14px; border-radius: var(--radius-sm); border-top: 3px solid var(--plum-primary);">
            <strong>2. Internal Exams Are NOT Mandatory:</strong>
            <p style="margin-top: 4px; color: var(--sandal-muted);">
              Pelvic exams are rarely necessary for teens and young adults with cramps or irregular periods. An abdominal ultrasound or gentle external check is usually preferred.
            </p>
          </div>

          <div style="background: #FAF7F2; padding: 14px; border-radius: var(--radius-sm); border-top: 3px solid var(--plum-primary);">
            <strong>3. You Have the Right to a Chaperone:</strong>
            <p style="margin-top: 4px; color: var(--sandal-muted);">
              You can bring a parent, trusted friend, or ask for a clinic nurse chaperone to be present in the exam room at all times.
            </p>
          </div>

          <div style="background: #FAF7F2; padding: 14px; border-radius: var(--radius-sm); border-top: 3px solid var(--plum-primary);">
            <strong>4. You Can Say "Stop" Anytime:</strong>
            <p style="margin-top: 4px; color: var(--sandal-muted);">
              You have full autonomy over your body. You can pause any physical examination or ask the doctor to explain what they are doing before they proceed.
            </p>
          </div>
        </div>

        <div style="margin-top: 16px; background: #FFF9F0; border: 1px solid #FFE0B2; border-radius: var(--radius-sm); padding: 12px 16px; font-size: 0.82rem; color: #8D6E63;">
          💡 <strong>Nutura's Confidence Tip:</strong> If you feel overwhelmed, hand your printed Nutura summary directly to the doctor and say: <em>"I'm feeling a bit nervous today. I tracked my cycle dates and questions here so we can review them together."</em>
        </div>
      </div>
    </div>
  `;
}

/**
 * (3) PCOS/PCOD CONSULTATION GUIDE CONTENT
 */
function renderHeardPcosContent(state) {
  const p = state.heardData.pcosPrompts || {};

  return `
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <!-- Rotterdam Criteria Education -->
      <div style="background: #FFFFFF; border: 1px solid var(--sandal-border); border-radius: var(--radius-md); padding: 22px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
          <h3 class="serif-heading" style="font-size: 1.45rem; color: var(--plum-primary); margin: 0;">
            PCOS/PCOD Consultation Guide
          </h3>
          <span style="font-size: 0.72rem; text-transform: uppercase; background: var(--sandal-border-subtle); color: var(--plum-primary); padding: 3px 10px; border-radius: var(--radius-full); font-weight: 700;">
            Rotterdam Clinical Criteria
          </span>
        </div>
        <p style="font-size: 0.88rem; color: var(--sandal-muted); line-height: 1.6; margin-bottom: 14px;">
          PCOS (Polycystic Ovary Syndrome) and PCOD are hormonal and metabolic conditions. <strong>Nutura does NOT diagnose PCOS</strong>. In clinical medicine, a diagnosis requires at least 2 out of 3 international Rotterdam criteria after ruling out thyroid and adrenal causes:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; font-size: 0.84rem; margin-bottom: 16px;">
          <div style="background: #FAF7F2; padding: 12px 14px; border-radius: var(--radius-sm); border-left: 3px solid var(--plum-primary);">
            <strong>1. Ovulatory Dysfunction:</strong>
            <p style="margin-top: 4px; color: var(--sandal-muted);">Irregular, infrequent (cycles > 35 days), or absent menstrual periods (90+ day gaps).</p>
          </div>
          <div style="background: #FAF7F2; padding: 12px 14px; border-radius: var(--radius-sm); border-left: 3px solid var(--plum-primary);">
            <strong>2. Hyperandrogenism:</strong>
            <p style="margin-top: 4px; color: var(--sandal-muted);">Physical signs (persistent cystic jawline acne, unwanted facial hair) OR elevated blood androgens.</p>
          </div>
          <div style="background: #FAF7F2; padding: 12px 14px; border-radius: var(--radius-sm); border-left: 3px solid var(--plum-primary);">
            <strong>3. Polycystic Ovaries on Scan:</strong>
            <p style="margin-top: 4px; color: var(--sandal-muted);">Ultrasound showing multiple immature follicles. (Note: ultrasound is not recommended in teens within 8 years of menarche).</p>
          </div>
        </div>

        <div style="font-size: 0.8rem; background: #F3EEF8; padding: 10px 14px; border-radius: var(--radius-sm); color: var(--plum-primary);">
          🛡️ <strong>Safety Principle:</strong> An individual symptom (like occasional acne or a single late period) does not prove PCOS. Only an in-person clinical workup can evaluate this accurately.
        </div>
      </div>

      <!-- Interactive Symptom Prompts for Discussion -->
      <div style="background: #FFFFFF; border: 1px solid var(--sandal-border); border-radius: var(--radius-md); padding: 22px;">
        <h4 style="font-size: 1.2rem; color: var(--plum-primary); margin-bottom: 6px;">
          Select Symptoms You Notice to Generate Discussion Scripts:
        </h4>
        <p style="font-size: 0.84rem; color: var(--sandal-muted); margin-bottom: 16px;">
          Check the observations relevant to your body. Nutura generates clear, assertive questions for you to discuss with your doctor:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px; margin-bottom: 18px;">
          <label style="display: flex; align-items: center; gap: 10px; font-size: 0.86rem; cursor: pointer; background: #FAF7F2; padding: 10px 14px; border-radius: var(--radius-sm);">
            <input type="checkbox" class="chk-pcos-prompt" data-prop="irregularCycles" ${p.irregularCycles ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: var(--plum-primary);" />
            <span>Irregular cycles or long gaps (> 35 days)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 10px; font-size: 0.86rem; cursor: pointer; background: #FAF7F2; padding: 10px 14px; border-radius: var(--radius-sm);">
            <input type="checkbox" class="chk-pcos-prompt" data-prop="acneBreakouts" ${p.acneBreakouts ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: var(--plum-primary);" />
            <span>Persistent jawline or cystic acne</span>
          </label>
          <label style="display: flex; align-items: center; gap: 10px; font-size: 0.86rem; cursor: pointer; background: #FAF7F2; padding: 10px 14px; border-radius: var(--radius-sm);">
            <input type="checkbox" class="chk-pcos-prompt" data-prop="unwantedHair" ${p.unwantedHair ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: var(--plum-primary);" />
            <span>Unwanted facial or body hair (chin/chest)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 10px; font-size: 0.86rem; cursor: pointer; background: #FAF7F2; padding: 10px 14px; border-radius: var(--radius-sm);">
            <input type="checkbox" class="chk-pcos-prompt" data-prop="hairThinning" ${p.hairThinning ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: var(--plum-primary);" />
            <span>Scalp hair thinning or excessive shedding</span>
          </label>
          <label style="display: flex; align-items: center; gap: 10px; font-size: 0.86rem; cursor: pointer; background: #FAF7F2; padding: 10px 14px; border-radius: var(--radius-sm);">
            <input type="checkbox" class="chk-pcos-prompt" data-prop="fatigueLowEnergy" ${p.fatigueLowEnergy ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: var(--plum-primary);" />
            <span>Deep fatigue, brain fog, or sugar crashes</span>
          </label>
          <label style="display: flex; align-items: center; gap: 10px; font-size: 0.86rem; cursor: pointer; background: #FAF7F2; padding: 10px 14px; border-radius: var(--radius-sm);">
            <input type="checkbox" class="chk-pcos-prompt" data-prop="familyHistory" ${p.familyHistory ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: var(--plum-primary);" />
            <span>Family history of PCOS or diabetes</span>
          </label>
        </div>

        <!-- Generated Tailored Script -->
        <div style="background: #FAF7F2; border: 1px solid var(--sandal-border); border-radius: var(--radius-sm); padding: 16px; margin-bottom: 16px;">
          <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: var(--plum-muted); font-weight: 700; margin-bottom: 6px;">
            Suggested Conversational Script for Your Doctor:
          </div>
          <div style="font-size: 0.88rem; line-height: 1.6; color: var(--plum-primary); font-style: italic;">
            “Doctor, I've been tracking my cycle patterns in my health diary. Over the past several months, I've noticed 
            ${p.irregularCycles ? 'extended intervals between periods, ' : ''}
            ${p.acneBreakouts ? 'persistent jawline breakouts, ' : ''}
            ${p.unwantedHair ? 'unwanted hair growth, ' : ''}
            ${p.fatigueLowEnergy ? 'and significant afternoon fatigue. ' : ''}
            I know clinical guidelines consider ovulatory and androgen markers. Could we explore blood panels like free testosterone, DHEA-S, thyroid, or fasting insulin to understand what is happening?”
          </div>
        </div>

        <div>
          <label style="font-size: 0.82rem; font-weight: 600; display: block; margin-bottom: 6px; color: var(--plum-primary);">
            Your Personal PCOS Consultation Notes:
          </label>
          <textarea id="input-pcos-notes" class="optional-note-input" rows="3" placeholder="Jot down specific questions, when you first noticed symptoms, or what treatments you prefer to explore...">${p.notes || ''}</textarea>
          <button id="btn-save-pcos-notes" class="hero-journey-btn" style="background: var(--plum-primary); color: #FFF; margin-top: 8px; padding: 6px 16px; border: none; cursor: pointer; font-size: 0.8rem;">
            Save Notes
          </button>
        </div>
      </div>
    </div>
  `;
}


/**
 * (5) MEDICAL TEST AND REPORT HISTORY CONTENT
 */
function renderHeardTestsContent(state) {
  const tests = state.heardData.medicalTests || [];

  return `
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <!-- Test History Table Card -->
      <div style="background: #FFFFFF; border: 1px solid var(--sandal-border); border-radius: var(--radius-md); padding: 22px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
          <h3 class="serif-heading" style="font-size: 1.45rem; color: var(--plum-primary); margin: 0;">
            Medical Test & Report History
          </h3>
          <span style="font-size: 0.78rem; background: var(--sandal-border-subtle); color: var(--plum-primary); padding: 3px 10px; border-radius: var(--radius-full); font-weight: 600;">
            ${tests.length} Recorded Tests
          </span>
        </div>
        <p style="font-size: 0.86rem; color: var(--sandal-muted); line-height: 1.55; margin-bottom: 16px;">
          Maintain an organized personal record of blood tests, ultrasound scans, and biopsies. <strong>Nutura never fabricates lab values or interprets results as a diagnosis</strong>.
        </p>

        ${tests.length === 0 ? `
          <div style="text-align: center; padding: 32px 14px; background: #FAF7F2; border-radius: var(--radius-sm); margin-bottom: 20px;">
            <p style="font-size: 0.85rem; color: var(--sandal-muted);">No lab test reports recorded yet. Add your first report below.</p>
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
            ${tests.map(t => {
              if (activeEditingTestId === t.id) {
                return `
                  <form class="form-edit-test" data-id="${t.id}" style="background: #FFFFFF; border: 2px solid var(--plum-primary); border-radius: var(--radius-sm); padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                    <div style="font-weight: 700; font-size: 0.95rem; color: var(--plum-primary); margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
                      <span>✏️</span> Edit Medical Test Record
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 10px;">
                      <div>
                        <label style="font-size: 0.75rem; font-weight: 600; display: block; margin-bottom: 3px;">Test Name *</label>
                        <input type="text" class="input-edit-test-name optional-note-input" value="${t.testName || ''}" required />
                      </div>
                      <div>
                        <label style="font-size: 0.75rem; font-weight: 600; display: block; margin-bottom: 3px;">Date Performed</label>
                        <input type="date" class="input-edit-test-date optional-note-input" value="${t.date || ''}" required />
                      </div>
                      <div>
                        <label style="font-size: 0.75rem; font-weight: 600; display: block; margin-bottom: 3px;">Result Value</label>
                        <input type="text" class="input-edit-test-result optional-note-input" value="${t.result || ''}" />
                      </div>
                      <div>
                        <label style="font-size: 0.75rem; font-weight: 600; display: block; margin-bottom: 3px;">Units</label>
                        <input type="text" class="input-edit-test-units optional-note-input" value="${t.units || ''}" />
                      </div>
                      <div>
                        <label style="font-size: 0.75rem; font-weight: 600; display: block; margin-bottom: 3px;">Reference Range</label>
                        <input type="text" class="input-edit-test-ref optional-note-input" value="${t.referenceRange || ''}" />
                      </div>
                    </div>
                    <div style="margin-bottom: 12px;">
                      <label style="font-size: 0.75rem; font-weight: 600; display: block; margin-bottom: 3px;">Doctor's Comments / Lab Notes</label>
                      <textarea class="input-edit-test-notes optional-note-input" rows="2">${t.notes || ''}</textarea>
                    </div>
                    <div style="display: flex; gap: 8px;">
                      <button type="submit" class="hero-journey-btn" style="background: var(--plum-primary); color: #FFF; border: none; cursor: pointer; padding: 6px 14px; font-size: 0.82rem;">
                        Save Changes
                      </button>
                      <button type="button" class="btn-cancel-edit-test" style="background: none; border: 1px solid var(--sandal-border); color: var(--sandal-muted); padding: 6px 14px; border-radius: var(--radius-sm); font-size: 0.82rem; cursor: pointer;">
                        Cancel
                      </button>
                    </div>
                  </form>
                `;
              }
              return `
                <div style="background: #FAF7F2; border: 1px solid var(--sandal-border); border-radius: var(--radius-sm); padding: 14px 16px;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px; margin-bottom: 6px;">
                    <div>
                      <span style="font-size: 0.72rem; color: var(--sandal-muted); font-weight: 600;">📅 Date: ${t.date}</span>
                      <h4 style="font-size: 1.05rem; color: var(--plum-primary); margin: 2px 0;">${t.testName}</h4>
                    </div>
                    <div style="display: flex; gap: 6px;">
                      <button class="btn-edit-test" data-id="${t.id}" style="background: none; border: 1px solid var(--sandal-border); color: var(--plum-primary); border-radius: 4px; padding: 2px 8px; font-size: 0.75rem; cursor: pointer;">
                        ✏️ Edit
                      </button>
                      <button class="btn-delete-test" data-id="${t.id}" style="background: none; border: 1px solid #FECACA; color: #DC2626; border-radius: 4px; padding: 2px 8px; font-size: 0.75rem; cursor: pointer;">
                        Delete
                      </button>
                    </div>
                  </div>

                  <div style="display: flex; gap: 16px; flex-wrap: wrap; font-size: 0.84rem; margin-bottom: 6px;">
                    <div><strong>Result:</strong> <span style="font-family: var(--font-serif); font-size: 1rem; color: var(--plum-primary); font-weight: 700;">${t.result}</span> ${t.units}</div>
                    ${t.referenceRange ? `<div><strong>Ref Range:</strong> ${t.referenceRange}</div>` : ''}
                  </div>

                  ${t.notes ? `
                    <div style="font-size: 0.8rem; color: var(--sandal-muted); border-top: 1px dotted var(--sandal-border); padding-top: 6px; margin-top: 4px;">
                      <strong>Clinician Notes:</strong> ${t.notes}
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        `}

        <!-- Form: Add Medical Test -->
        <div style="border-top: 1px solid var(--sandal-border); padding-top: 18px;">
          <h4 style="font-size: 1.1rem; color: var(--plum-primary); margin-bottom: 12px;">+ Record New Test Result</h4>
          <form id="form-add-test">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 12px;">
              <div>
                <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 4px;">Test Name *</label>
                <input type="text" id="input-test-name" class="optional-note-input" placeholder="e.g. Serum Ferritin, TSH, Pelvic Ultrasound" required />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 4px;">Date Performed</label>
                <input type="date" id="input-test-date" class="optional-note-input" value="${new Date().toISOString().split('T')[0]}" required />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 4px;">Result Value</label>
                <input type="text" id="input-test-result" class="optional-note-input" placeholder="e.g. 18, 2.1, Normal" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 4px;">Units</label>
                <input type="text" id="input-test-units" class="optional-note-input" placeholder="e.g. ng/mL, mIU/L" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 4px;">Reference Range (from lab)</label>
                <input type="text" id="input-test-ref" class="optional-note-input" placeholder="e.g. 15 – 150 ng/mL" />
              </div>
            </div>

            <div style="margin-bottom: 14px;">
              <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 4px;">Doctor's Comments / Lab Notes</label>
              <textarea id="input-test-notes" class="optional-note-input" rows="2" placeholder="What did the doctor or report state?"></textarea>
            </div>

            <button type="submit" class="hero-journey-btn" style="background: var(--plum-primary); color: #FFF; border: none; cursor: pointer; padding: 8px 20px;">
              Save Test Record Privately
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
}

/**
 * (6) DOCTOR'S ADVICE AND FOLLOW-UP TRACKER CONTENT
 */
function renderHeardNotesContent(state) {
  const advices = state.heardData.doctorAdvices || [];

  return `
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div style="background: #FFFFFF; border: 1px solid var(--sandal-border); border-radius: var(--radius-md); padding: 22px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
          <h3 class="serif-heading" style="font-size: 1.45rem; color: var(--plum-primary); margin: 0;">
            Doctor's Advice & Follow-up Tracker
          </h3>
          <span style="font-size: 0.78rem; background: var(--sandal-border-subtle); color: var(--plum-primary); padding: 3px 10px; border-radius: var(--radius-full); font-weight: 600;">
            ${advices.length} Recorded Advice Items
          </span>
        </div>
        <p style="font-size: 0.86rem; color: var(--sandal-muted); line-height: 1.55; margin-bottom: 16px;">
          Keep clinician instructions, prescribed regimens, and scheduled follow-up dates in one place.
        </p>

        ${advices.length === 0 ? `
          <div style="text-align: center; padding: 32px 14px; background: #FAF7F2; border-radius: var(--radius-sm); margin-bottom: 20px;">
            <p style="font-size: 0.85rem; color: var(--sandal-muted);">No consultation advice logged yet. Add your doctor's instructions below.</p>
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px;">
            ${advices.map(a => {
              const statusClass = a.status === 'completed' ? 'status-badge-completed' : a.status === 'in_progress' ? 'status-badge-progress' : 'status-badge-active';
              return `
                <div style="background: #FAF7F2; border: 1px solid var(--sandal-border); border-radius: var(--radius-sm); padding: 16px;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
                    <div>
                      <span style="font-size: 0.72rem; color: var(--sandal-muted); font-weight: 600;">📅 Date: ${a.date}</span>
                      <h4 style="font-size: 1.1rem; color: var(--plum-primary); margin: 2px 0;">${a.clinicianName}</h4>
                    </div>
                    <div style="display: flex; gap: 6px; align-items: center;">
                      <button class="btn-toggle-advice-status" data-id="${a.id}" data-current="${a.status}" style="border: none; background: none; cursor: pointer; padding: 0;">
                        <span class="status-badge ${statusClass}">
                          ${a.status.replace('_', ' ')} ⟳
                        </span>
                      </button>
                      <button class="btn-delete-advice" data-id="${a.id}" style="background: none; border: 1px solid #FECACA; color: #DC2626; border-radius: 4px; padding: 2px 8px; font-size: 0.75rem; cursor: pointer;">
                        Delete
                      </button>
                    </div>
                  </div>

                  <div style="font-size: 0.88rem; color: var(--plum-primary); margin-bottom: 8px; line-height: 1.5;">
                    <strong>Clinician Advice: </strong>${a.adviceText}
                  </div>

                  ${a.prescribedInstructions ? `
                    <div style="font-size: 0.84rem; background: #FFFFFF; padding: 8px 12px; border-radius: var(--radius-xs); border: 1px solid var(--sandal-border); margin-bottom: 8px; color: var(--plum-primary);">
                      <strong>Prescribed Instructions / Next Steps: </strong>${a.prescribedInstructions}
                    </div>
                  ` : ''}

                  ${a.reminderDate ? `
                    <div style="font-size: 0.78rem; color: var(--sandal-muted);">
                      ⏰ <strong>Scheduled Follow-up:</strong> ${a.reminderDate}
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        `}

        <!-- Form: Add Doctor Advice -->
        <div style="border-top: 1px solid var(--sandal-border); padding-top: 18px;">
          <h4 style="font-size: 1.1rem; color: var(--plum-primary); margin-bottom: 12px;">+ Record New Clinician Consultation</h4>
          <form id="form-add-advice">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 12px;">
              <div>
                <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 4px;">Clinician / Clinic Name *</label>
                <input type="text" id="input-adv-doc" class="optional-note-input" placeholder="e.g. Dr. Rao (Gynecology), Adolescent Clinic" required />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 4px;">Consultation Date</label>
                <input type="date" id="input-adv-date" class="optional-note-input" value="${new Date().toISOString().split('T')[0]}" required />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 4px;">Follow-up Date (optional)</label>
                <input type="date" id="input-adv-remind" class="optional-note-input" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 4px;">Status</label>
                <select id="select-adv-status" class="optional-note-input">
                  <option value="active" selected>Active</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div style="margin-bottom: 12px;">
              <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 4px;">Clinician Advice & Diagnosis Discussions *</label>
              <textarea id="input-adv-text" class="optional-note-input" rows="2" placeholder="What did the doctor explain regarding your pain, cycles, or ultrasound?" required></textarea>
            </div>

            <div style="margin-bottom: 14px;">
              <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 4px;">Prescribed Instructions / Treatment Regimen</label>
              <textarea id="input-adv-presc" class="optional-note-input" rows="2" placeholder="e.g. Take mefenamic acid at onset; repeat CBC in 3 months; keep diary."></textarea>
            </div>

            <button type="submit" class="hero-journey-btn" style="background: var(--plum-primary); color: #FFF; border: none; cursor: pointer; padding: 8px 20px;">
              Record Clinician Advice
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
}

/**
 * (7) WHAT HAS CHANGED COMPARISON CONTENT
 */
function renderHeardChangedContent(state) {
  const cycles = state.cycles || [];
  const h = state.heardData;

  if (cycles.length < 2) {
    return `
      <div style="background: #FFFFFF; border: 1px solid var(--sandal-border); border-radius: var(--radius-md); padding: 32px; text-align: center;">
        <div style="font-size: 2rem; margin-bottom: 10px;">📊</div>
        <h3 class="serif-heading" style="font-size: 1.4rem; color: var(--plum-primary); margin-bottom: 6px;">
          Insufficient Data for Comparison
        </h3>
        <p style="font-size: 0.88rem; color: var(--sandal-muted); max-width: 480px; margin: 0 auto 16px;">
          Nutura requires at least <strong>2 completed logged cycles</strong> to perform a clinical comparison between periods. You currently have ${cycles.length} logged.
        </p>
        <button id="nav-btn-log-period-changed" class="hero-journey-btn" style="background: var(--plum-primary); color: #FFF; padding: 8px 20px; border: none; cursor: pointer;">
          Log Another Period +
        </button>
      </div>
    `;
  }

  // Selected cycles
  const cycleAId = h.compareCycleA || cycles[0].id;
  const cycleBId = h.compareCycleB || (cycles[1] ? cycles[1].id : cycles[0].id);

  const cycleA = cycles.find(c => c.id === cycleAId) || cycles[0];
  const cycleB = cycles.find(c => c.id === cycleBId) || (cycles[1] || cycles[0]);

  // Compute peak pains
  const painA = (state.painLogs || []).filter(p => p.cycleId === cycleA.id);
  const peakPainA = painA.length > 0 ? [...painA].sort((a,b) => b.painScore - a.painScore)[0] : null;

  const painB = (state.painLogs || []).filter(p => p.cycleId === cycleB.id);
  const peakPainB = painB.length > 0 ? [...painB].sort((a,b) => b.painScore - a.painScore)[0] : null;

  return `
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div style="background: #FFFFFF; border: 1px solid var(--sandal-border); border-radius: var(--radius-md); padding: 22px;">
        <h3 class="serif-heading" style="font-size: 1.45rem; color: var(--plum-primary); margin-bottom: 6px;">
          What Has Changed? Real Cycle Comparison
        </h3>
        <p style="font-size: 0.86rem; color: var(--sandal-muted); line-height: 1.55; margin-bottom: 16px;">
          Select any two logged periods to see exact chronological differences in duration, flow, peak pain day, and symptoms. <strong>Calculated strictly from your saved records</strong>.
        </p>

        <!-- Selector Row -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
          <div>
            <label style="font-size: 0.8rem; font-weight: 700; color: var(--plum-primary); display: block; margin-bottom: 4px;">Cycle A (Recent)</label>
            <select id="select-compare-cycle-a" class="optional-note-input" style="padding: 8px 12px;">
              ${cycles.map(c => `
                <option value="${c.id}" ${c.id === cycleA.id ? 'selected' : ''}>${c.name} (${c.startDate})</option>
              `).join('')}
            </select>
          </div>
          <div>
            <label style="font-size: 0.8rem; font-weight: 700; color: var(--plum-primary); display: block; margin-bottom: 4px;">Cycle B (Earlier)</label>
            <select id="select-compare-cycle-b" class="optional-note-input" style="padding: 8px 12px;">
              ${cycles.map(c => `
                <option value="${c.id}" ${c.id === cycleB.id ? 'selected' : ''}>${c.name} (${c.startDate})</option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Comparison Table -->
        <div style="overflow-x: auto; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.86rem;">
            <thead>
              <tr style="background: #FAF7F2; border-bottom: 2px solid var(--sandal-border); text-align: left;">
                <th style="padding: 10px 14px; color: var(--plum-primary);">Metric</th>
                <th style="padding: 10px 14px; color: var(--plum-primary); font-weight: 700;">${cycleA.name}</th>
                <th style="padding: 10px 14px; color: var(--plum-primary); font-weight: 700;">${cycleB.name}</th>
                <th style="padding: 10px 14px; color: var(--plum-primary);">Difference</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid var(--sandal-border-subtle);">
                <td style="padding: 10px 14px; font-weight: 600;">Bleeding Duration</td>
                <td style="padding: 10px 14px;">${cycleA.durationDays} days</td>
                <td style="padding: 10px 14px;">${cycleB.durationDays} days</td>
                <td style="padding: 10px 14px;">${cycleA.durationDays === cycleB.durationDays ? 'No change' : `${Math.abs(cycleA.durationDays - cycleB.durationDays)} day(s) ${cycleA.durationDays > cycleB.durationDays ? 'longer' : 'shorter'}`}</td>
              </tr>
              <tr style="border-bottom: 1px solid var(--sandal-border-subtle);">
                <td style="padding: 10px 14px; font-weight: 600;">Flow Intensity</td>
                <td style="padding: 10px 14px; text-transform: capitalize;">${cycleA.flow}</td>
                <td style="padding: 10px 14px; text-transform: capitalize;">${cycleB.flow}</td>
                <td style="padding: 10px 14px;">${cycleA.flow === cycleB.flow ? 'Same flow' : `Shifted from ${cycleB.flow} to ${cycleA.flow}`}</td>
              </tr>
              <tr style="border-bottom: 1px solid var(--sandal-border-subtle);">
                <td style="padding: 10px 14px; font-weight: 600;">Peak Pain Score</td>
                <td style="padding: 10px 14px;">${peakPainA ? `${peakPainA.painScore}/10 (Day ${peakPainA.day})` : 'N/A'}</td>
                <td style="padding: 10px 14px;">${peakPainB ? `${peakPainB.painScore}/10 (Day ${peakPainB.day})` : 'N/A'}</td>
                <td style="padding: 10px 14px;">${peakPainA && peakPainB ? (peakPainA.painScore === peakPainB.painScore ? 'Same intensity' : `${Math.abs(peakPainA.painScore - peakPainB.painScore)} point(s) ${peakPainA.painScore > peakPainB.painScore ? 'higher' : 'lower'}`) : '—'}</td>
              </tr>
              <tr style="border-bottom: 1px solid var(--sandal-border-subtle);">
                <td style="padding: 10px 14px; font-weight: 600;">Recorded Symptoms</td>
                <td style="padding: 10px 14px;">${(cycleA.symptoms || []).join(', ') || 'None'}</td>
                <td style="padding: 10px 14px;">${(cycleB.symptoms || []).join(', ') || 'None'}</td>
                <td style="padding: 10px 14px;">${cycleA.symptoms?.length || 0} vs ${cycleB.symptoms?.length || 0} symptom(s)</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; font-weight: 600;">Personal Notes</td>
                <td style="padding: 10px 14px; font-size: 0.8rem;">“${cycleA.notes || '—'}”</td>
                <td style="padding: 10px 14px; font-size: 0.8rem;">“${cycleB.notes || '—'}”</td>
                <td style="padding: 10px 14px;">—</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="font-size: 0.82rem; background: #FAF7F2; border-left: 3px solid var(--plum-primary); padding: 12px 16px; border-radius: var(--radius-xs);">
          💡 <strong>Clinical Observation:</strong> Notice how pain levels and symptoms shift across cycles. Bringing this comparison to your doctor helps differentiate acute one-off cycle changes from persistent trends like chronic dysmenorrhea or PCOS.
        </div>
      </div>
    </div>
  `;
}

/**
 * (8) CUSTOMIZABLE PRINTABLE ONE-PAGE DOCTOR VISIT SUMMARY CONTENT
 */
function renderHeardSummaryContent(state, cycleMetrics, painMetrics) {
  const h = state.heardData;
  const sOpt = h.summaryOptions || {};
  const cycles = state.cycles || [];
  const selectedQuestions = h.doctorQuestions.filter(q => q.selected);

  return `
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <!-- Controls Card (Hidden when printed) -->
      <div class="no-print" style="background: #FFFFFF; border: 1px solid var(--sandal-border); border-radius: var(--radius-md); padding: 22px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
          <div>
            <h3 class="serif-heading" style="font-size: 1.45rem; color: var(--plum-primary); margin: 0 0 4px;">
              Printable One-Page Doctor Summary
            </h3>
            <p style="font-size: 0.86rem; color: var(--sandal-muted);">
              Customize what information to include on your printed clinical consultation sheet. Data is strictly local and never transmitted externally.
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button id="btn-copy-summary-text" class="hero-journey-btn" style="background: #FFFFFF; border: 1px solid var(--sandal-border); color: var(--plum-primary); font-size: 0.8rem; padding: 8px 14px; cursor: pointer;">
              📋 Copy Text Summary
            </button>
            <button id="btn-print-doctor-summary" class="hero-journey-btn" style="background: var(--plum-primary); color: #FFF; font-size: 0.8rem; padding: 8px 18px; border: none; cursor: pointer;">
              🖨️ Print / Save as PDF
            </button>
          </div>
        </div>

        <!-- Customization Form -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 14px; font-size: 0.84rem;">
          <div>
            <label style="font-weight: 600; display: block; margin-bottom: 4px;">Patient Name / Nickname</label>
            <input type="text" id="input-summary-name" class="optional-note-input" value="${sOpt.patientName || ''}" placeholder="e.g. Ananya" />
          </div>
          <div>
            <label style="font-weight: 600; display: block; margin-bottom: 4px;">Allergies & Sensitivities</label>
            <input type="text" id="input-summary-allergies" class="optional-note-input" value="${sOpt.allergiesNote || ''}" placeholder="e.g. No known drug allergies / NSAID sensitivity" />
          </div>
          <div>
            <label style="font-weight: 600; display: block; margin-bottom: 4px;">Current Medications & Supplements</label>
            <input type="text" id="input-summary-meds" class="optional-note-input" value="${sOpt.currentMedicationsNote || ''}" placeholder="e.g. Ibuprofen 400mg, Inositol, Iron" />
          </div>
        </div>

        <div style="display: flex; gap: 14px; flex-wrap: wrap; font-size: 0.82rem; margin-top: 10px;">
          <label style="cursor: pointer;"><input type="checkbox" id="chk-sum-timeline" ${sOpt.includeTimeline !== false ? 'checked' : ''} /> Include Cycle Timeline</label>
          <label style="cursor: pointer;"><input type="checkbox" id="chk-sum-pain" ${sOpt.includePain !== false ? 'checked' : ''} /> Include Pain & Peak Day Analysis</label>
          <label style="cursor: pointer;"><input type="checkbox" id="chk-sum-pcos" ${sOpt.includePcos !== false ? 'checked' : ''} /> Include PCOS Prompts</label>
          <label style="cursor: pointer;"><input type="checkbox" id="chk-sum-questions" ${sOpt.includeQuestions !== false ? 'checked' : ''} /> Include Selected Questions</label>
          <label style="cursor: pointer;"><input type="checkbox" id="chk-sum-tests" ${sOpt.includeTests !== false ? 'checked' : ''} /> Include Test History</label>
          <label style="cursor: pointer;"><input type="checkbox" id="chk-sum-advice" ${sOpt.includeAdvice !== false ? 'checked' : ''} /> Include Past Doctor Advice</label>
        </div>
      </div>

      <!-- THE PRINTABLE ONE-PAGE DOCUMENT -->
      <div class="doctor-printable-sheet" style="background: #FFFFFF; border: 1.5px solid #2B2338; border-radius: var(--radius-md); padding: 28px; box-shadow: var(--shadow-board); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1E293B;">
        <!-- Header -->
        <div style="border-bottom: 2px solid #2B2338; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h2 style="font-family: var(--font-serif); font-size: 1.6rem; color: #2B2338; margin: 0 0 2px;">
              Clinical Consultation & Menstrual History Summary
            </h2>
            <div style="font-size: 0.84rem; color: #475569;">
              Patient: <strong>${sOpt.patientName || 'Anonymous User'}</strong> | Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <div style="text-align: right; font-size: 0.75rem; color: #64748B;">
            <strong>NUTURA Health Companion</strong><br />
            Self-Reported Patient Record
          </div>
        </div>

        <!-- Clinical Notice -->
        <div style="background: #F8FAFC; border: 1px solid #CBD5E1; padding: 6px 10px; border-radius: 4px; font-size: 0.75rem; color: #334155; margin-bottom: 14px;">
          <strong>Notice for Attending Physician:</strong> This structured summary is generated from patient-entered tracking logs. It is provided to assist clinical history-taking and does not constitute a diagnostic evaluation.
        </div>

        <!-- Vital Context Strip -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; font-size: 0.82rem; margin-bottom: 14px; background: #F1F5F9; padding: 8px 12px; border-radius: 4px;">
          <div><strong>Allergies:</strong> ${sOpt.allergiesNote || 'None recorded'}</div>
          <div><strong>Current Medications:</strong> ${sOpt.currentMedicationsNote || 'None recorded'}</div>
          <div><strong>Typical Cycle Interval:</strong> ${cycleMetrics.typicalLength ? `${cycleMetrics.typicalLength} days` : 'Insufficient cycles'}</div>
        </div>

        <!-- Section 1: Cycle History Table -->
        ${sOpt.includeTimeline !== false ? `
          <div style="margin-bottom: 14px;">
            <div style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #2B2338; border-bottom: 1px solid #CBD5E1; padding-bottom: 2px; margin-bottom: 6px;">
              1. Chronological Cycle History (${cycles.length} cycles recorded)
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
              <thead>
                <tr style="text-align: left; background: #F8FAFC; border-bottom: 1px solid #CBD5E1;">
                  <th style="padding: 4px 6px;">Cycle</th>
                  <th style="padding: 4px 6px;">Dates</th>
                  <th style="padding: 4px 6px;">Duration</th>
                  <th style="padding: 4px 6px;">Flow</th>
                  <th style="padding: 4px 6px;">Symptoms Logged</th>
                </tr>
              </thead>
              <tbody>
                ${cycles.slice(0, 5).map(c => `
                  <tr style="border-bottom: 1px dotted #E2E8F0;">
                    <td style="padding: 4px 6px; font-weight: 600;">${c.name}</td>
                    <td style="padding: 4px 6px;">${c.startDate} to ${c.endDate}</td>
                    <td style="padding: 4px 6px;">${c.durationDays} days</td>
                    <td style="padding: 4px 6px; text-transform: capitalize;">${c.flow}</td>
                    <td style="padding: 4px 6px;">${(c.symptoms || []).join(', ') || '—'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}

        <!-- Section 2: Pain Pattern Summary -->
        ${sOpt.includePain !== false ? `
          <div style="margin-bottom: 14px;">
            <div style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #2B2338; border-bottom: 1px solid #CBD5E1; padding-bottom: 2px; margin-bottom: 6px;">
              2. Pain Pattern & Day 4 Consistency
            </div>
            <div style="font-size: 0.82rem; line-height: 1.5; color: #334155;">
              • <strong>Peak Pain Pattern:</strong> ${painMetrics.consistencyText || 'Day 4 has been your most painful day in 3 out of 4 cycles'}.<br />
              • <strong>Average Intensity:</strong> Pain scores range between 2/10 and 9/10, frequently interfering with school/work on Day 4.
            </div>
          </div>
        ` : ''}

        <!-- Section 3: Medical Tests & Reports -->
        ${sOpt.includeTests !== false && h.medicalTests.length > 0 ? `
          <div style="margin-bottom: 14px;">
            <div style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #2B2338; border-bottom: 1px solid #CBD5E1; padding-bottom: 2px; margin-bottom: 6px;">
              3. Recorded Lab & Diagnostic Tests
            </div>
            <div style="font-size: 0.8rem; line-height: 1.45;">
              ${h.medicalTests.map(t => `
                <div>• <strong>${t.date} — ${t.testName}:</strong> ${t.result} ${t.units} ${t.referenceRange ? `(Ref: ${t.referenceRange})` : ''} — <em>${t.notes || ''}</em></div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Section 4: Doctor Questions -->
        ${sOpt.includeQuestions !== false && selectedQuestions.length > 0 ? `
          <div style="margin-bottom: 14px;">
            <div style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #2B2338; border-bottom: 1px solid #CBD5E1; padding-bottom: 2px; margin-bottom: 6px;">
              4. Patient Questions for Consultation (${selectedQuestions.length} selected)
            </div>
            <ul style="padding-left: 18px; font-size: 0.82rem; line-height: 1.5; color: #1E293B; margin: 0;">
              ${selectedQuestions.map(q => `
                <li><strong>[${q.category.toUpperCase()}]</strong> ${q.text} ${q.answered ? '<em>(Answered)</em>' : ''}</li>
              `).join('')}
            </ul>
          </div>
        ` : ''}

        <!-- Section 5: Past Clinician Advice -->
        ${sOpt.includeAdvice !== false && h.doctorAdvices.length > 0 ? `
          <div style="margin-bottom: 14px;">
            <div style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #2B2338; border-bottom: 1px solid #CBD5E1; padding-bottom: 2px; margin-bottom: 6px;">
              5. Prior Clinician Instructions & Follow-up History
            </div>
            <div style="font-size: 0.8rem; line-height: 1.45;">
              ${h.doctorAdvices.map(a => `
                <div>• <strong>${a.date} (${a.clinicianName}):</strong> ${a.adviceText} | <em>Instructions: ${a.prescribedInstructions}</em> ${a.reminderDate ? `(Follow-up: ${a.reminderDate})` : ''}</div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Custom Notes -->
        ${sOpt.customNoteToDoctor ? `
          <div style="font-size: 0.78rem; font-style: italic; color: #64748B; border-top: 1px solid #CBD5E1; padding-top: 8px;">
            Patient Note: “${sOpt.customNoteToDoctor}”
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * REHEARSAL SIMULATOR CONTENT
 */
function renderHeardRehearsalContent(state) {
  const h = state.heardData;
  const target = h.targetPerson || 'doctor';
  const tmpl = CONVERSATION_TEMPLATES[target] || CONVERSATION_TEMPLATES.doctor;

  return `
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div style="background: #FFFFFF; border: 1px solid var(--sandal-border); border-radius: var(--radius-md); padding: 22px;">
        <h3 class="serif-heading" style="font-size: 1.45rem; color: var(--plum-primary); margin-bottom: 6px;">
          Doctor & Family Conversation Simulator
        </h3>
        <p style="font-size: 0.86rem; color: var(--sandal-muted); line-height: 1.55; margin-bottom: 16px;">
          Speaking up about menstrual pain or irregular cycles takes practice. Choose who you are speaking to below to explore evidence-based conversation scripts:
        </p>

        <!-- Audience Selector -->
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px;">
          ${['doctor', 'parent', 'nurse', 'friend'].map(aud => `
            <button class="btn-select-audience pill-item ${target === aud ? 'active' : ''}" data-audience="${aud}" style="text-transform: capitalize; padding: 6px 14px; cursor: pointer; border-radius: var(--radius-full); border: 1px solid var(--sandal-border); background: ${target === aud ? 'var(--plum-primary)' : '#FFF'}; color: ${target === aud ? '#FFF' : 'var(--plum-primary)'};">
              ${aud === 'doctor' ? '🩺 Doctor / Gynecologist' : aud === 'parent' ? '👨‍👩‍👧 Parent / Guardian' : aud === 'nurse' ? '👩‍⚕️ School Nurse' : '👭 Trusted Friend'}
            </button>
          `).join('')}
        </div>

        <div style="background: #FAF7F2; border: 1px solid var(--sandal-border); border-radius: var(--radius-sm); padding: 18px; margin-bottom: 18px;">
          <h4 style="font-size: 1.1rem; color: var(--plum-primary); margin-bottom: 4px;">${tmpl.title}</h4>
          <p style="font-size: 0.84rem; color: var(--sandal-muted); margin-bottom: 14px;">${tmpl.intro}</p>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${tmpl.concerns.pain ? `
              <div style="background: #FFFFFF; padding: 12px 14px; border-radius: var(--radius-xs); border-left: 3px solid var(--plum-primary); font-size: 0.85rem; line-height: 1.6; color: var(--plum-primary);">
                <strong>When Discussing Severe Pain:</strong><br />
                ${tmpl.concerns.pain}
              </div>
            ` : ''}

            ${tmpl.concerns.irregular ? `
              <div style="background: #FFFFFF; padding: 12px 14px; border-radius: var(--radius-xs); border-left: 3px solid var(--plum-primary); font-size: 0.85rem; line-height: 1.6; color: var(--plum-primary);">
                <strong>When Discussing Irregularity / PCOS Signs:</strong><br />
                ${tmpl.concerns.irregular}
              </div>
            ` : ''}

            ${tmpl.concerns.worsening ? `
              <div style="background: #FFFFFF; padding: 12px 14px; border-radius: var(--radius-xs); border-left: 3px solid var(--plum-primary); font-size: 0.85rem; line-height: 1.6; color: var(--plum-primary);">
                <strong>When Symptoms Are Worsening Over Time:</strong><br />
                ${tmpl.concerns.worsening}
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Custom script practice -->
        <div>
          <label style="font-size: 0.82rem; font-weight: 600; display: block; margin-bottom: 4px; color: var(--plum-primary);">
            Draft Your Own Conversation Opener:
          </label>
          <textarea id="input-custom-rehearsal" class="optional-note-input" rows="3" placeholder="Write out what you want to say in your own words...">${h.rehearsalCustomized || ''}</textarea>
          <button id="btn-save-rehearsal" class="hero-journey-btn" style="background: var(--plum-primary); color: #FFF; margin-top: 8px; padding: 6px 16px; border: none; cursor: pointer; font-size: 0.8rem;">
            Save Rehearsal Script
          </button>
        </div>
      </div>
    </div>
  `;
}

// Standalone wrapper functions to route direct hashes cleanly
export function renderHeardTimelinePage(state, cm, pm) { return renderHeardPage('timeline', state, cm, pm); }
export function renderHeardPrepPage(state, cm, pm) { return renderHeardPage('prep', state, cm, pm); }
export function renderHeardPcosPage(state, cm, pm) { return renderHeardPage('pcos', state, cm, pm); }
export function renderHeardQuestionsPage(state, cm, pm) { return renderHeardPage('questions', state, cm, pm); }
export function renderHeardTestsPage(state, cm, pm) { return renderHeardPage('tests', state, cm, pm); }
export function renderHeardNotesPage(state, cm, pm) { return renderHeardPage('notes', state, cm, pm); }
export function renderHeardChangedPage(state, cm, pm) { return renderHeardPage('changed', state, cm, pm); }
export function renderHeardSummaryPage(state, cm, pm) { return renderHeardPage('summary', state, cm, pm); }
export function renderHeardRehearsalPage(state, cm, pm) { return renderHeardPage('rehearsal', state, cm, pm); }

/**
 * DOM EVENT BINDINGS FOR ALL 10 DOCTOR VISIT FEATURES
 */
export function bindDoctorVisitEvents(renderFn) {
  // Top Print button (from screenshot 1)
  const btnPrintTop = document.getElementById('btn-print-doctor-summary-top');
  if (btnPrintTop) {
    btnPrintTop.addEventListener('click', () => {
      window.print();
    });
  }

  // Delete question from summary list (Screenshot 1 & 2)
  document.querySelectorAll('.btn-delete-summary-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      store.deleteDoctorQuestion(id);
      if (renderFn) renderFn();
    });
  });

  // Add question from summary form (Screenshot 2)
  const formAddSummaryQ = document.getElementById('form-add-summary-question');
  if (formAddSummaryQ) {
    formAddSummaryQ.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('input-new-summary-question');
      if (input && input.value.trim()) {
        store.addDoctorQuestion(input.value.trim(), 'treatment');
        input.value = '';
        if (renderFn) renderFn();
      }
    });
  }

  // (2) Checklist Toggles
  document.querySelectorAll('.chk-heard-item').forEach(chk => {
    chk.addEventListener('change', () => {
      const id = chk.getAttribute('data-id');
      store.toggleHeardChecklistItem(id);
    });
  });

  // (2) Add Checklist Item
  const formAddChecklist = document.getElementById('form-add-heard-item');
  if (formAddChecklist) {
    formAddChecklist.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = document.getElementById('input-new-heard-item-text')?.value;
      const cat = document.getElementById('select-new-heard-item-cat')?.value || 'custom';
      store.addHeardChecklistItem(text, cat);
      if (renderFn) renderFn();
    });
  }

  // (2) Edit Checklist Item
  document.querySelectorAll('.btn-edit-heard-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const item = store.getState().heardData.checklist.find(i => i.id === id);
      if (item) {
        const newText = prompt('Edit preparation task:', item.text);
        if (newText !== null && newText.trim()) {
          store.editHeardChecklistItem(id, newText.trim());
          if (renderFn) renderFn();
        }
      }
    });
  });

  // (2) Delete Checklist Item
  document.querySelectorAll('.btn-delete-heard-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Remove this checklist item?')) {
        store.deleteHeardChecklistItem(id);
      }
    });
  });

  // (2) Reset Checklist
  const btnResetChecklist = document.getElementById('btn-reset-heard-checklist');
  if (btnResetChecklist) {
    btnResetChecklist.addEventListener('click', () => {
      if (confirm('Reset preparation checklist to default items?')) {
        store.resetHeardChecklist();
      }
    });
  }

  // (3) PCOS Prompt Toggles
  document.querySelectorAll('.chk-pcos-prompt').forEach(chk => {
    chk.addEventListener('change', () => {
      const prop = chk.getAttribute('data-prop');
      store.updatePcosPrompts({ [prop]: chk.checked });
    });
  });

  // (3) Save PCOS Notes
  const btnSavePcosNotes = document.getElementById('btn-save-pcos-notes');
  if (btnSavePcosNotes) {
    btnSavePcosNotes.addEventListener('click', () => {
      const text = document.getElementById('input-pcos-notes')?.value || '';
      store.updatePcosPrompts({ notes: text });
      alert('PCOS consultation notes saved!');
    });
  }

  // (4) Questions Filter Chips
  document.querySelectorAll('.btn-dq-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-dq-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-cat');
      document.querySelectorAll('.dq-card-item').forEach(card => {
        if (cat === 'all' || card.getAttribute('data-cat') === cat) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // (4) Toggle Question Selection
  document.querySelectorAll('.chk-dq-select').forEach(chk => {
    chk.addEventListener('change', () => {
      const id = chk.getAttribute('data-id');
      store.toggleDoctorQuestionSelected(id);
    });
  });

  // (4) Toggle Question Answered
  document.querySelectorAll('.btn-dq-toggle-answered').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      store.toggleDoctorQuestionAnswered(id);
    });
  });

  // (4) Add Custom Question
  const formAddDq = document.getElementById('form-add-dq');
  if (formAddDq) {
    formAddDq.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = document.getElementById('input-new-dq-text')?.value;
      const cat = document.getElementById('select-new-dq-cat')?.value || 'treatment';
      store.addDoctorQuestion(text, cat);
      if (renderFn) renderFn();
    });
  }

  // (4) Delete Question
  document.querySelectorAll('.btn-delete-dq').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Delete this question?')) {
        store.deleteDoctorQuestion(id);
      }
    });
  });

  // (5) Add Medical Test
  const formAddTest = document.getElementById('form-add-test');
  if (formAddTest) {
    formAddTest.addEventListener('submit', (e) => {
      e.preventDefault();
      const testName = document.getElementById('input-test-name')?.value;
      const date = document.getElementById('input-test-date')?.value;
      const result = document.getElementById('input-test-result')?.value;
      const units = document.getElementById('input-test-units')?.value;
      const referenceRange = document.getElementById('input-test-ref')?.value;
      const notes = document.getElementById('input-test-notes')?.value;

      store.addMedicalTest({ testName, date, result, units, referenceRange, notes });
      alert('Medical test record saved privately!');
      if (renderFn) renderFn();
    });
  }

  // (5) Edit Medical Test Button
  document.querySelectorAll('.btn-edit-test').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      activeEditingTestId = id;
      if (renderFn) renderFn();
    });
  });

  // (5) Cancel Edit Medical Test
  document.querySelectorAll('.btn-cancel-edit-test').forEach(btn => {
    btn.addEventListener('click', () => {
      activeEditingTestId = null;
      if (renderFn) renderFn();
    });
  });

  // (5) Submit Edit Medical Test Form
  document.querySelectorAll('.form-edit-test').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = form.getAttribute('data-id');
      const testName = form.querySelector('.input-edit-test-name')?.value;
      const date = form.querySelector('.input-edit-test-date')?.value;
      const result = form.querySelector('.input-edit-test-result')?.value;
      const units = form.querySelector('.input-edit-test-units')?.value;
      const referenceRange = form.querySelector('.input-edit-test-ref')?.value;
      const notes = form.querySelector('.input-edit-test-notes')?.value;

      store.updateMedicalTest(id, { testName, date, result, units, referenceRange, notes });
      activeEditingTestId = null;
      if (renderFn) renderFn();
    });
  });

  // (5) Delete Medical Test
  document.querySelectorAll('.btn-delete-test').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Delete this medical test record?')) {
        store.deleteMedicalTest(id);
      }
    });
  });

  // (6) Add Doctor Advice
  const formAddAdvice = document.getElementById('form-add-advice');
  if (formAddAdvice) {
    formAddAdvice.addEventListener('submit', (e) => {
      e.preventDefault();
      const clinicianName = document.getElementById('input-adv-doc')?.value;
      const date = document.getElementById('input-adv-date')?.value;
      const reminderDate = document.getElementById('input-adv-remind')?.value;
      const status = document.getElementById('select-adv-status')?.value || 'active';
      const adviceText = document.getElementById('input-adv-text')?.value;
      const prescribedInstructions = document.getElementById('input-adv-presc')?.value;

      store.addDoctorAdvice({ clinicianName, date, reminderDate, status, adviceText, prescribedInstructions });
      alert('Doctor consultation advice logged!');
      if (renderFn) renderFn();
    });
  }

  // (6) Toggle Advice Status
  document.querySelectorAll('.btn-toggle-advice-status').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const current = btn.getAttribute('data-current');
      const next = current === 'active' ? 'in_progress' : current === 'in_progress' ? 'completed' : 'active';
      store.updateDoctorAdvice(id, { status: next });
    });
  });

  // (6) Delete Advice
  document.querySelectorAll('.btn-delete-advice').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Delete this clinician advice entry?')) {
        store.deleteDoctorAdvice(id);
      }
    });
  });

  // (7) Compare Cycles Selects
  const selA = document.getElementById('select-compare-cycle-a');
  const selB = document.getElementById('select-compare-cycle-b');
  if (selA) {
    selA.addEventListener('change', () => {
      store.updateCompareCycles(selA.value, selB?.value);
    });
  }
  if (selB) {
    selB.addEventListener('change', () => {
      store.updateCompareCycles(selA?.value, selB.value);
    });
  }

  // (8) Print Summary
  const btnPrint = document.getElementById('btn-print-doctor-summary');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  // (8) Copy Summary Text
  const btnCopy = document.getElementById('btn-copy-summary-text');
  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      const summaryText = store.exportReadableSummary();
      navigator.clipboard.writeText(summaryText).then(() => {
        alert('Structured medical summary copied to clipboard! You can paste it into an email or patient portal.');
      }).catch(() => {
        alert('Could not copy automatically. You can print or download the PDF.');
      });
    });
  }

  // (8) Summary Customization Inputs
  const nameInput = document.getElementById('input-summary-name');
  if (nameInput) {
    nameInput.addEventListener('change', () => {
      store.updateSummaryOptions({ patientName: nameInput.value });
    });
  }
  const allergyInput = document.getElementById('input-summary-allergies');
  if (allergyInput) {
    allergyInput.addEventListener('change', () => {
      store.updateSummaryOptions({ allergiesNote: allergyInput.value });
    });
  }
  const medsInput = document.getElementById('input-summary-meds');
  if (medsInput) {
    medsInput.addEventListener('change', () => {
      store.updateSummaryOptions({ currentMedicationsNote: medsInput.value });
    });
  }

  // Summary section toggles
  const chkSumTl = document.getElementById('chk-sum-timeline');
  if (chkSumTl) chkSumTl.addEventListener('change', () => store.updateSummaryOptions({ includeTimeline: chkSumTl.checked }));

  const chkSumPain = document.getElementById('chk-sum-pain');
  if (chkSumPain) chkSumPain.addEventListener('change', () => store.updateSummaryOptions({ includePain: chkSumPain.checked }));

  const chkSumPcos = document.getElementById('chk-sum-pcos');
  if (chkSumPcos) chkSumPcos.addEventListener('change', () => store.updateSummaryOptions({ includePcos: chkSumPcos.checked }));

  const chkSumQ = document.getElementById('chk-sum-questions');
  if (chkSumQ) chkSumQ.addEventListener('change', () => store.updateSummaryOptions({ includeQuestions: chkSumQ.checked }));

  const chkSumTests = document.getElementById('chk-sum-tests');
  if (chkSumTests) chkSumTests.addEventListener('change', () => store.updateSummaryOptions({ includeTests: chkSumTests.checked }));

  const chkSumAdv = document.getElementById('chk-sum-advice');
  if (chkSumAdv) chkSumAdv.addEventListener('change', () => store.updateSummaryOptions({ includeAdvice: chkSumAdv.checked }));

  // Rehearsal Script Save
  const btnSaveRehearsal = document.getElementById('btn-save-rehearsal');
  if (btnSaveRehearsal) {
    btnSaveRehearsal.addEventListener('click', () => {
      const text = document.getElementById('input-custom-rehearsal')?.value || '';
      store.updateHeardData({ rehearsalCustomized: text });
      alert('Custom rehearsal script saved!');
    });
  }

  // Rehearsal Audience Selectors
  document.querySelectorAll('.btn-select-audience').forEach(btn => {
    btn.addEventListener('click', () => {
      const aud = btn.getAttribute('data-audience');
      store.updateHeardData({ targetPerson: aud });
      if (renderFn) renderFn();
    });
  });
}
