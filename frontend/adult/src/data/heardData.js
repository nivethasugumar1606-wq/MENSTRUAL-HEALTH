/**
 * MOONLIT "Am I Being Heard?" Conversation Builder & Doctor Prep Data
 * Safe, respectful, empowering templates to help young women communicate with
 * doctors, parents, nurses, and trusted adults.
 */

export const CONVERSATION_TEMPLATES = {
  doctor: {
    title: 'Speaking to a Doctor or Gynecologist',
    intro: 'Doctors appreciate structured, chronological information. Here is a clear script you can customize:',
    concerns: {
      pain: `“Thank you for seeing me, Doctor. I've been tracking my menstrual cycles and pain for the past 4 months. My pain regularly reaches an 8 or 9 out of 10, specifically peaking around Day 4. It interferes with my school attendance and sleep. I've tried heating pads and standard pain relievers, but I'm still struggling. What medical evaluations or treatments can we explore to help me manage this?”`,
      irregular: `“Doctor, I'd like to discuss my cycle regularity. Over the past several months, my cycle intervals have varied significantly, and I've noticed symptoms like acne and fatigue. I know Rotterdam criteria look at ovulation, androgen levels, and ultrasounds. Could we discuss what tests might be appropriate to understand what my body is experiencing?”`,
      worsening: `“Doctor, my period cramps have been steadily worsening over the last 3–4 cycles. The pain now extends into my lower back and legs. I want to make sure we investigate whether conditions like endometriosis or adenomyosis could be contributing factors.”`
    }
  },
  parent: {
    title: 'Talking to a Parent or Guardian',
    intro: 'It can feel vulnerable to talk about periods with family. Here is a gentle way to start:',
    concerns: {
      pain: `“Hey, do you have a few minutes to talk? I wanted to share something going on with my health. My period cramps have been really severe lately—especially on Day 4. It makes it hard to focus at school or sleep. I’ve been tracking it on my wellness app, and I think it would really help if we could schedule an appointment with a doctor to check it out.”`,
      irregular: `“I wanted to talk to you about my periods. They haven't been very regular, and I’m having some other symptoms like fatigue. I'd really appreciate your support in visiting a doctor so we can ask questions together.”`,
      worsening: `“Mom/Dad, my cramps are getting more intense than they used to be. Standard medicine isn't helping enough. Could you help me make an appointment with an adolescent health specialist or gynecologist?”`
    }
  },
  nurse: {
    title: 'Talking to a School Nurse',
    intro: 'School nurses are trained in adolescent health and can provide immediate quiet space and support:',
    concerns: {
      pain: `“Hello, Nurse. I'm experiencing intense menstrual cramping right now. On my pain log it's around an 8/10. Could I please rest in the health room with a heating pad or warm pack for 20 minutes? I also wanted to ask your advice on talking to my doctor about chronic cramps.”`,
      irregular: `“Hi, I've been feeling dizzy and fatigued with my cycle today. Could I have some water and check my vitals? I’d also love to ask how students usually manage severe cycle fatigue during classes.”`
    }
  },
  friend: {
    title: 'Talking to a Trusted Friend',
    intro: 'Sharing your experience with a friend helps you feel less alone:',
    concerns: {
      pain: `“Hey, I might be a bit quiet today because my period cramps are really bad right now. I'm taking things slow. If I need to take a break or step out, that's why. Thank you for always being there for me ♡”`
    }
  }
};

export const DEFAULT_DOCTOR_QUESTIONS = [
  { id: 'q1', text: 'What might be causing this intensity of pain, especially on Day 4?', checked: true },
  { id: 'q2', text: 'Could my symptoms be linked to PCOS, endometriosis, or another condition?', checked: true },
  { id: 'q3', text: 'What prescription or over-the-counter options would be safest and most effective for me?', checked: true },
  { id: 'q4', text: 'Should we test my blood for ferritin (iron stores), thyroid, or androgen levels?', checked: false },
  { id: 'q5', text: 'What warning signs mean I should call your office or seek urgent care?', checked: true },
  { id: 'q6', text: 'When should we schedule our next follow-up appointment?', checked: false }
];
