/**
 * Automated Verification Tests for MOONLIT / Mimi Doctor Visit Features
 * Tests all 10 core clinical preparation & self-advocacy requirements.
 */

// Mock in-memory localStorage for Node test runner
const storageMap = new Map();
globalThis.localStorage = {
  getItem: (key) => storageMap.get(key) || null,
  setItem: (key, val) => storageMap.set(key, String(val)),
  removeItem: (key) => storageMap.delete(key),
  clear: () => storageMap.clear()
};

import { store, DEFAULT_HEARD_CHECKLIST, DEFAULT_DOCTOR_QUESTIONS_CATEGORIZED } from '../src/data/store.js';
import { calculateCycleMetrics, analyzePainPatterns } from '../src/logic/cycleCalculator.js';
import { renderHeardSafetyBanner, renderHeardSubnav, renderHeardPage } from '../src/doctorVisit.js';

function runDoctorVisitTests() {
  console.log('🩺 Starting Doctor Visit Feature Verification Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  const initialState = store.getState();

  // -------------------------------------------------------------------------
  // Feature 1: Personal Health Timeline (Using Actual Records Only)
  // -------------------------------------------------------------------------
  console.log('\n--- 1. Personal Health Timeline ---');
  assert(Array.isArray(initialState.cycles) && initialState.cycles.length > 0, 'Real cycles array loaded from store');
  assert(initialState.cycles.every(c => c.startDate && c.durationDays), 'All recorded cycles contain real dates & durations');
  
  const cycleMetrics = calculateCycleMetrics(initialState.cycles);
  const painMetrics = analyzePainPatterns(initialState.cycles, initialState.painLogs);
  assert(cycleMetrics.hasData === true, 'Cycle metrics computed from real records');
  assert(painMetrics.hasData === true, 'Pain patterns computed from real records');
  assert(painMetrics.topDay === 4, 'Correctly identifies Day 4 as peak pain day');

  // -------------------------------------------------------------------------
  // Feature 2: Appointment Preparation Checklist
  // -------------------------------------------------------------------------
  console.log('\n--- 2. Appointment Preparation Checklist ---');
  const checklist = store.getState().heardData.checklist;
  assert(checklist.length >= 6, `Checklist contains baseline items (got ${checklist.length})`);
  
  const expectedCategories = ['concerns', 'symptom_onset', 'medications', 'allergies', 'reports', 'questions'];
  expectedCategories.forEach(cat => {
    assert(checklist.some(i => i.category === cat), `Checklist includes category: ${cat}`);
  });

  // Toggle item
  const testItem = checklist[0];
  const prevCompleted = testItem.completed;
  store.toggleHeardChecklistItem(testItem.id);
  assert(store.getState().heardData.checklist.find(i => i.id === testItem.id).completed === !prevCompleted, 'toggleHeardChecklistItem toggled completion status');
  store.toggleHeardChecklistItem(testItem.id); // restore

  // Add custom item
  const customId = store.addHeardChecklistItem('Bring my wearable temperature log', 'custom');
  const afterAdd = store.getState().heardData.checklist.find(i => i.id === customId);
  assert(afterAdd && afterAdd.text === 'Bring my wearable temperature log' && afterAdd.custom === true, 'addHeardChecklistItem successfully added custom item');

  // Edit custom item
  store.editHeardChecklistItem(customId, 'Bring my wearable temperature log and symptom diary');
  const afterEdit = store.getState().heardData.checklist.find(i => i.id === customId);
  assert(afterEdit && afterEdit.text === 'Bring my wearable temperature log and symptom diary', 'editHeardChecklistItem updated item text');

  // Delete item
  store.deleteHeardChecklistItem(customId);
  assert(!store.getState().heardData.checklist.some(i => i.id === customId), 'deleteHeardChecklistItem removed custom item');

  // Reset checklist
  store.resetHeardChecklist();
  assert(store.getState().heardData.checklist.length === DEFAULT_HEARD_CHECKLIST.length, 'resetHeardChecklist restored default items');

  // -------------------------------------------------------------------------
  // Feature 3: PCOS/PCOD Consultation Guide
  // -------------------------------------------------------------------------
  console.log('\n--- 3. PCOS/PCOD Consultation Guide ---');
  const pcos = store.getState().heardData.pcosPrompts;
  assert(pcos !== undefined, 'PCOS prompt state exists in heardData');
  assert('irregularCycles' in pcos && 'acneBreakouts' in pcos && 'ultrasoundDiscuss' in pcos, 'PCOS prompts cover Rotterdam clinical criteria prompts');

  store.updatePcosPrompts({ notes: 'Doctor mentioned testing LH:FSH ratio on Day 3' });
  assert(store.getState().heardData.pcosPrompts.notes.includes('LH:FSH ratio'), 'updatePcosPrompts persisted consultation notes');

  // -------------------------------------------------------------------------
  // Feature 4: Questions to Ask the Doctor
  // -------------------------------------------------------------------------
  console.log('\n--- 4. Questions to Ask the Doctor ---');
  const questions = store.getState().heardData.doctorQuestions;
  const questionCategories = ['cycles', 'pain', 'pcos', 'tests', 'treatment', 'followup'];
  questionCategories.forEach(cat => {
    assert(questions.some(q => q.category === cat), `Doctor questions organized by category: ${cat}`);
  });

  // Toggle selection
  const qTest = questions[0];
  const prevSel = qTest.selected;
  store.toggleDoctorQuestionSelected(qTest.id);
  assert(store.getState().heardData.doctorQuestions.find(q => q.id === qTest.id).selected === !prevSel, 'toggleDoctorQuestionSelected toggles selection');
  store.toggleDoctorQuestionSelected(qTest.id); // restore

  // Toggle answered
  store.toggleDoctorQuestionAnswered(qTest.id);
  assert(store.getState().heardData.doctorQuestions.find(q => q.id === qTest.id).answered === true, 'toggleDoctorQuestionAnswered marks question as answered');
  store.toggleDoctorQuestionAnswered(qTest.id); // restore

  // Add custom question
  const newQId = store.addDoctorQuestion('Could my pain be related to pelvic floor tension?', 'pain');
  assert(store.getState().heardData.doctorQuestions.some(q => q.id === newQId && q.custom === true), 'addDoctorQuestion successfully added categorized question');

  // Delete custom question
  store.deleteDoctorQuestion(newQId);
  assert(!store.getState().heardData.doctorQuestions.some(q => q.id === newQId), 'deleteDoctorQuestion removed question');

  // -------------------------------------------------------------------------
  // Feature 5: Medical Test & Report History
  // -------------------------------------------------------------------------
  console.log('\n--- 5. Medical Test and Report History ---');
  const initialTests = store.getState().heardData.medicalTests;
  assert(Array.isArray(initialTests) && initialTests.length > 0, 'Medical tests array populated');
  assert(initialTests[0].testName && initialTests[0].result && initialTests[0].units, 'Test reports contain name, result, units, and ranges');

  // Add new test
  const newTestId = store.addMedicalTest({
    testName: 'Total Testosterone',
    date: '2025-04-10',
    result: '42',
    units: 'ng/dL',
    referenceRange: '15 – 70 ng/dL',
    clinicianNotes: 'Normal range, recheck in 6 months if symptoms persist.'
  });
  const savedTest = store.getState().heardData.medicalTests.find(t => t.id === newTestId);
  assert(savedTest && savedTest.testName === 'Total Testosterone', 'addMedicalTest added new lab report');

  // Edit test
  store.updateMedicalTest(newTestId, {
    result: '46',
    notes: 'Re-evaluated with endocrinologist: normal ovulatory baseline.'
  });
  const updatedTest = store.getState().heardData.medicalTests.find(t => t.id === newTestId);
  assert(updatedTest && updatedTest.result === '46' && updatedTest.notes.includes('Re-evaluated'), 'updateMedicalTest successfully updated result and clinician notes');

  // Delete test
  store.deleteMedicalTest(newTestId);
  assert(!store.getState().heardData.medicalTests.some(t => t.id === newTestId), 'deleteMedicalTest removed lab report');

  // -------------------------------------------------------------------------
  // Feature 6: Doctor's Advice and Follow-up Tracker
  // -------------------------------------------------------------------------
  console.log('\n--- 6. Doctor Advice and Follow-up Tracker ---');
  const initialAdvices = store.getState().heardData.doctorAdvices;
  assert(Array.isArray(initialAdvices) && initialAdvices.length > 0, 'Doctor advices array populated');
  assert(initialAdvices[0].clinicianName && initialAdvices[0].prescribedInstructions, 'Advice tracks clinician instructions & status');

  // Add advice
  const newAdviceId = store.addDoctorAdvice({
    clinicianName: 'Dr. Meera Sharma (Endocrinologist)',
    visitDate: '2025-05-15',
    adviceNotes: 'Ordered ultrasound for Day 5 of next cycle',
    prescribedInstructions: 'Take iron supplement with vitamin C, avoid taking with calcium or tea',
    followUpDate: '2025-06-15',
    reminderEnabled: true,
    status: 'active'
  });
  assert(store.getState().heardData.doctorAdvices.some(a => a.id === newAdviceId), 'addDoctorAdvice added record');

  // Update advice status
  store.updateDoctorAdvice(newAdviceId, { status: 'completed' });
  assert(store.getState().heardData.doctorAdvices.find(a => a.id === newAdviceId).status === 'completed', 'updateDoctorAdvice updated status to completed');

  // Delete advice
  store.deleteDoctorAdvice(newAdviceId);
  assert(!store.getState().heardData.doctorAdvices.some(a => a.id === newAdviceId), 'deleteDoctorAdvice removed record');

  // -------------------------------------------------------------------------
  // Feature 7: What Has Changed Comparison
  // -------------------------------------------------------------------------
  console.log('\n--- 7. What Has Changed Comparison ---');
  store.updateCompareCycles('cycle-4', 'cycle-2');
  const hState = store.getState().heardData;
  assert(hState.compareCycleA === 'cycle-4' && hState.compareCycleB === 'cycle-2', 'updateCompareCycles updated selected cycles');

  // -------------------------------------------------------------------------
  // Feature 8: Customizable Printable Summary
  // -------------------------------------------------------------------------
  console.log('\n--- 8. Printable Doctor Visit Summary ---');
  store.updateSummaryOptions({ patientName: 'Ananya Sharma', includePain: true });
  assert(store.getState().heardData.summaryOptions.patientName === 'Ananya Sharma', 'updateSummaryOptions updated patient name');

  const summaryText = store.exportReadableSummary();
  assert(summaryText.includes('MOONLIT / Mimi Menstrual Health Summary'), 'exportReadableSummary produces medical header');
  assert(summaryText.includes('Ananya Sharma'), 'Summary includes customized patient name');
  assert(summaryText.includes('Serum Ferritin'), 'Summary includes real lab tests');
  assert(summaryText.includes('DOCTOR QUESTIONS SELECTED'), 'Summary includes selected doctor questions');

  // -------------------------------------------------------------------------
  // Feature 9: Redesigned 3-Box Stacked Main Page & Dedicated Detail Views
  // -------------------------------------------------------------------------
  console.log('\n--- 9. Redesigned 3-Box Layout & Dedicated Detail Views ---');
  
  // (a) Main Page (Original dark lavender header + 3 stacked boxes)
  const mainHtml = renderHeardPage('overview', store.getState(), cycleMetrics, painMetrics);
  assert(mainHtml.includes('card-bg-plum'), 'Main page preserves original dark lavender background (card-bg-plum)');
  assert(mainHtml.includes('standalone-hero-banner'), 'Main page renders original standalone-hero-banner');
  assert(mainHtml.includes('‹ 03 Doctor Visit Hub'), 'Main page preserves original header crumb');
  assert(mainHtml.includes('Am I Being Heard?'), 'Main page renders clear Serif title');
  assert(mainHtml.includes('Better conversations, brighter care'), 'Main page preserves original subtitle');
  assert(mainHtml.includes('action-rows-list doctor-visit-boxes'), 'Main page renders stacked action rows list container');
  assert(mainHtml.includes('box-when-to-visit'), 'Main page renders Box 1: When Should I Schedule a Doctor Visit?');
  assert(mainHtml.includes('box-doctor-questions'), 'Main page renders Box 2: Questions You Wish to Ask Your Doctor');
  assert(mainHtml.includes('box-doctor-summary'), 'Main page renders Box 3: Menstrual Health & Symptoms History Summary');
  assert(mainHtml.includes('href="#/heard-schedule"'), 'Box 1 links to dedicated schedule detail view');
  assert(mainHtml.includes('href="#/heard-questions"'), 'Box 2 links to dedicated questions detail view');
  assert(mainHtml.includes('href="#/heard-summary"'), 'Box 3 links to dedicated summary detail view');
  assert(mainHtml.includes('You\'re not alone ♡'), 'Main page includes handwritten annotation');

  // Verify exactly three boxes appear
  const boxMatches = (mainHtml.match(/class="action-row-item doctor-box-item"/g) || []).length;
  assert(boxMatches === 3, `Main page contains exactly three horizontal boxes stacked vertically (got ${boxMatches})`);

  // Verify removed sections are NOT on the main page
  assert(!mainHtml.includes('Health Timeline'), 'Removed topic NOT on main page: Health Timeline');
  assert(!mainHtml.includes('Visit Checklist & 1st-Time'), 'Removed topic NOT on main page: Visit Checklist & 1st-Time');
  assert(!mainHtml.includes('PCOS Guide'), 'Removed topic NOT on main page: PCOS Guide');
  assert(!mainHtml.includes('Test History'), 'Removed topic NOT on main page: Test History');
  assert(!mainHtml.includes('Advice Tracker'), 'Removed topic NOT on main page: Advice Tracker');
  assert(!mainHtml.includes('What Has Changed'), 'Removed topic NOT on main page: What Has Changed');
  assert(!mainHtml.includes('Conversation Simulator'), 'Removed topic NOT on main page: Conversation Simulator');

  // (b) Dedicated Detail View 1: When Should I Schedule a Doctor Visit?
  const scheduleHtml = renderHeardPage('schedule', store.getState(), cycleMetrics, painMetrics);
  assert(scheduleHtml.includes('‹ Back to Doctor Visit'), 'Detail view 1 includes back button to main page');
  assert(scheduleHtml.includes('When Should I Schedule a Doctor Visit?'), 'Detail view 1 includes clear title');
  assert(scheduleHtml.includes('Cycle Irregularity'), 'Detail view 1 preserves Cycle Irregularity guidance');
  assert(scheduleHtml.includes('Absent Periods'), 'Detail view 1 preserves Absent Periods guidance');
  assert(scheduleHtml.includes('Severe Dysmenorrhea'), 'Detail view 1 preserves Severe Dysmenorrhea guidance');
  assert(scheduleHtml.includes('Heavy Bleeding'), 'Detail view 1 preserves Heavy Bleeding guidance');
  assert(scheduleHtml.includes('PCOS Symptoms'), 'Detail view 1 preserves PCOS Symptoms guidance');

  // (c) Dedicated Detail View 2: Questions You Wish to Ask Your Doctor
  const questionsHtml = renderHeardPage('questions', store.getState(), cycleMetrics, painMetrics);
  assert(questionsHtml.includes('‹ Back to Doctor Visit'), 'Detail view 2 includes back button to main page');
  assert(questionsHtml.includes('Questions You Wish to Ask Your Doctor'), 'Detail view 2 includes clear title');
  assert(questionsHtml.includes('form-add-summary-question'), 'Detail view 2 preserves add question form');
  assert(questionsHtml.includes('dq-category-filters'), 'Detail view 2 preserves category filter chips');

  // (d) Dedicated Detail View 3: Menstrual Health & Symptoms History Summary
  const summaryDetailHtml = renderHeardPage('summary', store.getState(), cycleMetrics, painMetrics);
  assert(summaryDetailHtml.includes('‹ Back to Doctor Visit'), 'Detail view 3 includes back button to main page');
  assert(summaryDetailHtml.includes('Menstrual Health & Symptoms History Summary'), 'Detail view 3 includes clear title');
  assert(summaryDetailHtml.includes('btn-print-doctor-summary-top'), 'Detail view 3 preserves Print / Save as PDF button');
  assert(summaryDetailHtml.includes('1. MENSTRUAL CYCLE STATISTICS'), 'Detail view 3 preserves Menstrual Cycle Statistics');
  assert(summaryDetailHtml.includes('2. RECENT PERIOD DATES & BLEEDING DAYS'), 'Detail view 3 preserves Recent Bleeding Dates');
  assert(summaryDetailHtml.includes('3. MOST FREQUENTLY REPORTED SYMPTOMS'), 'Detail view 3 preserves Reported Symptoms');
  assert(summaryDetailHtml.includes('4. QUESTIONS PREPARED FOR DOCTOR'), 'Detail view 3 preserves Questions Prepared');

  // -------------------------------------------------------------------------
  // Feature 10: Visible Medical Safety Guidance
  // -------------------------------------------------------------------------
  console.log('\n--- 10. Visible Medical Safety Guidance ---');
  const safetyBanner = renderHeardSafetyBanner();
  assert(safetyBanner.includes('EMERGENCY MEDICAL WARNING SIGNS'), 'Urgent safety guidance banner rendered');
  assert(safetyBanner.includes('Do Not Wait for an Upcoming Appointment'), 'Explicitly instructs NOT to wait for an appointment');
  assert(safetyBanner.includes('Soaking 1+ pad/tampon every hour'), 'Identifies heavy bleeding red flag');
  assert(safetyBanner.includes('Blood clots larger than a quarter'), 'Identifies large clot red flag');
  assert(safetyBanner.includes('112') && safetyBanner.includes('108'), 'Displays immediate emergency numbers');

  console.log('\n========================================');
  console.log(`Test Results: ${passed} Passed, ${failed} Failed.`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runDoctorVisitTests();
