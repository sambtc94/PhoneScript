/* ════════════════════════════════════════════════════════
   PhoneScript — Phrase Libraries & Data
   All static text content: greetings, connectors, responses, etc.
   Imported by engine.js which does the composition logic.
════════════════════════════════════════════════════════ */

/* ── Quick-suggestion chip labels ───────────────────────────── */
const QUICK_POS = [
  'Excellent effort in class',
  'Great improvement recently',
  'Always prepared and on time',
  'Helps classmates willingly',
  'Outstanding assignment quality',
  'Positive attitude to learning',
  'Achieved a high grade',
  'Shows leadership qualities',
  'Consistent homework completion',
];

const QUICK_NEG = [
  'Missing homework / assignments',
  'Disrupting class',
  'Declining grades',
  'Frequent absences or lateness',
  'Conflict with peers',
  'Not engaging in class',
  'Incomplete assessments',
  'Behaviour concerns',
  'Struggling with content',
];

/* ── Keyword → category map (for dominant-theme detection) ──── */
const KEYWORD_MAP = {
  behaviour  : /\b(behav|disrupt|class|talk|noise|shout|rude|attitude|respect|language|phone|device|equipment|throw|fight|aggress|bully|intimidat)/i,
  academic   : /\b(grade|mark|result|score|test|exam|assessment|assignment|homework|work|class.?work|perform|learn|understand|struggl|behind|fail|pass|improve)/i,
  attendance : /\b(absent|absenc|late|lateness|tardy|arrive|truant|school|miss)/i,
  engagement : /\b(engag|particip|effort|try|motivat|focus|distract|attention|interest|enthus|passiv|withdrawn)/i,
  social     : /\b(friend|peer|social|group|team|conflict|argument|isolat|bully|relation|interact)/i,
  leadership : /\b(leader|initiative|help|support|mentor|role model|captain|represent)/i,
  creativity : /\b(creativ|innovat|idea|original|unique|design|art|music|drama|write|writ)/i,
  wellbeing  : /\b(wellbeing|well.?being|stress|anxious|anxiety|worry|upset|sad|emotion|mental|health|home)/i,
};

/* ════════════════════════════════════════════════════════
   POSITIVE CALL — phrase pools
════════════════════════════════════════════════════════ */
const POS = {

  greeting: [
    (d) => `Hello, is this ${d.parent}?\n\nHi ${d.parent}! This is ${d.teacher} calling — I'm ${d.student}'s ${d.subject} teacher. I hope I'm not catching you at a bad time. I just wanted to give you a quick ring because I have some really positive things to share about ${d.student}.`,
    (d) => `Hello — could I please speak with ${d.parent}?\n\nHi ${d.parent}, it's ${d.teacher} here, ${d.student}'s ${d.subject} teacher. How are you? I'm calling with good news today, so hopefully this is a welcome surprise!`,
    (d) => `Hi there, is this ${d.parent}? Wonderful — this is ${d.teacher}, calling from school. I'm ${d.student}'s teacher for ${d.subject}. I just wanted to reach out because I've been noticing some really great things about ${d.student} and felt you deserved to hear about them directly.`,
    (d) => `Good [morning/afternoon], ${d.parent}. This is ${d.teacher} — ${d.student}'s ${d.subject} teacher. I hope you're doing well! I'm calling today to share some really encouraging observations, and I think you'll be pleased to hear them.`,
  ],

  reassure: [
    () => `I want to say right away — this is entirely a positive call, so please don't worry!`,
    () => `I should mention straight away that this is a good news call — nothing to be concerned about at all.`,
    () => `Before I go on, I just want to reassure you that everything is going really well. I'm calling to celebrate, not to raise any concerns.`,
  ],

  bridge: [
    (d, n) => `I've been meaning to call for a little while, and I'm so glad I finally have the chance. I've noticed ${n === 1 ? 'something' : 'a number of things'} about ${d.student} that I really wanted to share with you.`,
    (d) => `Teachers don't always get the chance to make calls like this, so I made a point of finding the time — because ${d.student} genuinely deserves to have these things recognised.`,
    (d) => `It's really important to me that families hear the good news, not just the concerns. So I wanted to take a moment to tell you what I've been seeing in ${d.subject} lately.`,
    (d) => `I believe in celebrating students when they're doing well, and ${d.student} has given me plenty of reasons to call.`,
  ],

  // First-point intro phrase (ends with "that" to flow into the sentence)
  pointIntros: [
    (d) => `What I've been noticing is that`,
    (d) => `In ${d.subject}, I've really observed that`,
    (d) => `Something that really stands out about ${d.student} is that`,
    (d) => `One thing I particularly want to highlight is that`,
    (d) => `I've been genuinely impressed that`,
  ],

  // Connectors between subsequent points
  pointConnectors: [
    `On top of that,`,
    `I've also noticed that`,
    `Another thing worth mentioning —`,
    `Beyond that,`,
    `What's more,`,
    `I should also say that`,
    `And it doesn't stop there —`,
    `Additionally,`,
  ],

  // Bridges used when grouping multiple points into flowing prose
  groupBridges: [
    (d) => `But that's not all I wanted to share.`,
    (d) => `There's more, too.`,
    (d) => `And I want to mention a couple of other things as well.`,
    (d) => `I also wanted to highlight something else.`,
  ],

  pointClosers: [
    (d) => `This really does make a difference — both to ${d.student}'s own learning and to the whole class environment.`,
    (d) => `That kind of attitude and effort doesn't go unnoticed, I can tell you.`,
    (d) => `It's the sort of thing that really stands out, and I wanted to make sure you knew.`,
    (d) => `You should be really proud of ${d.student} for all of this.`,
    (d) => `I genuinely enjoy having ${d.student} in ${d.subject} because of it.`,
  ],

  invite: [
    (d) => `I'd love to hear from you as well — have you noticed anything similar at home, or is there anything you'd like to share with me about how ${d.student} is feeling about ${d.subject}?\n\n[Pause and listen]`,
    (d) => `Is there anything you'd like to ask me, or anything about ${d.student} that you'd like me to know? I'm very happy to have a longer conversation if you'd like.\n\n[Pause and listen]`,
    (d) => `Do you have any questions for me, or anything you'd like to pass on? I always appreciate hearing your perspective.\n\n[Pause and listen]`,
  ],

  close: [
    (d) => `Thank you so much for your time, ${d.parent}. It's been a real pleasure talking with you. I'll keep in touch, and please don't ever hesitate to reach out if you need anything. Have a wonderful day!`,
    (d) => `Thank you for taking my call, ${d.parent} — I really appreciate it. Keep up the encouragement at home; it clearly makes a difference! Take care.`,
    (d) => `It's been lovely chatting, ${d.parent}. Please pass on my regards to ${d.student} — they're doing a great job. Take care now, goodbye!`,
    (d) => `Thank you, ${d.parent}. Days like this remind me why teaching is such a rewarding job. Speak soon — take care!`,
  ],
};

/* ════════════════════════════════════════════════════════
   CONCERN CALL — phrase pools
════════════════════════════════════════════════════════ */
const NEG = {

  greeting: [
    (d) => `Hello, is this ${d.parent}?\n\nHi ${d.parent}, this is ${d.teacher} — I'm ${d.student}'s ${d.subject} teacher at school. I hope I haven't caught you at a difficult time. I was hoping to have a quick chat with you about ${d.student} if that's okay.`,
    (d) => `Good [morning/afternoon] — could I speak with ${d.parent} please?\n\nHi ${d.parent}, it's ${d.teacher} calling. I teach ${d.student} in ${d.subject}. How are you today? I wanted to give you a call because I'd really value your input on something.`,
    (d) => `Hello ${d.parent}, this is ${d.teacher} from school — ${d.student}'s ${d.subject} teacher. Thanks for picking up. I'm calling because I've noticed some things I think are worth discussing together, and I wanted to speak with you directly rather than leaving it any longer.`,
    (d) => `Hi ${d.parent}, it's ${d.teacher} here — I teach ${d.student} in ${d.subject}. I hope you're well. I'm reaching out because I care about how ${d.student} is getting on, and there are a few things I'd like to talk through with you.`,
  ],

  // Purpose paragraph — chosen based on dominant concern category
  purpose: {
    behaviour: [
      (d) => `I want to be upfront with you — I've noticed some behaviour in ${d.subject} that I think we need to address together, because I know it's not reflective of who ${d.student} can be.`,
      (d) => `I'm calling because there have been some behavioural concerns in class that I'd like us to work through together. I want to approach this as a partnership — you know ${d.student} better than anyone.`,
      (d) => `There have been some incidents in ${d.subject} recently that I felt were important enough to bring to your attention. I want to work with you on this rather than handling it in isolation.`,
    ],
    academic: [
      (d) => `I'm calling because I've noticed ${d.student}'s progress in ${d.subject} has given me some cause for concern, and I wanted to talk with you about how we can best support them.`,
      (d) => `I've been monitoring ${d.student}'s progress in ${d.subject} closely, and I felt the time was right to have a conversation with you about where things are at academically.`,
      (d) => `I'm reaching out because I think ${d.student} is capable of more than their current results in ${d.subject} suggest, and I'd like us to put our heads together on how to best support them.`,
    ],
    attendance: [
      (d) => `I wanted to speak with you today about ${d.student}'s attendance and punctuality, as it's starting to have an impact on their learning in ${d.subject}.`,
      (d) => `One of the things I've noticed and wanted to discuss is ${d.student}'s attendance. Missing time from class does add up, and I want to make sure we can work together to address it.`,
    ],
    engagement: [
      (d) => `I've noticed that ${d.student} doesn't seem to be as engaged in ${d.subject} as I'd expect, and I wanted to have a conversation about what might be behind that.`,
      (d) => `I'm reaching out because I feel like ${d.student} has a lot of potential in ${d.subject} that isn't being fully realised right now, and I'd love to explore what we can do together.`,
    ],
    general: [
      (d) => `I'm calling because there are a few things I've been observing in ${d.subject} that I think are worth a conversation. I want to approach this as a team — you and I working together for ${d.student}'s benefit.`,
      (d) => `I felt it was important to call you directly rather than let things go unaddressed. I believe in open communication and I'd rather work through any concerns together early.`,
      (d) => `I'm reaching out because I think there are some things we can address together that will really make a difference for ${d.student} in ${d.subject}.`,
    ],
  },

  // Lead-in for the first concern
  firstConcernIntro: [
    (d) => `The main thing I wanted to raise is that`,
    (d) => `What I've been observing is that`,
    (d) => `In ${d.subject}, I've noticed that`,
    (d) => `One of the things I wanted to discuss is that`,
    (d) => `I've been a little concerned that`,
  ],

  // Transition INTO the list of concerns (used when there are 2+ concerns)
  concernsTransition: [
    (d, n) => `I want to walk you through ${n === 2 ? 'both of the things' : 'the things'} I've been observing, so you have the full picture.`,
    (d, n) => `Let me explain what I've been seeing, and then I'd really love to hear your thoughts.`,
    (d, n) => `There are ${n === 2 ? 'two' : 'a few'} specific things I'd like to raise — I'll go through them, and please feel free to stop me at any point.`,
    (d, n) => `I want to be transparent with you about what I've been noticing, so let me walk you through it.`,
  ],

  // Labels for individual concerns within a multi-concern block.
  // Each label should be a standalone prefix that flows into "Alex has been..."
  concernLabels: {
    first:  ['First,',       'To start with,',     'Firstly,',        'The first thing I wanted to raise is that'],
    second: ['Second,',      'Alongside that,',    'Additionally,',   'On top of that,'],
    third:  ['Third,',       'I should also note —', 'And thirdly,',  'I also want to mention that'],
    further:['Beyond that,', 'One more thing —',   'Further to this,', 'I should also raise that'],
  },

  // Bridges between concern-groups (when concerns span multiple categories)
  concernGroupBridges: [
    `Alongside the [first issue], I've also noticed something else.`,
    `There's another area I wanted to bring up as well.`,
    `Related to this, but separate —`,
    `On a different but related note,`,
  ],

  collaborative: [
    (d) => `I want to be really clear that I'm not raising these things to be critical of ${d.student}. I genuinely believe in them, and I think with the right support we can turn things around.`,
    (d) => `Everything I'm sharing is coming from a place of wanting to help ${d.student} thrive. I see real potential there, and I don't want these issues to get in the way of that.`,
    (d) => `Please know that my intention is absolutely to work with you here, not against anyone. You and I want the same thing — for ${d.student} to do well.`,
    (d) => `I want to emphasise that I'm not here to judge. I see these as challenges we can work through together, and I believe ${d.student} is capable of real improvement.`,
  ],

  invite: [
    (d) => `I'd really value your thoughts on this. Do you have any insight into what might be contributing to these things? Is there anything happening at home I should be aware of?\n\n[Pause and listen]`,
    (d) => `You know ${d.student} far better than I do, so I'd love to hear your perspective. Have you noticed anything similar at home, or is there any context that might help me understand?\n\n[Pause and listen]`,
    (d) => `I genuinely want to hear from you — is any of this coming as a surprise, or has ${d.student} mentioned anything about school lately?\n\n[Pause and listen]`,
  ],

  nextSteps: [
    (d) => `I'd like to agree on a plan going forward. On my end, I'll [describe your action — e.g. check in with ${d.student} regularly / adjust my approach / monitor their progress closely]. What might be possible from your end at home?`,
    (d) => `I think it would be useful to agree on some next steps together. I'm planning to [your action — e.g. keep a closer eye on ${d.student}'s engagement / send home weekly updates]. Is there anything you'd be able to do to reinforce this at home?`,
    (d) => `Let's think about what we can both do. On my side I'll [your action]. Even small things at home — like asking ${d.student} about ${d.subject} each day — can make a real difference.`,
  ],

  close: [
    (d) => `Thank you so much for hearing me out, ${d.parent}, and for being so receptive. I'll follow up with you in [timeframe] to let you know how things are progressing. Please feel absolutely free to contact me anytime — I'm always happy to talk. Take care.`,
    (d) => `I really appreciate your time, ${d.parent}. I'm glad we could have this conversation. I'll keep you informed of how things develop. Don't hesitate to reach out if you have questions. Goodbye for now.`,
    (d) => `Thank you, ${d.parent}. Working together like this is exactly what makes a difference for students like ${d.student}. I'll be in touch. Take care!`,
    (d) => `I appreciate you making the time, ${d.parent}. We'll keep working on this together — please know my door is always open. Have a good [day/evening].`,
  ],
};

/* ════════════════════════════════════════════════════════
   PARENT RESPONSE SUGGESTIONS
════════════════════════════════════════════════════════ */
const RESPONSES_POS = [
  {
    q: '"This is a surprise — is everything really okay?"',
    a: `Absolutely! I completely understand — it can feel unexpected to get a call from school. But I genuinely wanted to take a moment to celebrate the things I've been seeing. [Student] is doing really well and deserves that recognition.`,
  },
  {
    q: '"Can we also talk about a concern I have?"',
    a: `Of course — I'd love for this to be a two-way conversation. Could we schedule a longer call or a meeting this week so I can give that the attention it deserves? I'm very happy to discuss anything you'd like.`,
  },
  {
    q: '"How can we keep this momentum going at home?"',
    a: `That's a great question! Consistency is really helpful. Continuing to encourage [student] — even just asking about their day or checking in on their work — makes a big difference. I'll also keep you informed of how things are going.`,
  },
  {
    q: '"We don\'t usually hear from the school."',
    a: `I think it's really important to connect with families, not just when there are problems. I'm committed to keeping you in the loop — please don't hesitate to reach out to me directly anytime.`,
  },
  {
    q: '"[Student] will be so happy to hear this!"',
    a: `That's wonderful! Please do pass it on. Knowing that their efforts are recognised at home as well as at school makes a real difference to how students feel about their learning.`,
  },
  {
    q: '"Is this reflected in their grade?"',
    a: `[Student]'s grades reflect the great effort they're putting in. [Share current standing if appropriate.] Their positive attitude puts them in a strong position going forward.`,
  },
  {
    q: '"What can I do to help support them further?"',
    a: `The best thing you can do is keep the encouragement going at home — ask them how [subject] is going, show an interest in what they're studying, and celebrate their wins. If you'd like specific suggestions, I'm happy to share some ideas.`,
  },
  {
    q: '"Can I share this with [student] directly?"',
    a: `Absolutely — in fact, I'd encourage it! Feel free to share exactly what I said. It means a lot to students when they know their effort has been noticed by both their teacher and their family.`,
  },
];

const RESPONSES_NEG = [
  {
    q: '"Why are you only telling me this now?"',
    a: `That's a fair question and I understand your frustration. I've been monitoring the situation and wanted to speak with you at the point where a conversation would be most useful. Going forward, I'll make sure to keep you better informed earlier.`,
  },
  {
    q: '"[Student] hasn\'t mentioned anything to me."',
    a: `That's quite common — students don't always share school concerns at home, and that's okay. What matters is that we're having this conversation now so we can support [student] from both sides.`,
  },
  {
    q: '"Are you sure this isn\'t just a personality clash?"',
    a: `I appreciate you raising that, and I take it seriously. What I'm basing this on is [specific evidence — e.g. consistent observations, work samples]. I'm very open to hearing [student]'s perspective through you.`,
  },
  {
    q: '"What are YOU going to do about it?"',
    a: `Great question — I'm already [your action — e.g. checking in with student daily / providing extra support]. I'd love to discuss what we can also do from home, and whether there's anything I might be missing.`,
  },
  {
    q: '"[Student] says it\'s the other students causing the issue."',
    a: `[Student]'s perspective is really important to me. Could we arrange a time to meet — possibly with [student] present — so we can all hear each other out and find a solution together?`,
  },
  {
    q: '"We\'re going through a lot at home right now."',
    a: `Thank you for trusting me with that — it genuinely helps me understand what [student] may be carrying. Are there any adjustments we could make at school to support them through this?`,
  },
  {
    q: '"What happens if things don\'t improve?"',
    a: `I'd like to give the plan we've discussed a real chance first — [summarise agreed steps]. I'll check in with you in [timeframe] to share how things are going. If we're still concerned, we can discuss further steps together then.`,
  },
  {
    q: '"I want to speak to the principal."',
    a: `That is absolutely your right, and I respect that completely. I'll make sure the principal is fully briefed on our conversation. Would you like me to arrange that, or would you prefer to contact the school office directly?`,
  },
  {
    q: '"Is [student] being bullied?"',
    a: `I haven't observed or been made aware of anything like that, but I want to take your concern very seriously. I'll look into it carefully and speak with the relevant staff. Can you tell me more about what [student] has said to you?`,
  },
  {
    q: '"Do you think [student] has a learning difficulty?"',
    a: `I'm not in a position to make that kind of assessment, but what I'm observing does suggest it might be worth exploring further support. I'd recommend we refer this to our Learning and Support team — I can help set that up if you'd like.`,
  },
  {
    q: '"[Student] says they find the work too hard / too easy."',
    a: `That's really valuable to hear — thank you. If the work isn't at the right level, that can definitely affect engagement. Let me review what I've been setting and we can discuss how to better match it to [student]'s needs.`,
  },
];
