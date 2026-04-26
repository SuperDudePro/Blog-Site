import type { Domain } from "../types";

export const DOMAINS_META = {
  "title": "10-Domain Learning Outcomes Framework",
  "subtitle": "Broader map, not a second contract",
  "intro": [
    "The Floor document defines the non-negotiable minimum—what an 18-year-old must be able to do. This 10-Domain Framework describes the fuller landscape of each domain: core outcomes, key competencies, and evidence examples. Not everything here is required; the Floor document is the final word on what's mandatory. This document is the menu of possibilities and planning anchors for getting there.",
    "Important: The 10 domains describe the broader landscape of capabilities this system engages with over time. Inclusion here does not by itself make a competency mandatory for Floor completion; the Floor document defines the minimum contract."
  ],
  "principles": [
    "Interdisciplinary Thinking – Learning never happens in silos; we actively connect ideas across domains.",
    "Learner Ownership – Autonomy, metacognition, and goal-setting drive authentic growth."
  ],
  "recap": [
    "1. Literacy & Communication — Reading, writing, speaking, media literacy",
    "2. Mathematics & Logic — Algebra, reasoning, applied problem solving",
    "3. Scientific Thinking & Observation — Science literacy, experimentation, sustainability",
    "4. Social Studies & Civics — History, government, culture, service",
    "5. Philosophy & Ethics — Values, argument, ambiguity tolerance",
    "6. Economics & Finance — Personal finance, markets, entrepreneurship",
    "7. Health & Physical Development — Wellness, fitness, safety, first aid",
    "8. Creative Expression — Arts, storytelling, creative risk-taking",
    "9. Technology, Media & AI Literacy — Digital fluency, AI collaboration, safety",
    "10. Life Skills & Project Execution — Real-world competence, planning, reflection"
  ],
  "appendix": [
    "All competencies can be met with low- or no-cost resources (public libraries, open-source software, community sports facilities, recycled materials, maker-spaces). Higher-budget tools (e.g., advanced wearables, paid AI models) are optional enrichments, not prerequisites."
  ]
};

export const DOMAINS = [
  {
    "slug": "literacy-communication",
    "title": "Literacy & Communication",
    "number": "1",
    "coreOutcomes": [
      "Read & interpret fiction/non-fiction at an adult level",
      "Write clearly, persuasively & reflectively",
      "Speak effectively to diverse audiences",
      "Detect media bias & persuasive techniques",
      "Develop meaningful competence in at least one additional language; navigate multilingual situations using tools and local help when needed"
    ],
    "competencies": [
      "Reading comprehension (fiction, non-fiction, how-to)",
      "Literary interpretation & analysis",
      "Structured writing (essays, research, persuasive letters)",
      "Practical writing (e-mails, résumés, proposals)",
      "Reflective writing (journals, blogs)",
      "Verbal communication (clarity, persuasion, debate)",
      "Active listening, discussion skills & fair representation of others' views",
      "Presentation & visual communication",
      "Media literacy, critical consumption & recognizing persuasive / manipulative language",
      "Tone–purpose–audience awareness",
      "Multilingual proficiency & cultural fluency"
    ],
    "evidence": "reading logs, published pieces, speech videos, multilingual conversations, etc."
  },
  {
    "slug": "mathematics-logic",
    "title": "Mathematics & Logic",
    "number": "2",
    "coreOutcomes": [
      "Master Algebra I & Geometry",
      "Apply quantitative reasoning in real-world problems",
      "Use logic & pattern recognition to solve novel tasks"
    ],
    "competencies": [
      "Algebraic fluency & equation solving",
      "Spatial & geometric reasoning",
      "Data analysis & estimation",
      "Everyday mental math, estimation & numerical sanity-checking",
      "Applied math in budgeting, travel & probability",
      "Statistics & interpreting data sets",
      "Risk, probability & trade-off reasoning",
      "Pattern recognition & logical reasoning",
      "Procedural / algorithmic reasoning (designing clear step-by-step processes)",
      "Debugging processes & structured problem-solving",
      "Logic-puzzle fluency (e.g., LSAT style)"
    ],
    "evidence": "solved problems, budget sheets, code snippets, game-design docs, etc."
  },
  {
    "slug": "scientific-thinking-observation",
    "title": "Scientific Thinking & Observation",
    "number": "3",
    "coreOutcomes": [
      "Think like a scientist — ask, hypothesize, test, observe",
      "Demonstrate everyday scientific literacy",
      "Understand key biological, physical, chemical & environmental systems"
    ],
    "competencies": [
      "Scientific method & experimental design",
      "Hypothesis creation & testing",
      "Observation, documentation & inference",
      "Distinguishing correlation, causation, anecdote & consensus",
      "Science reading & source validation",
      "Understanding that scientific knowledge updates and holding conclusions provisionally as evidence improves",
      "Evaluating scientific headlines, claims & overstatement",
      "Botany & food-growing skills",
      "Earth science & sustainability",
      "Astronomy, geology & weather patterns",
      "Basic chemistry & material interactions",
      "Animal care & husbandry basics",
      "Climate systems & environmental ethics"
    ],
    "evidence": "lab write-ups, garden logs, citizen-science uploads, field sketches, etc."
  },
  {
    "slug": "social-studies-civics",
    "title": "Social Studies & Civics",
    "number": "4",
    "coreOutcomes": [
      "Grasp major historical narratives & civic structures",
      "Engage with diverse cultures & worldviews",
      "Apply historical thinking to current events"
    ],
    "competencies": [
      "U.S. civics (local–state–federal)",
      "Law & rights (personal, business, civic, international)",
      "Global & regional history",
      "Cultural awareness through travel & literature",
      "World religions & belief systems",
      "Geography & global interconnections",
      "Cause–context–consequence analysis",
      "Media, civic interpretation, memory & historical revisionism",
      "Political systems, institutions & change over time",
      "Power structures, colonization, resistance & how power is gained, used and challenged",
      "Philippines & Ireland history / cultural fluency (family heritage)",
      "Community engagement & service"
    ],
    "evidence": "travel journals, debate clips, service reflections, mapping projects, etc."
  },
  {
    "slug": "philosophy-ethics",
    "title": "Philosophy & Ethics",
    "number": "5",
    "coreOutcomes": [
      "Think critically about values, purpose & belief",
      "Understand & evaluate arguments (incl. one's own)",
      "Navigate ambiguity & conflicting perspectives"
    ],
    "competencies": [
      "Personal philosophy & purpose statements",
      "Moral reasoning frameworks",
      "Critical questioning & skepticism",
      "Bias identification & analysis",
      "Debate skills; steel-manning opposition",
      "Logical fallacies & argument structure",
      "Ethical dilemmas & decision-making",
      "Distinguishing emotional reaction from moral judgment",
      "Cultural–historical context awareness",
      "Comparative religious and secular philosophy",
      "Self-reflection & \"know-thyself\" praxis",
      "Ambiguity tolerance",
      "Reasoning through disagreement without requiring certainty"
    ],
    "evidence": "values maps, recorded debates, reflective essays, ethics case briefs, etc."
  },
  {
    "slug": "economics-finance",
    "title": "Economics & Finance",
    "number": "6",
    "coreOutcomes": [
      "Make thoughtful, independent decisions about money & value",
      "Understand & engage with economic systems & trade-offs"
    ],
    "competencies": [
      "Personal finance (budgeting, credit, loans, investing)",
      "Contracts, leases, paychecks & other practical financial documents",
      "Taxes, filing basics & understanding simple tax obligations",
      "Cryptocurrency & emerging financial tools (optional / context-specific)",
      "Delayed-gratification decision-making",
      "Insurance, financial risk & protection",
      "Economic philosophies & schools of thought",
      "Trade systems & macroeconomic basics",
      "Economic history & societal impact",
      "Opportunity cost, trade-offs & value beyond money",
      "Entrepreneurial thinking & micro-venture creation",
      "Passion-project ledger & performance review",
      "International banking, currency exchange & travel budgeting"
    ],
    "evidence": "monthly budgets, investment journal, business-model canvas, trip cost sheets, etc."
  },
  {
    "slug": "health-physical-development",
    "title": "Health & Physical Development",
    "number": "7",
    "coreOutcomes": [
      "Maintain lifelong physical & mental wellness",
      "Understand the body–mind–habit performance loop"
    ],
    "competencies": [
      "Nutrition & fueling strategies",
      "Cooking real meals & everyday food competence (closely linked to Domain 10 food prep)",
      "Exercise science & fitness routines",
      "Sports & athletic games",
      "Martial arts & self-defense",
      "Swimming, gymnastics & functional movement",
      "Rest, recovery & sleep hygiene",
      "Stress management, mindfulness & regulation practices (breathwork, journaling, yoga)",
      "Personal hygiene & upkeep",
      "Body ownership, substance literacy & informed help-seeking",
      "Sexual health & bodily autonomy",
      "First aid & emergency response (CPR, wilderness first aid)",
      "Goal-setting → top-10% age-group fitness targets",
      "Social–emotional learning"
    ],
    "evidence": "fitness-test logs, meal plans, belt-test videos, first-aid certs, wellbeing journal"
  },
  {
    "slug": "creative-expression",
    "title": "Creative Expression",
    "number": "8",
    "coreOutcomes": [
      "Appreciate & explore diverse creative forms",
      "Express ideas & emotions through multiple media"
    ],
    "competencies": [
      "Visual arts (2-D, digital, sculpture)",
      "Performing arts (drama, dance, movement)",
      "Storytelling & narrative structure",
      "Creative writing & poetry",
      "Music appreciation & creation",
      "Cross-cultural art interpretation",
      "Aesthetic vocabulary & critique",
      "Cross-medium experimentation",
      "Creative confidence & risk-taking",
      "Finishing, revising & iterating on creative work",
      "Creative problem-solving through prototyping",
      "Digital content (photo, video, v-log, podcast)",
      "Building and sustaining at least one satisfying creative outlet"
    ],
    "evidence": "portfolio pieces, recorded performances, process journals, peer critiques"
  },
  {
    "slug": "technology-media-ai-literacy",
    "title": "Technology, Media & AI Literacy",
    "number": "9",
    "coreOutcomes": [
      "Use tech as a tool, not a crutch",
      "Collaborate effectively with AI & digital systems",
      "Stay safe, skeptical & adaptive in a fast-moving digital world"
    ],
    "competencies": [
      "Digital navigation & software fluency",
      "AI collaboration (GPTs, copilots, automation) without outsourcing thinking",
      "Online safety, privacy, phishing / scam awareness & digital rights",
      "Managing digital identity & reputation",
      "Screen-balance & tech-life boundaries",
      "Handling distraction, info-fatigue & overwhelm",
      "Psych & social impacts of platforms",
      "Troubleshooting & hardware independence",
      "Information literacy (search, source tracing, vetting, cross-checking)",
      "Digital creation: video, podcast, music, app, website",
      "Understanding digital trade-offs & analog fallbacks",
      "Attention control, platform incentives & tech-life boundary setting"
    ],
    "evidence": "code commits, content channels, security audits, screencast tutorials, etc."
  },
  {
    "slug": "life-skills-project-execution",
    "title": "Life Skills & Project Execution",
    "number": "10",
    "coreOutcomes": [
      "Be capable, adaptable & self-reliant in real-world settings",
      "Execute ideas from concept to reality, managing time & resources"
    ],
    "competencies": [
      "Goal-setting & time management",
      "Planning, scheduling & logistics",
      "Follow-through, responsibility & execution under ambiguity",
      "Household management (cleaning, maintenance, food prep)",
      "Survival skills & crisis problem-solving",
      "Driving, navigation, travel independence & unfamiliar-system navigation",
      "Operating tools, appliances & machinery",
      "DIY building & repairs",
      "Legal rights & systems for international travelers",
      "Self-advocacy in medical, legal, educational & workplace systems",
      "Conflict resolution & interpersonal repair",
      "Collaborative teamwork & shared execution",
      "Navigating ambiguity & open-ended problems",
      "Project ownership & accountability",
      "Learning-how-to-learn (metacognition strategies)",
      "Documentation & portfolio building (meta-skill)",
      "Bringing ideas to real-world implementation",
      "Career exploration, internships & apprenticeships as real-world implementation pathways"
    ],
    "evidence": "trip plans, repair photos, time-use dashboards, capstone retrospectives, etc."
  }
] satisfies Domain[];
