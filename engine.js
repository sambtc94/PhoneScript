/* ════════════════════════════════════════════════════════
   PhoneScript — Script Generation Engine
   Depends on: phrases.js (loaded first)
════════════════════════════════════════════════════════ */

/* ── Utility: pick random item, never repeating last pick ──── */
const _lastPick = {};
function pick(key, arr) {
  if (!arr || arr.length === 0) return '';
  let idx;
  do { idx = Math.floor(Math.random() * arr.length); }
  while (arr.length > 1 && idx === _lastPick[key]);
  _lastPick[key] = idx;
  return arr[idx];
}

/* ── Shuffled queue: returns items without replacement until exhausted ── */
function makeQueue(arr) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  let i = 0;
  return () => shuffled[i++ % shuffled.length];
}

function lcFirst(s) { return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }
function ucFirst(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

/* ── Gerund to infinitive converter ─────────────────────────── */
function gerundToInfinitive(word) {
  const irregular = {
    running:'run', sitting:'sit', getting:'get', putting:'put', setting:'set',
    hitting:'hit', cutting:'cut', letting:'let', beginning:'begin',
    swimming:'swim', winning:'win', dropping:'drop', stopping:'stop',
    seeing:'see', being:'be', having:'have', making:'make', taking:'take',
    coming:'come', giving:'give', going:'go', doing:'do',
    following:'follow', borrowing:'borrow', knowing:'know', growing:'grow',
    showing:'show', allowing:'allow', throwing:'throw', flowing:'flow',
    drawing:'draw', playing:'play', saying:'say', staying:'stay',
    paying:'pay', trying:'try', carrying:'carry', studying:'study',
  };
  const lower = word.toLowerCase();
  if (irregular[lower]) return irregular[lower];
  if (!lower.endsWith('ing')) return lower;
  const stem = lower.slice(0, -3);
  // Doubled consonant root: e.g. "running"→"runn" → "run"
  if (/(.)\1$/.test(stem)) return stem.slice(0, -1);
  // Stem ends in consonant after vowel (single) — restore 'e': engaging→engage
  // But NOT if stem ends in w/y/x (those don't take 'e')
  if (/[aeiou][^aeiouwyxh]$/.test(stem)) return stem + 'e';
  return stem;
}

/* ── Keyword analyser ───────────────────────────────────────── */
function analysePoints(pts) {
  const profile = { behaviour:0, academic:0, attendance:0, engagement:0, social:0, leadership:0, creativity:0, wellbeing:0 };
  pts.forEach(p => {
    for (const [cat, re] of Object.entries(KEYWORD_MAP)) {
      if (re.test(p)) profile[cat]++;
    }
  });
  profile.dominant = Object.entries(profile)
    .filter(([k]) => !['dominant','count'].includes(k))
    .sort((a, b) => b[1] - a[1])[0][0];
  profile.count = pts.length;
  return profile;
}

/* ── Point classifier ───────────────────────────────────────── */
function classifyPoint(p) {
  // Starts with a pronoun → treat as a full sentence (substitute pronoun for student name)
  if (/^(She|He|They)\s/i.test(p)) return 'sentence';
  // Already has a conjugated verb → use as-is
  if (/\b(has|have|is|are|was|were|does|do|did|refuses?|won't|doesn't|can't|fails?|won't|hasn't|haven't|isn't|aren't)\b/i.test(p)) return 'sentence';
  // Negation phrases ("not engaging", "not completing") → treat with special handling
  if (/^not\s+\w/i.test(p)) return 'negation';
  // Adjective/state phrases ("appears stressed", "seems withdrawn") → adjective phrase
  if (/^(appears?|seems?|looks?)\s+/i.test(p)) return 'adjectivephrase';
  // Starts with a gerund or past-tense action → verb phrase (prepend subject + auxiliary)
  if (/^(disrupting|missing|talking|throwing|fighting|arguing|struggling|failing|refusing|ignoring|helping|helped|leading|led|achieving|achieved|completed|completing|participating|contributed|contributing|improving|improved|working|making|created|creating|demonstrating|demonstrated|displaying|engaging|received|scored|earned|passed|submitted|attended|showed|showing|supported|arriving|lacking|disrespecting)/i.test(p)) return 'verbphrase';
  return 'nounphrase';
}

/* ── Build one grammatical sentence from a raw point ────────── */
function pointToSentence(point, isPos, d, isFirstMention) {
  if (isFirstMention === undefined) isFirstMention = true;
  const p    = point.trim();
  const kind = classifyPoint(p);

  const posVerbs  = ['has been showing',      'consistently demonstrates', 'has really been displaying', 'keeps on showing'];
  const negVerbs  = ['has been exhibiting', 'has been showing signs of', 'has been displaying'];
  const posVerbs2 = ['has also been showing',  'is also demonstrating',    'has been displaying'];
  const negVerbs2 = ['has been exhibiting', 'has been showing signs of', 'has been displaying'];
  const posGerund = ['has been', 'has really been', 'has consistently been'];
  const negGerund = ['has been', 'has been consistently', 'has been'];

  if (kind === 'sentence') {
    // If the sentence starts with a third-person pronoun (She/He/They), replace it with the student name
    // so it reads correctly after connectors like "On top of that, Alex is always..."
    const pronounReplaced = p.replace(/^(She|He|They)\b/, d.student);
    if (pronounReplaced !== p) return pronounReplaced; // keep student name capitalised
    // Preserve capitalisation of proper nouns at start — lowercase everything else
    const startsWithProperNoun = /^[A-Z][a-z]+ (has|is|was|have|are|were|does|did)\b/.test(p);
    return startsWithProperNoun ? p : lcFirst(p);
  }

  if (kind === 'negation') {
    // "not engaging in class" → "Alex has been struggling to engage in class"
    const core = p.replace(/^not\s+/i, '');
    // Convert leading gerund to infinitive for "struggling to / finding it difficult to" constructions
    const infinitive = core.replace(/^([a-zA-Z]+ing)\b/, m => gerundToInfinitive(m));
    if (isPos) {
      return `${d.student} has been working to improve their ${lcFirst(infinitive)}`;
    }
    const aux = pick('aux_neg_' + isFirstMention, isFirstMention
      ? ['has been struggling to', 'has been finding it difficult to', 'has been unable to']
      : ['has been struggling to', 'has been finding it difficult to', 'has been unable to']);
    return `${d.student} ${aux} ${lcFirst(infinitive)}`;
  }

  if (kind === 'adjectivephrase') {
    // "appears stressed and withdrawn" → "Alex has been appearing stressed and withdrawn"
    const core = p.replace(/^(appears?|seems?|looks?)\s+/i, '');
    if (isPos) return `${d.student} has been presenting as ${lcFirst(core)}`;
    return `${d.student} has been appearing ${lcFirst(core)}`;
  }

  if (kind === 'verbphrase') {
    const isPast = /^(achieved|completed|contributed|improved|received|scored|earned|passed|submitted|attended|helped|led|showed|demonstrated|created|supported)/i.test(p);
    if (isPast) {
      const aux = pick('aux_past_' + isPos, isPos
        ? ['has', 'has recently', 'has just']
        : ['has', 'has recently', 'unfortunately has']);
      return `${d.student} ${aux} ${lcFirst(p)}`;
    }
    const aux = pick('aux_ger_' + isPos, isPos ? posGerund : negGerund);
    // Strip trailing frequency adverbs that would double up with the injected aux
    const cleanedGerund = lcFirst(p).replace(/\s+(regularly|frequently|consistently|repeatedly|often|sometimes|occasionally|constantly)$/i, '');
    return `${d.student} ${aux} ${cleanedGerund}`;
  }

  // noun phrase — use distinct verbs for first vs subsequent mentions.
  let cleanedP = lcFirst(p);
  // "Helps classmates willingly" → rewrite as "willingly helps classmates" to avoid bare noun
  const helpsMatch = cleanedP.match(/^helps?\s+(.+?)(\s+(willingly|eagerly|readily|consistently|often|always))?$/i);
  if (helpsMatch) {
    const adv = helpsMatch[3] ? helpsMatch[3].toLowerCase() + ' ' : '';
    return `${d.student} ${adv}supports and helps ${helpsMatch[1]}`;
  }
  // Strip leading third-person verbs that would duplicate our injected verb
  cleanedP = cleanedP.replace(/^(shows?|displays?|demonstrates?|exhibits?|maintains?)\s+/i, '');
  // Adverb-led adjective phrases ("Always prepared and organised") →
  // reconstruct as a self-contained predicate to avoid "demonstrating prepared..."
  const adverbMatch = cleanedP.match(/^(always|consistently|regularly|often|frequently)\s+(.+)/i);
  if (adverbMatch) {
    return `${d.student} is ${adverbMatch[1].toLowerCase()} ${adverbMatch[2]}`;
  }

  const v = pick('v_noun_' + isPos + '_' + isFirstMention,
    isFirstMention
      ? (isPos ? posVerbs  : negVerbs)
      : (isPos ? posVerbs2 : negVerbs2)
  );
  return `${d.student} ${v} ${cleanedP}`;
}

/* ════════════════════════════════════════════════════════
   POSITIVE SCRIPT BUILDER
════════════════════════════════════════════════════════ */
function buildPositiveScript(d, pts) {
  const parts = [];

  // 1. Greeting
  parts.push(pick('pos_greet', POS.greeting)(d));

  // 2. Reassure (always for 2+ points, 60% chance for single)
  if (pts.length >= 2 || Math.random() > 0.4) {
    parts.push(pick('pos_reassure', POS.reassure)());
  }

  // 3. Bridge
  parts.push(pick('pos_bridge', POS.bridge)(d, pts.length));

  // 4. Weave points into flowing prose
  parts.push(buildPositivePointsProse(d, pts));

  // 5. Reflection / closer
  parts.push(pick('pos_closer', POS.pointClosers)(d));

  // 6. Invite parent
  parts.push(pick('pos_invite', POS.invite)(d));

  // 7. Farewell
  parts.push(pick('pos_close', POS.close)(d));

  return parts.join('\n\n');
}

/*
  Positive prose builder — turns 1-N points into natural paragraphs.
  Strategy:
   • 1 point  → single elaborated sentence
   • 2 points → two sentences joined with a connector
   • 3+       → group into paragraphs of 2-3, bridged naturally
*/
function buildPositivePointsProse(d, pts) {
  if (pts.length === 1) {
    const intro = pick('pos_intro', POS.pointIntros)(d);
    const core  = pointToSentence(pts[0], true, d, true);
    return `${intro} ${core}.`;
  }

  if (pts.length === 2) {
    const intro = pick('pos_intro', POS.pointIntros)(d);
    const s1    = pointToSentence(pts[0], true, d, true);
    const conn  = pick('pos_conn', POS.pointConnectors);
    const s2    = pointToSentence(pts[1], true, d, false);
    return `${intro} ${s1}. ${conn} ${s2}.`;
  }

  // 3+ points: split into groups of 2-3, using a shuffled connector queue so no repeats
  const nextConn = makeQueue(POS.pointConnectors);
  const groups  = [];
  const poolCopy = [...pts];
  while (poolCopy.length) {
    groups.push(poolCopy.splice(0, poolCopy.length >= 4 ? 2 : Math.min(3, poolCopy.length)));
  }

  return groups.map((group, gi) => {
    const sentences = group.map((p, i) => {
      const isFirst = gi === 0 && i === 0;
      const core = pointToSentence(p, true, d, isFirst || i === 0);
      if (isFirst) {
        const intro = pick('pos_intro', POS.pointIntros)(d);
        return `${intro} ${core}.`;
      }
      const conn = nextConn();
      return `${conn} ${core}.`;
    });

    // Add a group bridge before each subsequent paragraph
    if (gi > 0) {
      const bridge = pick('pos_grp_bridge_' + gi, POS.groupBridges)(d);
      return bridge + ' ' + sentences.join(' ');
    }
    return sentences.join(' ');
  }).join('\n\n');
}

/* ════════════════════════════════════════════════════════
   CONCERN SCRIPT BUILDER
════════════════════════════════════════════════════════ */
function buildNegativeScript(d, pts) {
  const profile = analysePoints(pts);
  const parts   = [];

  // 1. Greeting
  parts.push(pick('neg_greet', NEG.greeting)(d));

  // 2. Purpose — themed to dominant concern
  const purposePool = NEG.purpose[profile.dominant] || NEG.purpose.general;
  parts.push(pick('neg_purpose_' + profile.dominant, purposePool)(d));

  // 3. Concerns — prose or structured depending on count
  parts.push(buildConcernsProse(d, pts));

  // 4. Collaborative framing
  parts.push(pick('neg_collab', NEG.collaborative)(d));

  // 5. Invite parent
  parts.push(pick('neg_invite', NEG.invite)(d));

  // 6. Next steps
  parts.push(pick('neg_steps', NEG.nextSteps)(d));

  // 7. Close
  parts.push(pick('neg_close', NEG.close)(d));

  return parts.join('\n\n');
}

function buildAssessmentScript(d, pts) {
  const pointsText = pts.map((point, index) => {
    const sentence = assessmentPointToSentence(point, d, index === 0);
    return `${index === 0 ? 'The main thing I wanted to discuss is that' : 'I also wanted to mention that'} ${sentence}.`;
  }).join(' ');

  return [
    `Hello, is this ${d.parent}?\n\nHi ${d.parent}, this is ${d.teacher} calling from school. I teach ${d.student} in ${d.subject}. Is now an okay time for a quick conversation?`,
    pick('assessment_purpose', [
      `I'm calling to talk through ${d.student}'s assessment requirements and make sure we have a clear plan for what needs to happen next.`,
      `I wanted to contact you about some assessment work for ${d.student}, including what is currently outstanding and how we can support them to address it.`,
      `I'm getting in touch early so we can work together around ${d.student}'s assessment progress and avoid the situation becoming more difficult.`
    ]),
    pointsText,
    `I want to be clear that this conversation is about the outstanding requirements, not about labelling ${d.student}. The important thing is that we understand what is needed and help them take the next step.`,
    `I'd really value your perspective. Has ${d.student} spoken with you about the assessment, the N-Award risk or anything that has made completing the work difficult?\n\n[Pause and listen]`,
    `From here, I'll confirm the current requirements and speak with ${d.student} about the next action. Could you please encourage them to check in with the relevant teacher and bring any questions to us?`,
    `Thank you for your time, ${d.parent}. I appreciate us working together to support ${d.student}. I'll follow up once the next steps are clear. Take care.`
  ].join('\n\n');
}

function assessmentPointToSentence(point, d, isFirstMention) {
  const p = point.trim();
  if (/^at risk of\s+/i.test(p)) return `${d.student} may be ${lcFirst(p)}`;
  if (/^missing\s+/i.test(p)) return `${d.student} is ${lcFirst(p)}`;
  if (/^needs?\s+/i.test(p)) return `${d.student} ${lcFirst(p)}`;
  if (/^has not\s+/i.test(p)) return `${d.student} ${lcFirst(p)}`;
  if (/^(the )?assessment is\s+/i.test(p)) return `${d.student}'s ${lcFirst(p.replace(/^the /i, ''))}`;
  return pointToSentence(p, false, d, isFirstMention);
}

/*
  Concern prose builder — turns 1-N concerns into well-structured paragraphs.
  Strategy:
   • 1 concern → intro sentence + elaborating sentence
   • 2 concerns → intro + first concern + bridging phrase + second concern
   • 3-4 concerns → numbered/labelled structure with grouped prose and
                    a transition sentence to prepare the parent
   • 5+ concerns → same as 3-4 but split across two paragraphs
*/
function buildConcernsProse(d, pts) {
  if (pts.length === 1) {
    const intro = pick('neg_first_intro', NEG.firstConcernIntro)(d);
    const core  = pointToSentence(pts[0], false, d, true);
    const elab  = pick('neg_elab', [
      `I wanted to raise this with you now rather than wait any longer.`,
      `It's been noticeable enough that I felt a conversation was important.`,
      `I think if we address this together now, we can get things back on track quickly.`,
    ]);
    return `${intro} ${core}.\n\n${elab}`;
  }

  if (pts.length === 2) {
    const intro  = pick('neg_first_intro', NEG.firstConcernIntro)(d);
    const s1     = pointToSentence(pts[0], false, d, true);
    const bridge = pick('neg_two_bridge', [
      `On top of this,`,
      `Alongside that,`,
      `I've also noticed that`,
      `There's something else I wanted to mention too —`,
    ]);
    const s2 = pointToSentence(pts[1], false, d, false);
    return `${intro} ${s1}.\n\n${bridge} ${s2}.`;
  }

  // 3+ concerns: structured with a transition, then labelled points
  const transition = pick('neg_transition', NEG.concernsTransition)(d, pts.length);
  const labels     = NEG.concernLabels;
  const furtherQueue = makeQueue(labels.further);

  const labelledSentences = pts.map((p, i) => {
    const core  = pointToSentence(p, false, d, i === 0);
    let label;
    if (i === 0)      label = pick(`neg_lbl_first`,  labels.first);
    else if (i === 1) label = pick(`neg_lbl_second`, labels.second);
    else if (i === 2) label = pick(`neg_lbl_third`,  labels.third);
    else              label = furtherQueue();
    return `${label} ${core}.`;
  });

  // For 5+ points, split into two paragraphs
  if (pts.length >= 5) {
    const mid   = Math.ceil(pts.length / 2);
    const para1 = labelledSentences.slice(0, mid).join(' ');
    const para2 = labelledSentences.slice(mid).join(' ');
    return `${transition}\n\n${para1}\n\n${para2}`;
  }

  return `${transition}\n\n${labelledSentences.join(' ')}`;
}

/* ════════════════════════════════════════════════════════
   PUBLIC API
════════════════════════════════════════════════════════ */
function generateScriptText(mode, d, pts) {
  if (mode === 'positive') return buildPositiveScript(d, pts);
  if (mode === 'assessment') return buildAssessmentScript(d, pts);
  return buildNegativeScript(d, pts);
}
