# Interview Science for Excurse

**Research report — Conversational Elicitation Lead**
*How an AI should interview a traveler to truly understand them and their trip*

---

## 0. Executive summary

Excurse already has the right instinct, stated in its own strings: *"A story tells me more than a checklist ever could."* The research strongly validates that instinct — and sharpens it into an engineering discipline. Six findings dominate:

1. **Stories beat attribute checklists, and the literature explains why.** Explicit attribute questions ("beach or mountains?") fail whenever the user lacks domain vocabulary or hasn't formed a preference yet; implicit, usage- and episode-based questions ("tell me about a trip you loved") elicit richer, more accurate preferences with less effort ([Google/Kostric et al., usage-related elicitation](https://arxiv.org/abs/2111.13463); [CRS survey](https://dl.acm.org/doi/fullHtml/10.1145/3453154); episodic interviewing & [critical incident technique](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7249649/)).
2. **A short interview can carry astonishing predictive weight.** Stanford's generative-agent work showed a single two-hour semi-structured life interview lets an LLM predict a person's survey answers at **85% of the person's own test–retest accuracy** — far better than demographic profiles ([Park et al. 2024 / Stanford HAI](https://hai.stanford.edu/news/ai-agents-simulate-1052-individuals-personalities-impressive-accuracy)). Excurse needs minutes, not hours, because a trip is a much smaller prediction target than a life — but the lesson stands: *narrative transcript is the highest-density user model we know of.*
3. **The next-question problem is a value-of-information problem.** Bayesian preference elicitation (EVOI/EIG) and the newest LLM-agent clarification work (EVPI over "specification uncertainty" vs. "model uncertainty") give a principled rule: ask the question whose answer is most likely to *change the plan*; stop when no remaining answer would ([Structured Uncertainty guided Clarification](https://arxiv.org/abs/2511.08798); [Clarify When Necessary / INTENT-SIM](https://datasciocean.com/en/paper-intro/intent-sim/); [active-learning stopping criteria](https://proceedings.mlr.press/v108/ishibashi20a.html)).
4. **The question budget is real and small.** Survey research shows completion falls off a cliff between ~3 and ~8 questions (83% → 65% completion moving from 1–3 to 4–8 questions; the sharpest single drop is between 2–3 and 4–6 questions) ([Survicate benchmark of 21,863 surveys](https://survicate.com/blog/how-many-questions-should-surveys-have/)). The fix is not fewer facts — it's **progressive profiling**: two great questions now, the rest earned over time and inferred silently ([Descope](https://www.descope.com/learn/post/progressive-profiling)).
5. **The best human travel designers interview for feelings, not places.** Black Tomato's whole intake philosophy is "it's not where you want to go; it's how you want to feel," operationalized in their AI **Feelings Engine** (five pillars: Revitalized, Freedom, Distraction, Challenged, Contentment) ([Black Tomato](https://www.blacktomato.com/feelings-engine/); [Forbes](https://www.forbes.com/sites/alexandrakirkman/2025/02/14/using-ai-to-plan-travel-black-tomatos-new-tool-may-reinvent-how-you-book/)). Virtuoso-style advisors run discovery calls built on a couple dozen qualifying questions, but the craft is in the follow-up ("what does *active adventure* look like *for you*?") ([Travel Market Report](https://www.travelmarketreport.com/retail-strategies/articles/25-qualifying-questions-to-help-you-nail-your-clients-vacation-plans)).
6. **Groups are a different problem, not a bigger one.** Aggregating conflicting preferences has a real literature (average, least-misery, average-without-misery, fairness-by-turns), and family-travel research shows every member — including children — shapes decisions differently per decision type ([consensus models survey](https://link.springer.com/article/10.1007/s11257-023-09380-z); [family decision research](https://link.springer.com/article/10.1007/s11628-025-00579-1)). The design answer: interview travelers *separately and asymmetrically*, apply **veto semantics to constraints** and **fairness rotation to desires**.

The rest of this report walks the literature, then converts it into a concrete interview engine spec: a layered traveler model, a question inventory in Excurse's voice, a sequencing policy, stopping criteria, ask-vs-infer rules, and a group protocol — all compatible with a knowledge-graph user model.

---

## 1. What the literature says

### 1.1 Preference elicitation: explicit vs. implicit, checklist vs. story

The conversational-recommender-systems (CRS) literature distinguishes **explicit attribute questioning** (slot-filling: "what neighborhood? what budget? what cuisine?") from **implicit elicitation**. The core negative finding: explicit attribute questions *"do not perform well in cases where the user does not have sufficient knowledge of the target domain"* — which describes almost every traveler being asked about a city they have never visited ([A Survey on Conversational Recommender Systems](https://dl.acm.org/doi/fullHtml/10.1145/3453154)).

The Google/University of Stavanger line of work on **usage-related questions** ([Kostric, Balog & Radlinski](https://arxiv.org/abs/2111.13463), later in [ACM TORS](https://dl.acm.org/doi/full/10.1145/3629981)) shows that asking about the *intended use* of an item ("what will you be doing in these shoes?") rather than its *attributes* ("what heel height?") works even for domain novices, because everyone is an expert in their own life even when they're a novice in the catalog. Translated to travel: **never ask "do you prefer Michelin or hole-in-the-wall" in the abstract; ask "what did you eat on the best food day you can remember?"** The attribute preferences fall out of the answer, plus context the checklist could never carry.

Forced choice still has a place. Pairwise/forced-choice comparison is measurably better than open rating for *ranking* similar options — it reduces cognitive load, prevents "I like everything" responses, and is grounded in Thurstone's law of comparative judgement ([OpinionX](https://www.opinionx.co/blog/pairwise-comparison); [User Research Strategist](https://www.userresearchstrategist.com/p/a-guide-to-pairwise-comparison)). Excurse's existing *"Either is fine. I just want your lean"* phrasing is exactly the right deployment: **forced choice late, for tie-breaking between hypotheses the story already generated — never early, as a substitute for the story.**

### 1.2 Episodic probes: the science behind "tell me about a past trip"

Three adjacent qualitative traditions all converge on asking about **specific past episodes** rather than general preferences:

- **Episodic interviewing** — "Tell me about the last time you…" jogs memory via a concrete event; people recall not only what they did but what they wished they'd done ([NN/g User Interviews 101](https://www.nngroup.com/articles/user-interviews/)).
- **Critical Incident Technique** (Flanagan, 1954; still standard) — elicit a *specific, emotionally salient* incident, then probe it; produces "richer, more detailed insights" than general questioning ([CIT in program theory](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7249649/)).
- **Spradley's ethnographic Grand Tour questions** — "Walk me through a typical day on that trip" — expansive descriptive prompts that give the informant room to think, followed by **mini-tour questions** that zoom into one part of the answer ([Spradley 1979](http://www.analytictech.com/mb870/handouts/notes_on_spradley.htm)).

Why episodes work: general self-report of preferences is notoriously unreliable (people report aspirational selves), but memory for specific lived episodes is concrete, and the *choice of which episode to tell* is itself signal. A person asked "tell me about a trip you still think about" reveals, in one answer: their peak-moment type, their travel companions, their tempo, their vocabulary of pleasure, and what they brag about — the raw material for laddering.

### 1.3 Laddering and means-end chains: attributes → consequences → values

**Means-end chain theory** (Gutman/Reynolds) models preferences as ladders: concrete **attributes** ("a rooftop bar") produce **functional and psychosocial consequences** ("we lingered for three hours," "felt like locals") which serve terminal **values** ("belonging," "feeling alive," "being a good parent") ([UXmatters on laddering](https://www.uxmatters.com/mt/archives/2009/07/laddering-a-research-interview-technique-for-uncovering-core-values.php); [Kilwinger & van Dam 2021](https://onlinelibrary.wiley.com/doi/full/10.1002/mar.21521)). The technique: after any concrete statement, ask a variant of *"why did that matter to you?"* — usually 2–3 rungs gets to a value. Means-end analysis has been applied directly to destination choice and tourism ([ski tourism MEC study](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9780482/); [The "Pull" of Tourism Destinations: A Means-End Investigation](https://www.researchgate.net/publication/249701141_The_Pull_of_Tourism_Destinations_A_Means-End_Investigation)).

Design consequence: **the interview should store the whole ladder, not just the leaf.** "Wants rooftop bars" is brittle; "seeks unhurried evenings that feel like belonging → rooftop bar was one instance" transfers to any city. This is precisely what a knowledge-graph model is for (§2.1): attributes are edges to *instances*; values are the durable nodes.

An LLM interviewer should ladder *silently* most of the time — inferring the consequence/value rungs from the story and confirming with a reflection ("sounds like the best part wasn't the food, it was nobody looking at a clock") rather than interrogating with literal "why? why? why?", which real laddering practitioners warn feels like a toddler or a deposition.

### 1.4 Motivational interviewing: the warmth technology

Motivational interviewing (Miller & Rollnick) is the best-codified system for conversations that feel caring while extracting truth. Its **OARS** toolkit ([MINT](https://motivationalinterviewing.org/understanding-motivational-interviewing); [ISSUP OARS summary](https://www.issup.net/knowledge-share/resources/2019-10/motivational-interviewing-open-questions-affirmation-reflective)):

- **O**pen questions — invite the story without leading.
- **A**ffirmations — genuine recognition of something specific the person said (not flattery).
- **R**eflections — restate/deepen what was heard; MI practice targets **more reflections than questions** (classically a 2:1 ratio). A good "complex reflection" is a *guess at the feeling underneath* — which doubles as a hypothesis test for the user model.
- **S**ummaries — collect the threads and hand them back; the traveler corrects the model for free.

MI's deepest relevance to Excurse: it is designed for **ambivalence**. Most travelers are ambivalent (rest vs. adventure, together-time vs. alone-time, plan vs. drift). An MI-shaped interviewer doesn't force resolution; it *names the ambivalence* ("part of you wants the packed itinerary, part of you wants to cancel everything") and stores it as a tension to be honored in the plan — e.g., structured mornings, unscripted evenings. Interviews that resolve ambivalence prematurely produce plans the traveler resents.

### 1.5 Travel-motivation psychology: frames for silent classification

Three classical frameworks are useful *not* as questions but as latent dimensions the engine infers:

- **Push–pull** (Dann/Crompton): push motives are internal (escape, rest, bonding, prestige, self-discovery); pull motives are destination attributes. Interview for push; research handles pull ([review](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12729613/)).
- **Pearce's Travel Career Ladder/Pattern**: experienced travelers' motives climb toward belonging and self-actualization; novices' motives center on safety and stimulation. A traveler's *history* (elicited via the episodic probe) calibrates how adventurous a plan should be ([travel motivation review](https://tdmujournal.vn/uploads/paper/files/21-Tran-Cam-Thi.pdf)).
- **Plog's allocentric–psychocentric spectrum**: novelty-seeker vs. comfort-seeker — crude as a typology (widely criticized), but fine as one inferred axis with a confidence score, matching Excurse's existing "comfort vs new" lean question.

Also load-bearing: **anticipation research** — happiness peaks *before* the trip (Nawijn et al.; [Greater Good](https://greatergood.berkeley.edu/article/item/eight_steps_to_a_happier_vacation)) — and the **peak–end rule** — remembered experience is dominated by the peak moment and the ending ([NN/g](https://www.nngroup.com/articles/peak-end-rule/); [Psychology Today](https://www.psychologytoday.com/us/blog/automatic-you/202109/peak-end-rule)). Two design consequences: (a) **the interview is part of the vacation** — done well, it *creates* anticipation and should feel like the trip's first pleasure, which is deeply aligned with Excurse's calm editorial voice; (b) the interview should explicitly hunt for **the peak** ("what's the one moment you want to be able to tell someone about?") and the composer should engineer **the ending** (last-evening design), so ask about it.

### 1.6 Adaptive questioning: choosing the next question, and stopping

The formal machinery:

- **EVOI/EIG**: Bayesian preference elicitation selects the query with maximal expected value of information / expected information gain over a utility model ([Explainable Active Learning for Preference Elicitation](https://arxiv.org/abs/2309.00356); [Hybrid-MST](https://arxiv.org/pdf/1810.08851)).
- **LLM clarification research** (directly applicable): [Structured Uncertainty guided Clarification for LLM Agents](https://arxiv.org/abs/2511.08798) separates **specification uncertainty** (the *request* is ambiguous — asking helps) from **model uncertainty** (the *model* is unsure — asking the user won't help; research or defaults will), and scores candidate questions by **EVPI** (expected value of perfect information), explicitly to prevent redundant questioning. [INTENT-SIM / "Clarify When Necessary"](https://datasciocean.com/en/paper-intro/intent-sim/) simulates the space of plausible user intents: if simulated intents diverge → ask; if they converge → don't. And a sobering result: LLMs *recognize* ambiguity when asked to judge it but *rarely ask* clarifying questions unprompted ([Knowing but Not Showing](https://arxiv.org/pdf/2605.25284)) — so the interview engine must make asking-vs-inferring an explicit, engineered decision, not an emergent LLM behavior.
- **Stopping criteria** from active learning come in three families — accuracy-based, confidence-based, and **stability-based** (stop when new answers no longer change the model) ([Ishibashi & Hino](https://proceedings.mlr.press/v108/ishibashi20a.html); [ACM TIST stability criterion](https://dl.acm.org/doi/10.1145/3125645)). The stability criterion translates beautifully to Excurse: **stop when no plausible answer to any remaining question would change the itinerary you'd compose.** Call it the *plan-delta test*.
- **Budget reality**: completion craters with question count — median completion 86.8% at 2–3 questions vs 77.4% at 4–6 (largest single drop), and 83% (1–3) → 65% (4–8) → 56% (9–14) → 42% (15+) in a 21,863-survey analysis ([Survicate](https://survicate.com/blog/how-many-questions-should-surveys-have/)). Conversational interviews outperform form surveys on tolerance, but the gravity is the same. **Progressive profiling** — collect over multiple sessions, at moments of natural relevance, swapping known fields for unknown ones — is the standard remedy ([Descope](https://www.descope.com/learn/post/progressive-profiling)).
- **AI interviewers work**: controlled studies of LLM-led semi-structured interviews find adaptive follow-ups produce engagement and data quality approaching human moderation ([AI Conversational Interviewing](https://arxiv.org/html/2410.01824v1); [Scientific Reports multi-model evaluation](https://www.nature.com/articles/s41598-026-46517-7); [LSE AI-led interviewing](https://www.thevoiceofuser.com/the-strongest-paper-yet-on-ai-led-interviewing/)). The differentiator in these evaluations is precisely the quality of the *decision* to follow up and the *tailoring* of the follow-up — i.e., §1.6's machinery, not raw model fluency.

### 1.7 Conversation design: warmth + brevity are compatible

Google's conversation-design canon rests on **Grice's Cooperative Principle**: users treat an agent like a human conversation partner, so the agent must obey the maxims — say as much as needed and no more (quantity), be truthful (quality), be relevant (relation), be clear (manner) ([Google conversation design](https://developers.google.com/assistant/conversation-design/learn-about-conversation)). Practical rules with strong consensus ([Google](https://developers.google.com/assistant/conversation-design/learn-about-conversation); [chatbot.com principles](https://www.chatbot.com/blog/conversational-design/); [Mind the Product](https://www.mindtheproduct.com/deep-dive-ux-best-practices-for-ai-chatbots/)):

- **One question per turn.** Multi-part questions get partial answers and feel like forms.
- **A distinct persona retains users** — Google found the bots with the best retention had the strongest personas. Excurse already has one of the best personas in the genre ("Enjoy the quiet."); the interviewer must speak in *exactly* that voice.
- **Set expectations up front** (how long, what for, what happens after) and **show the payoff** — every answer should visibly improve something.
- **Always allow skip/"you decide."** MI and UX agree: pressure poisons both data and warmth.

Warmth is carried by *reflections and affirmations* (§1.4), not by length or exclamation points. A warm interview can be five turns if each turn proves it heard the last one.

### 1.8 Groups: conflicting preferences and family reality

- **Aggregation strategies** ([consensus survey, UMUAI](https://link.springer.com/article/10.1007/s11257-023-09380-z); [group RS overview](https://towardsdatascience.com/an-introduction-to-group-recommender-systems-8f942a06db56/)): **Average** (good when tastes are similar, bad when diverse), **Least Misery** (group score = unhappiest member's score — the right semantics for constraints and shared meals), **Average Without Misery** (average, but items below anyone's threshold are excluded), **Most Pleasure**, and **Fairness** (members "choose in turn" — the right semantics for allocating days/activities). LLM-era work confirms simple aggregation misses social dynamics like unequal influence ([LLM-enhanced GRS](https://arxiv.org/pdf/2507.19283); [GroupTravelBench](https://arxiv.org/html/2605.25200v1)).
- **Family decision research**: vacations are joint decisions with sub-decision-specific influence patterns; children materially influence "child-centred" purchases like vacations, and — strikingly — children *perceive* decisions as mother-dominated while parents report them as joint ([Who influences family tourism decisions?](https://link.springer.com/article/10.1007/s11628-025-00579-1); [ScienceDirect on parents vs child](https://www.sciencedirect.com/science/article/abs/pii/S0261517703000931)). Practical upshot: **the booking adult is an unreliable proxy for the group.** If you only interview the organizer, you inherit their blind spots about their own family.

### 1.9 How the masters do it: Black Tomato and the luxury-advisor playbook

- **Black Tomato**: intake begins from *feeling*, not destination — "escape, indulge, challenge, learn." Their [Feelings Engine](https://www.blacktomato.com/feelings-engine/) lets clients type raw emotional intent ("I want to feel untethered") and matches against ~400 expert itineraries via RAG, organized under five feeling pillars (Revitalized, Freedom, Distraction, Challenged, Contentment) ([Globetrender](https://globetrender.com/2025/02/13/black-tomato-launches-emotion-driven-travel-offering/); [Forbes](https://www.forbes.com/sites/alexandrakirkman/2025/02/14/using-ai-to-plan-travel-black-tomatos-new-tool-may-reinvent-how-you-book/)). Experts then *iterate the trip several times* with the client — elicitation continues through drafts, not just up front ([Forbes at-20 profile](https://www.forbes.com/sites/danielscheffler/2026/01/24/black-tomato-at-20-is-designing-travel-that-moves-hearts--minds/)).
- **Virtuoso-style advisors**: discovery calls with qualifying question banks — goals for the trip, celebration or escape, party vs. quiet, food adventurousness ("is your favorite restaurant a hole in the wall or Michelin?"), who's coming, pace, past trips loved/hated, non-negotiables, budget posture ([Travel Market Report's 25 questions](https://www.travelmarketreport.com/retail-strategies/articles/25-qualifying-questions-to-help-you-nail-your-clients-vacation-plans); [Travel Industry Solutions' 8 questions](https://travelindustrysolutions.com/how-to-qualify-a-travel-client-8-powerful-questions-to-ask/)). Their signature move is the *personal re-anchor*: never accept a category label ("we like adventure") without asking what it looks like **for you** — the human version of resolving specification uncertainty.
- Clients of this tier want to **co-create, not outsource** — they reject one-size-fits-all and want to feel the plan is theirs ([Travelweek/Virtuoso panel](https://www.travelweek.ca/news/retailers/last-minute-bookings-sustainable-travel-and-all-the-trends-virtuoso-on-tour-canadas-travel-advisor-panel/)). The interview and draft-iteration loop *is* the co-creation surface.

---

## 2. The Excurse interview engine: opinionated spec

### 2.1 The traveler model: four layers, stored as a graph

Everything elicited or inferred lands in a **personal knowledge graph** per traveler, joined into a trip graph — exactly the structure Balog & Kenter's PKG research agenda describes: the user as central node, entities/attributes/relations around them, each edge carrying **provenance** and **confidence** ([PKG research agenda](https://www.researchgate.net/publication/336110714_Personal_Knowledge_Graphs_A_Research_Agenda); [PKG ecosystem survey](https://arxiv.org/html/2304.09572v2); [personal attribute prediction from conversations](https://arxiv.org/pdf/2209.09619)). Four layers, in strictly increasing depth:

| Layer | Contents | Semantics | How obtained |
|---|---|---|---|
| **L1 Constraints** | allergies, dietary (GF), mobility limits, young child, nap/rest needs, medical, budget ceiling, fixed dates, fears/phobias | **Hard. Veto. Never inferred, never decayed, always confirmed verbatim.** | Direct closed questions (the only layer where forms are correct) |
| **L2 Rhythms** | chronotype (early/late), energy curve (all-day steady vs burst+rest), pace tolerance, alone-time needs, planning appetite (scripted vs loose) | Soft but high-leverage — shapes every day's skeleton | 1–2 lean questions + inference from stories; confirmed by reflection |
| **L3 Desires** | feelings sought (Black-Tomato-style pillar), peak-moment type, food adventurousness, novelty vs comfort lean, interests/anti-interests | Preferences with weights; tie-broken by forced-choice leans | Episodic story + laddering (mostly silent) + late forced choice |
| **L4 Identity & occasion** | what this trip *is* (celebration / escape / reunion), relationships among travelers, values ladder ends (belonging, mastery, wonder…), self-image ("we're the kind of family that…") | The composer's north star; rarely asked directly | Inferred from episode choice + occasion question; reflected back for confirmation ("this trip sounds like a deep breath") |

Every graph edge carries: `source ∈ {stated, reflected-and-confirmed, inferred, observed(inbox/behavior)}`, `confidence`, `trip-scoped vs durable`, `timestamp`. Durable nodes (values, constraints, rhythms) persist across trips — the second trip's interview should be *shorter* than the first, and say so ("Last time, mornings were yours. Still true?"). Ambivalences are first-class nodes (`tension: rest ↔ adventure`) that the composer must *honor*, not resolve.

### 2.2 Question inventory (in the Excurse voice)

**Opening — the episodic anchor (always asked, always first after framing):**
1. *"Tell me about a trip you still think about. What's the moment that comes back?"* — (episode → silent laddering: peaks, companions, tempo, values; Plog/TCL calibration)
2. Mini-tour follow-up, chosen adaptively from the answer: *"Walk me through that morning."* / *"Who were you with when that happened?"* (Spradley mini-tour; only if the story is thin: the negative CIT probe — *"And a day of travel you'd never repeat?"* — dealbreakers surface faster from bad memories than good ones)

**Occasion & feeling (one question, huge information gain):**
3. *"What should this trip do for you — celebrate something, get you away, bring people back together? Or something harder to name?"* (Excurse already has this; keep it. Free-text answers here should be embedded against a feelings taxonomy à la the five pillars, not keyword-matched)
4. *"When it's over, what's the one moment you want to be able to tell someone about?"* (peak–end: gives the composer the peak to engineer)

**Rhythms (two leans max):**
5. *"Early mornings or late nights?"* — existing; keep.
6. *"By mid-afternoon on a good travel day: still going, or somewhere quiet with a drink?"* (energy curve + rest needs, disguised)
7. *"How much should be decided before you land — most of it, or just enough?"* (planning appetite; calibrates how much white space the guide should have)

**Desire tie-breakers (forced-choice, late, only when the model is genuinely torn):**
8. *"Either is fine. I just want your lean:"* comfort vs new / famous thing vs no-name thing / one perfect meal vs five small ones. (Pairwise beats rating; never more than 2–3 of these; each must pass the plan-delta test before being asked)

**Constraints sweep (closed, quick, framed as care not bureaucracy):**
9. *"Now the practical ones, so nothing goes wrong: anything you can't eat — allergies, gluten? Anyone whose knees or lungs I should plan around? Little ones who nap?"* — Excurse already asks these; the framing matters: *"so I can look after you"* not *"required fields."* Read back verbatim at the end. **Constraints are the one place to over-ask rather than infer.**

**Group extension (per additional traveler, 90-second version):**
10. To each invited traveler, separately, in the app: the episodic anchor (short form: *"one moment from a past trip you'd want again"*), one rhythm lean, one veto (*"anything that would ruin a day for you?"*), constraints. To the organizer about others only as fallback, and marked `source: proxy` with low confidence.

**Closing summary (always):**
11. An MI-style summary in the product's voice: *"Here's what I heard: mornings are yours, the afternoons belong to the kids, nobody performs enthusiasm at dinner. One allergy, one nap, one birthday. I'll go compose. You can correct any of this in You."* — the traveler edits the model for free, anticipation begins, and the *"Hand off to research & compose"* moment feels earned.

### 2.3 Sequencing policy

1. **Frame** (one line: what this is, how long, what they'll get). 2. **Episode** (open). 3. **Adaptive mini-tour follow-ups** — the LLM extracts candidate graph edges from the story, then selects at most 2 follow-ups by the EVPI rule below. 4. **Occasion + peak.** 5. **Rhythm leans.** 6. **Forced-choice tie-breakers** only for surviving ambiguities. 7. **Constraints sweep.** 8. **Summary + confirm.**

Story before slots, warm before practical, forced choice only after hypotheses exist, constraints near the end but never skippable, summary always. Target: **7–9 traveler turns, under 5 minutes** for the primary; ~4 turns for invited travelers. Everything else is progressive: post-trip one-liners ("What was the actual best hour?") feed the durable graph, and the Glide inbox is a continuous implicit-elicitation channel — every saved TikTok/Maps link is an *observed* preference edge (Gen Z plans travel by saving social posts — 84% use social for travel inspiration ([Condor Ferries stats](https://www.condorferries.co.uk/gen-z-travel-statistics)); the inbox is Excurse's native implicit signal and should be mined, not just filed).

### 2.4 The next-question rule and stopping criteria

Between turns, the engine maintains the trip graph plus a set of **candidate plan hypotheses** (sketch itineraries). For each candidate question, estimate: *would the plausible range of answers change which hypothesis wins, or materially reshape a day?*

- **Ask** only if yes (specification uncertainty, high EVPI).
- **Research instead** if the uncertainty is about the world, not the traveler (model uncertainty — e.g., "is the Huntington open Tuesdays" is never a user question).
- **Default + disclose** if EVPI is low but nonzero: make the call, surface it as an editorial choice in the guide ("I leaned quiet over famous — say the word and I'll flip it"), which converts residual uncertainty into the Black-Tomato-style iteration loop.

**Stop when** (any): (a) the plan-delta test fails for every remaining candidate question — stability-based stopping; (b) the turn budget is reached (9 primary / 4 secondary) — budget-based; (c) engagement signals decay (short answers, "whatever works") — the MI move is to stop immediately and summarize, never to push. **Constraints override stopping:** the interview may never end with L1 unasked.

### 2.5 Ask vs. infer silently

| Infer silently (confirm via reflection at most) | Ask explicitly (never infer) |
|---|---|
| Values ladder (belonging, wonder, mastery…) | Allergies, dietary, medical, mobility |
| Novelty–comfort position, TCL level | Fixed dates, budget ceiling |
| Tempo, energy curve (from story verbs) | Occasion (celebration vs escape — too costly to get wrong) |
| Food adventurousness (from what they ate in the story) | Vetoes ("what would ruin a day") |
| Group dynamics, who needs alone time | Whether the trip is a surprise for someone |
| Aesthetic taste (from inbox saves) | Anything the model would state as fact in the guide |

Rule of thumb from the clarification literature: models detect ambiguity but under-ask ([Knowing but Not Showing](https://arxiv.org/pdf/2605.25284)) — so the ask/infer decision must be an explicit policy gate, and *silent inferences must be visible and editable* in "You" (inspectable graph → trust, and corrections are free training data).

### 2.6 Group protocol

- Interview each traveler **separately** (private link off the invite); the organizer never speaks for adults who can speak for themselves. Children get a playful 2-question version, or a proxy interview with `proxy` provenance — but note the research: kids' actual influence is real and parents misreport the family's own dynamics ([family decisions](https://link.springer.com/article/10.1007/s11628-025-00579-1)).
- **Constraints aggregate by least misery** (any allergy binds the table; any mobility limit binds the trek). **Shared meals/activities: average-without-misery** (nothing below anyone's veto line). **Day themes and free slots: fairness rotation** — each traveler's peak desire gets a visible moment in the guide, *attributed* ("Thursday afternoon is Maya's"), which converts aggregation math into a felt gift.
- Detect and *name* conflicts in the composer's voice rather than splitting differences invisibly: "You want dawn; he wants midnight. So mornings are yours alone, and the guide says so."

### 2.7 Voice rules for the interviewer

One question per screen. Reflect before you ask (every question after the first begins by proving it heard the last answer). Affirm specifics, never flatter. Offer the out ("either is fine," skippable everything). No emoji, no exclamation marks, no "awesome." Show the payoff (as answers land, let the trip visibly begin to take shape — a day skeleton sketching itself is worth three more minutes of patience). End with the summary and the handoff line the product already owns: *"A few quiet questions, then I research and compose it."* The interview is the trip's first pleasure — anticipation is the cheapest joy Excurse can manufacture ([Greater Good](https://greatergood.berkeley.edu/article/item/eight_steps_to_a_happier_vacation)).

---

## 3. Sources

Preference elicitation & CRS: [Kostric et al. usage-related questions](https://arxiv.org/abs/2111.13463) · [ACM TORS version](https://dl.acm.org/doi/full/10.1145/3629981) · [CRS survey](https://dl.acm.org/doi/fullHtml/10.1145/3453154) · [Tailoring conversational styles](https://www.researchgate.net/publication/392693277_Should_We_Tailor_the_Talk_Understanding_the_Impact_of_Conversational_Styles_on_Preference_Elicitation_in_Conversational_Recommender_Systems) · [LAPS multi-session preference dialogues](https://arxiv.org/abs/2405.03480)
Adaptive questioning & stopping: [Structured Uncertainty guided Clarification](https://arxiv.org/abs/2511.08798) · [INTENT-SIM explainer](https://datasciocean.com/en/paper-intro/intent-sim/) · [Knowing but Not Showing](https://arxiv.org/pdf/2605.25284) · [Modeling future turns](https://arxiv.org/html/2410.13788v2) · [Explainable AL for preference elicitation](https://arxiv.org/abs/2309.00356) · [Stopping via generalization bounds](https://proceedings.mlr.press/v108/ishibashi20a.html) · [Stability-based stopping](https://dl.acm.org/doi/10.1145/3125645)
Interviewing craft: [MINT on MI](https://motivationalinterviewing.org/understanding-motivational-interviewing) · [OARS](https://www.issup.net/knowledge-share/resources/2019-10/motivational-interviewing-open-questions-affirmation-reflective) · [Laddering (UXmatters)](https://www.uxmatters.com/mt/archives/2009/07/laddering-a-research-interview-technique-for-uncovering-core-values.php) · [Means-end revisited](https://onlinelibrary.wiley.com/doi/full/10.1002/mar.21521) · [Ski-tourism MEC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9780482/) · [Spradley notes](http://www.analytictech.com/mb870/handouts/notes_on_spradley.htm) · [CIT](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7249649/) · [NN/g user interviews](https://www.nngroup.com/articles/user-interviews/)
AI interviewers: [Stanford HAI generative agents](https://hai.stanford.edu/news/ai-agents-simulate-1052-individuals-personalities-impressive-accuracy) · [AI Conversational Interviewing](https://arxiv.org/html/2410.01824v1) · [Sci Reports multi-model eval](https://www.nature.com/articles/s41598-026-46517-7) · [LSE AI-led interviews](https://www.thevoiceofuser.com/the-strongest-paper-yet-on-ai-led-interviewing/)
Conversation design & budget: [Google conversation design](https://developers.google.com/assistant/conversation-design/learn-about-conversation) · [Survicate 21,863-survey analysis](https://survicate.com/blog/how-many-questions-should-surveys-have/) · [Survicate completion benchmarks](https://survicate.com/reports/survey-completion-rate-benchmarks/) · [Progressive profiling](https://www.descope.com/learn/post/progressive-profiling) · [Pairwise comparison](https://www.opinionx.co/blog/pairwise-comparison)
Groups & family: [Consensus models survey (UMUAI)](https://link.springer.com/article/10.1007/s11257-023-09380-z) · [Group RS intro](https://towardsdatascience.com/an-introduction-to-group-recommender-systems-8f942a06db56/) · [LLM-enhanced GRS](https://arxiv.org/pdf/2507.19283) · [GroupTravelBench](https://arxiv.org/html/2605.25200v1) · [Family tourism decisions](https://link.springer.com/article/10.1007/s11628-025-00579-1) · [Parents vs child decision-maker](https://www.sciencedirect.com/science/article/abs/pii/S0261517703000931)
Travel psychology & industry: [Push–pull & eco-intentions](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12729613/) · [Travel motivation review](https://tdmujournal.vn/uploads/paper/files/21-Tran-Cam-Thi.pdf) · [Black Tomato Feelings Engine](https://www.blacktomato.com/feelings-engine/) · [Forbes on Feelings Engine](https://www.forbes.com/sites/alexandrakirkman/2025/02/14/using-ai-to-plan-travel-black-tomatos-new-tool-may-reinvent-how-you-book/) · [Globetrender](https://globetrender.com/2025/02/13/black-tomato-launches-emotion-driven-travel-offering/) · [Forbes Black Tomato at 20](https://www.forbes.com/sites/danielscheffler/2026/01/24/black-tomato-at-20-is-designing-travel-that-moves-hearts--minds/) · [TMR 25 qualifying questions](https://www.travelmarketreport.com/retail-strategies/articles/25-qualifying-questions-to-help-you-nail-your-clients-vacation-plans) · [TIS 8 questions](https://travelindustrysolutions.com/how-to-qualify-a-travel-client-8-powerful-questions-to-ask/) · [Peak–end rule (NN/g)](https://www.nngroup.com/articles/peak-end-rule/) · [Greater Good on anticipation](https://greatergood.berkeley.edu/article/item/eight_steps_to_a_happier_vacation) · [Gen Z social-save behavior](https://www.condorferries.co.uk/gen-z-travel-statistics)
Knowledge graphs: [Balog & Kenter PKG agenda](https://www.researchgate.net/publication/336110714_Personal_Knowledge_Graphs_A_Research_Agenda) · [PKG ecosystem survey](https://arxiv.org/html/2304.09572v2) · [Personal attribute prediction from conversations](https://arxiv.org/pdf/2209.09619)
