"use strict";
(() => {
  const asset = (path) => window.__VO_EMBEDDED_ASSETS__?.[path] || path;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [
    ...root.querySelectorAll(selector),
  ];
  const storage = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch {
        /* Private browsing remains functional. */
      }
    },
  };
  let language = storage.get("vo-language") === "en" ? "en" : "pt";
  let activeFilter = "all";
  let toastTimer;
  let requestTimer;
  let retryCount = 0;
  let activeProject;
  let dialogOrigin;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let motionDisabled =
    storage.get("vo-motion") === "off" || prefersReduced.matches;
  const originals = new Map();
  $$("[data-i18n]").forEach((node) => {
    if (!originals.has(node.dataset.i18n))
      originals.set(node.dataset.i18n, node.innerHTML);
  });
  const english = {
    skip: "Skip to content",
    brandSub: "BACKEND DEVELOPER",
    navStory: "Story",
    navProjects: "Projects",
    navCredentials: "Credentials",
    navContact: "Contact",
    navLabel: "Main navigation",
    commandLabel: "Open quick navigation",
    issue: "PORTFOLIO / 2026 EDITION",
    heroLocation: "BRAZIL · SOFTWARE & INTEGRATIONS",
    prologue: "PROLOGUE — HI, I’M VINICIUS",
    heroLine1: "CODE WITH",
    heroLine2: 'PURPOSE<span class="word-dot">.</span>',
    heroRole: "Software developer. Backend as a foundation.",
    heroDescription:
      "I turn real problems into APIs, automations, and systems that make sense. Every project is a chapter. The next one could be with you.",
    exploreProjects: "Explore projects",
    quickView: "Quick view",
    coverLabel: "Manga-inspired panel composition with a portrait of Vinicius",
    coverTitle: "ONE DEV. MANY POSSIBILITIES.",
    speech: "WHAT IF WE<br>BUILT SOMETHING<br>BETTER?",
    portraitNote: "THE PROTAGONIST",
    coverCaption: "FROM IDEA TO THE REAL WORLD.",
    coverBottom: "THE STORY IS JUST BEGINNING",
    scrollStory: "Scroll to discover the story",
    builtWith: "BUILT WITH INTENT. NO SHORTCUTS.",
    storyKicker: "CHAPTER ONE — THE ORIGIN",
    storyTitle: "CURIOSITY<br>BECAME A PATH.",
    storyIntro:
      "Between code, people, and real problems, I found where I want to build: behind the scenes that make everything work.",
    originTitle: "The first page was at ETEC.",
    originBody:
      "At ETEC Professor Armando José Farinazzo, I studied Chemistry from 2017 to 2019. In 2019, I joined the CROWS Formula Drone team in administration and operations. Observing assembly and programming sparked my curiosity about technology.",
    award: "AUXILIUM",
    awardPlace: "2ND PLACE",
    awardEvent: "ACADEMIC HACKATHON · ROBOTICS · 2022",
    journeyLabel: "EDUCATION · ONE CHAPTER AT A TIME",
    ciplafeDate: "JUL 2026 — PRESENT",
    ciplafeRole: "Junior Software Developer",
    ciplafeBody:
      "TOTVS Protheus, ADVPL/TLPP, SQL Server, and RM BI. Integrations and internal tools with Python and Node.js.",
    sesiRole: "Internship · Backend & IT",
    sesiBody:
      "Python and PostgreSQL applications, process automation, and infrastructure support.",
    education: "Technology degree in Internet Systems.",
    philosophyTitle: "AI as a tool.<br>Judgment as a foundation.",
    philosophyBody:
      "I use AI-assisted development, MCP, and Spec-Driven Development to explore and implement. Decisions, review, and understanding the code remain part of the work.",
    philosophyFooter: "LEARNING IS PART OF THE PROCESS.",
    projectsKicker: "CHAPTER TWO — IN ACTION",
    projectsTitle: "LESS TALK.<br>MORE BUILDING.",
    projectsIntro:
      "Projects to open, explore, and understand. Step into the code and discover the decisions behind each solution.",
    filterLabel: "Filter projects",
    filterAll: "All",
    keelArtLabel: "SYSTEMS IN BALANCE",
    keelKind: "INTERACTIVE DEMO",
    keelSummary:
      "A digital wallet where every cent has a story. Double-entry ledger, idempotency, and hexagonal architecture.",
    readCase: "Explore the project",
    demo: "Demo",
    starwarsArtLabel: "DATA FROM ANOTHER GALAXY",
    starwarsSummary:
      "Python, data, and a galaxy to explore. An API with asynchronous HTTPX, caching, pagination, and serverless deployment.",
    auxiliumArtLabel: "TECHNOLOGY THAT CONNECTS",
    auxiliumKind: "TEAM PROJECT · PROTOTYPE",
    auxiliumSummary:
      "Connecting people who want to help with people who need it. A donations app built at MigrateDev, aligned with SDG 10.",
    auxiliumTag1: "React Native / Expo",
    auxiliumTag2: "Interface & navigation",
    auxiliumTag3: "Social impact",
    auxiliumYears: "ORIGIN 2022 · MIGRATEDEV 2023–2025",
    moreProjects: "The code continues beyond these panels.",
    allRepositories: "All repositories",
    sandboxKicker: "INTERLUDE — HANDS ON CODE",
    sandboxTitle: "Make a request.<br>See the reasoning.",
    sandboxIntro:
      "Vinicius Oliveira’s lab, in developer mode. Explore profile, contact, and backend concepts through illustrative local responses: no server, account, or data transmission.",
    sandboxNote:
      "Anime missions and amounts are fictional. The name and links are mine; this experiment does not represent a deployed backend or professional availability.",
    endpointLabel: "Choose an experiment",
    run: "Run →",
    healthExplanation:
      "A health check tells you whether the service is available.",
    skillsKicker: "CHAPTER THREE — THE TOOLKIT",
    skillsTitle: "THE TOOLS<br>BEHIND THE STORY.",
    skillsIntro:
      "Technologies I use at work and in projects. The context changes. The drive to understand doesn’t.",
    skillBackend: "CLEAR RULES. RELIABLE INTERFACES.",
    skillDataTitle: "Data & ERP",
    skillData: "CONNECTING SYSTEMS TO THE REAL WORLD.",
    skillCloud: "FROM LOCAL ENVIRONMENT TO DELIVERY.",
    skillPracticeTitle: "Engineering practice",
    skillPractice: "AUTOMATION WITH REVIEW AND INTENT.",
    credentialsKicker: "CHAPTER FOUR — KEEP LEARNING",
    credentialsTitle: "KNOWLEDGE<br>UNDER CONSTRUCTION.",
    credentialsIntro:
      "Courses and credentials are part of the journey. Each title includes its type and where to check it.",
    courseCompletion: "COMPLETED COURSES",
    viewCertificates: "View certificates",
    cyberTitle: "Introduction to Cybersecurity",
    aiCourseTitle: "AI & development",
    credentialNote:
      "Learning badges, issuer credentials, and completed courses are listed separately. Check each issuer for current status.",
    certificateCollection: "Courses & certificates",
    contactKicker: "NEXT CHAPTER — THE CONVERSATION",
    contactTitle: "GOOD STORIES<br>START WITH A <span>HELLO.</span>",
    contactDescription:
      "An opportunity, an idea, or an interesting problem. Let’s talk about what we can build.",
    copyEmail: "Copy email",
    backTop: "Back to top",
    footer: "ONE CHAPTER AT A TIME.",
    keyboard: "Keyboard shortcuts",
    closeLabel: "Close",
    quickKicker: "THE ESSENTIALS, STRAIGHT TO THE POINT.",
    quickRole: "Junior Software Developer · Backend",
    quickSummary:
      "Backend as a foundation, with experience in APIs, business systems, automation, interfaces, and infrastructure. Python, JavaScript/TypeScript, Node.js, SQL, and other languages depending on the project.",
    quickCurrent: "CURRENTLY",
    quickCurrentValue:
      "Junior Developer at Ciplafe Móveis · Jul/2026 – present",
    quickEducation: "EDUCATION",
    quickEducationValue:
      "Technology degree in Internet Systems · FATEC · Jul/2026",
    quickProjects: "EXPLORE",
    emailMe: "Send an email",
    commandTitle: "WHERE TO NEXT?",
    commandSearchLabel: "Search destinations",
    commandPlaceholder: "Find a chapter or action…",
    commandHint: "↑ ↓ navigate · Enter open · Esc close · Ctrl/⌘ K search",
    awsLearningType: "LEARNING BADGES",
    awsBadgeTitle: "AWS learning paths",
    awsBadgeBody:
      "Public badges shared on my GitHub profile. Cloud Quest is a learning badge, not an AWS certification exam.",
    oracleType: "ISSUER CREDENTIALS · 2023",
    oracleTitle: "Oracle Cloud foundations",
    oracleBody:
      "Foundations credentials from 2023. Open the issuer’s page to check the credential and its current status.",
    coursesType: "COMPLETED COURSES",
    coursesTitle: "Always learning",
    coursesBody:
      "AWS Lambda & API Gateway · Cisco Introduction to Cybersecurity · Prompt Engineering · Spec-Driven Development.",
    badgeLink: "Open on Credly",
    oracleLink: "Open issuer record",
    collectionLink: "View course collection",
  };
  Object.assign(english, {
    dragonMotionConsent: "Full motion demonstration in this scene",
    dragonArtTitle: "Serpentine paper dragon inspired by Chinese dragons",
    dragonLoopLabel: "Repeat the flight with a different credential",
    dragonInspect: "Inspect the dragon ↗",
    dragonInspectTitle: "FOLD BY FOLD.",
    dragonInspectIntro:
      "Branching antlers, overlapping scales, claws, and paper strands. Explore the guardian up close.",
    dragonInspectViews: "Dragon illustration views",
    dragonInspectHead: "Face & antlers",
    dragonInspectBody: "Scales & claws",
    dragonInspectTail: "Tail & folds",
    dragonInspectWhole: "Whole dragon",
    dragonInspectNote:
      "A static illustration study. The flying sequence pauses while you look closer.",
    oct2025: "OCT 2025",
    openSourceLabel: "OPEN SOURCE",
    insideProject: "Inside the project",
    keelInline:
      "Domain logic separated from HTTP and persistence. Integer money, balanced entries, and retries without duplicate operations. The demo runs the actual domain code with in-memory storage.",
    starwarsInline:
      "Asynchronous external-data access, validated models, and per-resource caching. Search, rankings, and pagination organize exploration of characters, films, and planets.",
    auxiliumInline:
      "Originated at ETEC’s 2022 hackathon; my MigrateDev involvement was May 2023–January 2025. The public prototype implements interfaces, navigation, and form validation. Backend, chat, matching, and payment integrations remain planned in its README.",
    workKicker: "PROFESSIONAL JOURNEY · EDUCATION IS A SEPARATE CHAPTER",
    workTitle: "From software<br>to the operation.",
    workSummary:
      "Backend is my foundation: APIs, integrations, automation, and business systems. My toolkit also includes web/mobile interfaces, data, and infrastructure. Understanding the whole problem helps me build better solutions.",
    workDirection:
      "I want to keep broadening this toolkit in software engineering, cloud, and useful products. Contact channels for project and opportunity discussions are in the final chapter.",
    workCurrent: "JUL 2026 — PRESENT",
    workCiplafe1:
      "Customizing and maintaining TOTVS Protheus with ADVPL/TLPP: routines, fields, patches, and environment evolution.",
    workCiplafe2:
      "SQL Server and TOTVS RM BI queries to structure information used in internal processes.",
    workCiplafe3:
      "Python automations and Node.js tools, including a reception entry/exit system that replaced spreadsheets.",
    workSesi1:
      "Python and PostgreSQL backend applications for educational and internal systems.",
    workSesi2:
      "Administrative process automation, programming mentorship, and Windows/Linux and infrastructure support.",
    githubKicker: "BEHIND THE SCENES, IN OPEN SOURCE",
    githubTitle: "OPEN THE REPOSITORY.<br>UNDERSTAND THE BUILD.",
    githubIntro:
      "Readmes, architecture decisions, and implementations you can inspect. From the initial problem to the structure of the code, the work is here.",
    githubProfile: "Visit my profile",
    repoKeel:
      "A financial ledger with an infrastructure-independent domain. Explore decisions about double-entry bookkeeping, idempotency, and locking.",
    repoStarwars:
      "A Python backend for Star Wars data with validation, caching, pagination, and different cloud execution options.",
    repoAnalytics:
      "Restaurant analytics: a FastAPI API, React/TypeScript dashboard with ECharts, and PostgreSQL queries with materialized views.",
    repoDecisions: "Architecture decisions ↗︎",
    repoDemo: "Browser demo ↗︎",
    repoTests: "Explore the tests ↗︎",
    repoSource: "Explore the code ↗︎",
    githubSnapshot: "DESCRIPTIONS BASED ON PUBLIC READMES · 06 OCT 2026",
    architectureKicker: "FOLLOW THE REQUEST’S PATH",
    architectureTitle: "ONE SYSTEM.<br>FOUR PANELS.",
    architectureIntro:
      "Select each layer to understand its responsibility, or follow a request as it passes through the system.",
    traceRequest: "Follow the request",
    architectureLabel: "Architecture layers",
    layerHttp: "VALIDATED INPUT",
    layerUsecaseTitle: "USE CASE",
    layerUsecase: "ORCHESTRATION",
    layerDomainTitle: "DOMAIN",
    layerDomain: "BUSINESS RULES",
    layerPersistenceTitle: "ADAPTERS",
    layerPersistence: "MEMORY / POSTGRES",
    architectureNote:
      "A local model inspired by Keel’s architecture. Examples are simplified, not literal project excerpts.",
    architectureSource: "Read the original decision ↗︎",
    singleLearningBadge: "LEARNING BADGE",
    singleIssuerCredential: "ISSUER CREDENTIAL · 2023",
    verifyCredly: "Check on Credly",
    verifyOracle: "Check with issuer",
    courseShelfTitle: "The toolkit keeps growing.",
    courseShelfIntro:
      "Additional training in serverless, security, AI, and software engineering. Completion evidence is collected in the public folder.",
    ciscoCourse: "Cisco · Introduction to Cybersecurity",
    scrumCourse: "Especialista Scrum · 12-hour course",
    secretMarginLabel: "Examine the margin annotation",
    secretMarginHint:
      "Some margins hide extras. Examine the same annotation a few times.",
    bonusKicker: "YOU FOUND A PAGE OUTSIDE THE SCRIPT.",
    bonusTitle: "SECRET CHAPTER.",
    bonusTabsLabel: "Secret panels",
    bonusHunterTab: "Bug hunter",
    bonusNote:
      "A local extra, just for fun. No data is sent and no real systems are changed.",
    chapterDockLabel: "Turn the panels",
    previousPanel: "Previous panel",
    nextPanel: "Next panel",
    dragonKicker: "GUARDIAN OF THE TOOLKIT",
    dragonPause: "Pause dragon Ⅱ",
    dragonGreetLabel: "Greet the paper dragon",
    dragonGreet: "Greet the dragon",
    dragonCaption:
      "Folded paper. Real learning. The badges stay still for you to explore.",
  });
  Object.assign(english, {
    "badgeSummary_aws-serverless":
      "AWS serverless concepts and services, focusing on Lambda and API Gateway. A training badge with a learning-path assessment.",
    "badgeSummary_aws-cloud-quest":
      "Hands-on introductory solution building with AWS compute, networking, data, and security services. This is a training badge, not the AWS Certified Cloud Practitioner examination certification.",
    "badgeSummary_aws-cloud-essentials":
      "AWS cloud fundamentals: compute, storage, networking, databases, security, architecture, and pricing and support models.",
    "badgeSummary_aws-braket":
      "Introductory quantum-computing knowledge with a focus on Amazon Braket. A training badge with a learning-path knowledge check.",
    "badgeSummary_oracle-foundations":
      "A Foundations Associate credential, 2023 edition. Original artwork shared on the public profile. Oracle’s official page is the place to review the record and its current status.",
    "badgeSummary_oracle-ai-foundations":
      "Historical AI Foundations Associate credential, 2023 edition. The issuer’s notice reports inactivity since January 15, 2026. It is not presented as a currently valid credential.",
    "badgeSummary_oracle-data-management":
      "A Cloud Data Management foundations credential, 2023 edition. Original artwork and the official record let you inspect the title while keeping courses distinct from examination credentials.",
    "badgeSummary_cisco-network-defense":
      "Network protection, access control, firewalls, cloud security, and alert analysis. A Cisco Networking Academy student-level course credential.",
    "badgeSummary_cisco-endpoint-security":
      "Endpoint and operating-system security, common threats, and protection measures for Windows, Linux, and networks.",
    "badgeSummary_cisco-devices-config":
      "Initial Cisco device configuration, IPv4 addressing, protocols, and connectivity, with practical network exercises in Packet Tracer.",
    "badgeSummary_cisco-networking-basics":
      "Network fundamentals, devices, data transmission, IP addressing, protocols, and wireless access.",
    "badgeSummary_cisco-learnathon-2026":
      "Participation in the Cisco Networking Academy Learn-A-Thon and introductory technology activities. This is a participation recognition.",
    "badgeSummary_cisco-cybersecurity":
      "An introduction to threats, vulnerabilities, privacy, and protective practices through Cisco Networking Academy.",
    "badgeSummary_microsoft-mie-expert":
      "Recognition as a Microsoft Innovative Educator Expert in the 2025–2026 edition, connecting education technology, Microsoft tools, and AI in education.",
    studentCredential: "COURSE / STUDENT CREDENTIAL",
    participationCredential: "PARTICIPATION",
    professionalRecognition: "PROFESSIONAL RECOGNITION",
    singleLearningBadge: "TRAINING BADGE",
    singleIssuerCredential: "HISTORICAL CREDENTIAL · 2023",
    oracleInactive: "Inactive since 15 JAN 2026",
    educationBadgeIntro:
      "Recognition in the 2025–2026 edition, publicly documented on Credly.",
    ciscoBadgeIntro:
      "Five course credentials and one participation badge. These are student-level learning credentials, not CCNA or CCST examination certifications.",
    awsBadgeBody:
      "AWS training badges with issuer-verified titles, dates, and earning criteria. Cloud Quest is a learning path.",
    oracleHistoryIntro:
      "Achievements from the 2023 edition. The AI credential has been inactive since January 2026; current validity of the others was not confirmed.",
    credentialFilterLabel: "Filter credentials",
    credentialSecurity: "Networks & security",
    credentialEducation: "Education",
    credentialHistory: "Historical",
    academicTitle: "Academic presentation · FATEC Jales",
    academicBody:
      "Work presented at the 8th Academic, Scientific and Technological Conference: microcontroller-based vehicle control and a reduced-scale physical environment to support driver training.",
    dragonMissionLabel: "Which credential should the guardian fetch?",
    dragonStart: "Fly & deliver",
    dragonReset: "Restart ↺",
    dragonScrubLabel: "Delivery route",
    dragonWalkLabel: "PAPER, WAVES & CREDENTIALS IN FLIGHT",
    dragonDeliveryLabel: "DELIVERY POINT",
    dragonCaptionV3:
      "The guardian flies in waves, delivers a credential, and returns with another. Hover or focus the delivery to read at your pace. The full collection remains below.",
    verifiedProfile: "Verified Credly profile",
    courseShelfIntro:
      "Additional training in serverless, security, AI, and software engineering. Titles and dates were checked against the completion evidence.",
  });
  Object.assign(english, {
    recordHours: "DURATION",
    recordIssuer: "ISSUER",
    recordDate: "DATE / PERIOD",
    recordKind_course: "Course / learning",
    recordKind_event: "Participation / event",
    recordKind_award: "Award",
    recordKind_academic: "Authorship / presentation",
    formationKicker: "LEARNING IS AN ONGOING STORY",
    formationTitle: "58 RECORDS.<br>A GROWING TOOLKIT.",
    formationIntro:
      "Courses, events, projects, awards, and presentations, with checked titles and issuers. Some records also have a badge; counts are kept separate.",
    formationSearchLabel: "Search learning records",
    formationSearchPlaceholder: "Search technology, course, or event…",
    formationTypeLabel: "Record type",
    recordAllTypes: "All types",
    recordCourses: "Courses",
    recordEvents: "Events / participation",
    recordAcademic: "Authorship / presentation",
    recordAwards: "Awards",
    formationEmpty: "No records found. Try another word or type.",
    formationMore: "Show all records +",
    formationNote:
      "This catalog distinguishes course completion, participation, authorship, and awards. It does not turn every record into a professional examination certification.",
  });
  const t = (pt, en) => (language === "en" ? en : pt);
  const translate = (key) =>
    language === "en"
      ? english[key] || originals.get(key) || key
      : originals.get(key) || key;
  Object.assign(english, {
    originComputing:
      "During the IT technical course (2022–2023), that curiosity became projects. Auxilium began at ETEC with team Starshooting in the 2022 hackathon.",
    hardwareTitle: "Volunteer experience · hardware & networks",
    hardwareBody:
      "At ETEC’s hardware and networking lab, I helped test power supplies and equipment, assemble and organize components, prepare donated computers, apply thermal paste, and support server/network configuration with RJ45 cabling.",
    educationChemistry:
      "Technical qualification in Chemistry. Formula Drone connected science, teamwork, and technology.",
    educationComputing:
      "Technical qualification in Information Technology, completed in July 2023. Programming, hardware, and Auxilium as a team project.",
    workMigrate:
      "Cofounder and technical lead in a team initiative. Architecture, data modeling, and Auxilium development, with the project’s origin in ETEC’s 2022 hackathon.",
    independentTitle: "Independent projects",
    independentDate: "JAN 2023 — PRESENT",
    independentBody:
      "APIs, automations, interfaces, and software experiments. Public projects show different languages and ways to solve problems.",
    auxiliumConcept: "CONCEPT ILLUSTRATION · ORIGINAL LOGO",
    prototypeSource: "Prototype source",
    skillWebTitle: "Web & interfaces",
    skillWeb: "INTERFACES, NAVIGATION & PROTOTYPES.",
    skillLanguagesTitle: "Other languages",
    skillLanguages: "EDUCATION, PRACTICE & EXPERIMENTS.",
    skillInfraTitle: "Infrastructure, cloud & workflow",
    sandboxOwner: "VINICIUS OLIVEIRA · DEVELOPER MODE",
    sandboxLocal: "LOCAL · ILLUSTRATIVE",
    sandboxMissionLabel: "Choose a fictional mission",
    missionPaper: "Paper Dojo",
    missionPiribull: "Perebull Protocol",
    missionWakanda: "WAKANDA Archive",
  });
  Object.assign(english, {
    auxiliumSummary:
      "A donations project that originated at ETEC in 2022 and continued as a team initiative. The public app is a historical interface prototype.",
    auxiliumYears: "ORIGIN 2022 · MIGRATEDEV 2023–2025",
    skillBackend: "APIS, BUSINESS RULES & AUTOMATION.",
    skillData: "CONNECTING DATA TO THE OPERATION.",
    skillCloud: "SUPPORT, PROJECTS & LEARNING.",
    healthExplanation:
      "An illustrative health check, without querying a real server.",
    auxiliumCategory: "03 / APP PROTOTYPE",
    workMigrateDate: "MAY 2023 — JAN 2025",
  });
  const projectData = {
    keel: {
      title: "Keel",
      number: "001",
      tags: ["TypeScript", "Fastify", "PostgreSQL", "Vitest"],
      repo: "https://github.com/viniciuslks7/Keel",
      demo: "https://viniciuslks7.github.io/Keel/",
      pt: {
        summary:
          "O núcleo contábil de uma carteira digital: contas, depósitos, saques e transferências. O saldo vem de lançamentos, não de um número alterado sem contexto.",
        challenge:
          "Como garantir que o dinheiro permaneça em equilíbrio, que novas tentativas não dupliquem transações e que operações concorrentes respeitem o saldo?",
        decisions: [
          "Ledger append-only de partidas dobradas",
          "Valores monetários em unidades inteiras",
          "Portas e adaptadores: domínio independente da infraestrutura",
          "Idempotência e bloqueios ordenados no PostgreSQL",
        ],
        implementation:
          "Fastify recebe as requisições e valida os dados. Casos de uso coordenam o domínio. Adaptadores PostgreSQL e in-memory implementam as mesmas interfaces.",
        proof:
          "O repositório inclui testes de domínio, casos de uso e HTTP com Vitest, além de documentação OpenAPI e registros de decisões de arquitetura.",
        note: "A demo pública executa o domínio e os casos de uso reais no navegador com armazenamento em memória. Não há backend, pagamento ou dinheiro real.",
      },
      en: {
        summary:
          "The bookkeeping core of a digital wallet: accounts, deposits, withdrawals, and transfers. Balances come from entries, not a number changed without context.",
        challenge:
          "How do you keep money balanced, prevent retries from duplicating transactions, and make concurrent operations respect account balances?",
        decisions: [
          "Append-only double-entry ledger",
          "Money represented in integer minor units",
          "Ports and adapters: infrastructure-independent domain",
          "Idempotency and ordered PostgreSQL locks",
        ],
        implementation:
          "Fastify receives requests and validates data. Use cases coordinate the domain. PostgreSQL and in-memory adapters implement the same interfaces.",
        proof:
          "The repository includes domain, use-case, and HTTP tests with Vitest, an OpenAPI specification, and architecture decision records.",
        note: "The public demo runs the actual domain and use-case code in the browser with in-memory storage. No backend, payments, or real money.",
      },
    },
    starwars: {
      title: "Star Wars API",
      number: "002",
      tags: ["Python", "HTTPX", "Pydantic", "Google Cloud", "Pytest"],
      repo: "https://github.com/viniciuslks7/API-Starwars",
      pt: {
        summary:
          "Uma plataforma REST para explorar personagens, filmes, planetas e naves. Projeto de backend com busca, rankings e linhas do tempo.",
        challenge:
          "Como organizar dados externos em uma API previsível, reduzir requisições repetidas e oferecer uma navegação paginada?",
        decisions: [
          "Cliente HTTPX assíncrono para consumo de dados",
          "Validação com Pydantic e cache por recurso",
          "Paginação, busca, rankings e linhas do tempo",
          "Implementações para Cloud Functions e Cloud Run",
        ],
        implementation:
          "Python com Flask na Cloud Function e FastAPI no ambiente Cloud Run. Os recursos externos são organizados em serviços e modelos.",
        proof:
          "O repositório inclui testes com Pytest, configuração Ruff, documentação de arquitetura e instruções de deploy.",
        note: "A demonstração de frontend no repositório é básica e depende da API. Consulte o README para executar e verificar os ambientes; disponibilidade de cloud pode mudar.",
      },
      en: {
        summary:
          "A REST platform for exploring characters, films, planets, and starships. A backend project with search, rankings, and timelines.",
        challenge:
          "How do you organize external data into a predictable API, reduce repeated requests, and provide paginated navigation?",
        decisions: [
          "Asynchronous HTTPX client for external data",
          "Pydantic validation and per-resource caching",
          "Pagination, search, rankings, and timelines",
          "Cloud Functions and Cloud Run implementations",
        ],
        implementation:
          "Python with Flask in Cloud Functions and FastAPI in Cloud Run. External resources are organized into services and models.",
        proof:
          "The repository includes Pytest tests, Ruff configuration, architecture documentation, and deployment instructions.",
        note: "The basic frontend in the repository depends on the API. See the README to run and verify environments; cloud availability may change.",
      },
    },
    auxilium: {
      title: "Auxilium",
      number: "003",
      repo: "https://github.com/viniciuslks7/Aulas-de-React",
      tags: ["ETEC 2022", "MigrateDev 2023–2025", "React Native / Expo"],
      pt: {
        summary:
          "Projeto de doações que nasceu na ETEC no hackathon de 2022 e seguiu como iniciativa em equipe. O repositório público registra um protótipo histórico de interface.",
        challenge:
          "Como usar tecnologia para aproximar pessoas, organizar doações e apoiar iniciativas de impacto social?",
        decisions: [
          "Modelagem do banco de dados",
          "Arquitetura da aplicação",
          "Navegação e formulários do protótipo",
          "Backend e integrações descritos como etapas futuras",
        ],
        implementation:
          "Atuei como cofundador e responsável técnico do MigrateDev entre maio de 2023 e janeiro de 2025, participando da arquitetura e implementação.",
        proof:
          "O Auxilium conquistou o 2º lugar no 5º Hackathon Acadêmico – Robótica Paula Souza em 2022, com a equipe Starshooting. O artigo público da Oracle Academy identifica o projeto, a equipe e minha participação.",
        note: "O código público Aulas-de-React documenta interface, navegação e validação de formulários. Backend, autenticação, matching, chat e pagamentos aparecem como TODO; não apresento o protótipo como serviço em produção.",
      },
      en: {
        summary:
          "A donations project that originated at ETEC’s 2022 hackathon and continued as a team initiative. The public repository records a historical interface prototype.",
        challenge:
          "How can technology bring people together, organize donations, and support social-impact initiatives?",
        decisions: [
          "Database modeling",
          "Application architecture",
          "Interface & navigation features",
          "Backend and integrations described as future steps",
        ],
        implementation:
          "I was a cofounder and technical lead at MigrateDev from May 2023 to January 2025, working on architecture and implementation.",
        proof:
          "Auxilium placed 2nd in the 2022 5th Academic Hackathon – Robotics Paula Souza with team Starshooting. The public Oracle Academy article identifies the project, the team, and my participation.",
        note: "The public Aulas-de-React source documents interfaces, navigation, and form validation. Backend, authentication, matching, chat, and payments are TODO items; the prototype is not presented as a production service.",
      },
    },
  };
  function applyLanguage() {
    document.documentElement.lang = language === "en" ? "en" : "pt-BR";
    $$("[data-i18n]").forEach((node) => {
      node.innerHTML = translate(node.dataset.i18n);
    });
    $$("[data-i18n-aria]").forEach((node) =>
      node.setAttribute("aria-label", translate(node.dataset.i18nAria)),
    );
    $$("[data-i18n-placeholder]").forEach(
      (node) => (node.placeholder = translate(node.dataset.i18nPlaceholder)),
    );
    $("#language").textContent = language === "en" ? "PT" : "EN";
    $("#language").setAttribute(
      "aria-label",
      t("Switch to English", "Mudar para português"),
    );
    $("#menu-toggle").setAttribute("aria-label", t("Abrir menu", "Open menu"));
    document.title = t(
      "Vinicius Oliveira — Desenvolvedor de Software",
      "Vinicius Oliveira — Software Developer",
    );
    $(".portrait-frame img").alt = t(
      "Retrato de Vinicius Oliveira",
      "Portrait of Vinicius Oliveira",
    );
    updateProjectCount();
    updateMotion();
    renderArchitecture(architectureIndex);
    updateCredentialCount();
    filterFormation();
    updateDragonStatus();
    if (activeBadge) renderBadge(activeBadge);
    if ($("#bonus-dialog").open) renderBonus(activeBonus);
    renderCommands();
    if (activeProject) renderProject(activeProject);
    renderResponse($("#endpoint").value, false);
  }
  function showToast(message) {
    clearTimeout(toastTimer);
    $("#toast").textContent = message;
    $("#toast").classList.add("visible");
    toastTimer = setTimeout(
      () => $("#toast").classList.remove("visible"),
      3500,
    );
  }
  function updateMotion() {
    document.body.classList.toggle("motion-off", motionDisabled);
    document.documentElement.classList.toggle("motion-off", motionDisabled);
    document.body.classList.toggle("motion-allowed", !motionDisabled);
    $("#motion").setAttribute("aria-pressed", String(motionDisabled));
    $("#motion").setAttribute(
      "aria-label",
      prefersReduced.matches
        ? t("Movimento reduzido pelo sistema", "Motion reduced by your system")
        : motionDisabled
          ? t("Ativar animações", "Enable animations")
          : t("Pausar animações", "Pause animations"),
    );
    $("#motion").innerHTML =
      `<span aria-hidden="true">${motionDisabled ? "▷" : "Ⅱ"}</span>`;
    if (motionDisabled)
      $$(".reveal.pending").forEach((n) => n.classList.remove("pending"));
    syncDragonMotion();
  }
  $("#language").addEventListener("click", () => {
    language = language === "pt" ? "en" : "pt";
    storage.set("vo-language", language);
    applyLanguage();
  });
  $("#motion").addEventListener("click", () => {
    if (prefersReduced.matches && $("#dragon-full-motion").checked) {
      $("#dragon-full-motion").checked = false;
      syncDragonMotion();
      showToast(
        t("Demonstração de movimento pausada", "Motion demonstration paused"),
      );
      return;
    }
    if (prefersReduced.matches) {
      showToast(
        t(
          "Movimento reduzido respeita a preferência do seu sistema",
          "Reduced motion follows your system preference",
        ),
      );
      return;
    }
    motionDisabled = !motionDisabled;
    if (motionDisabled) $("#dragon-full-motion").checked = false;
    storage.set("vo-motion", motionDisabled ? "off" : "on");
    updateMotion();
    showToast(
      motionDisabled
        ? t("Animações pausadas", "Animations paused")
        : t("Animações ativadas", "Animations enabled"),
    );
  });
  prefersReduced.addEventListener("change", () => {
    motionDisabled =
      prefersReduced.matches || storage.get("vo-motion") === "off";
    updateMotion();
  });
  function closeMobile() {
    $("#mobile-nav").hidden = true;
    $("#menu-toggle").setAttribute("aria-expanded", "false");
  }
  $("#menu-toggle").addEventListener("click", () => {
    const isOpen = !$("#mobile-nav").hidden;
    $("#mobile-nav").hidden = isOpen;
    $("#menu-toggle").setAttribute("aria-expanded", String(!isOpen));
  });
  $$("#mobile-nav a").forEach((a) => a.addEventListener("click", closeMobile));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobile();
      const open = $("dialog[open]");
      if (open) {
        event.preventDefault();
        open.close();
      }
    }
  });
  document.addEventListener("click", (event) => {
    if (
      !$("#mobile-nav").hidden &&
      !event.target.closest(".site-header") &&
      !event.target.closest(".mobile-nav")
    )
      closeMobile();
  });
  function updateProjectCount() {
    const count = $$(".project-card").filter((n) => !n.hidden).length;
    $("#project-count").textContent =
      `0${count} ${t(count === 1 ? "PROJETO" : "PROJETOS", count === 1 ? "PROJECT" : "PROJECTS")}`;
  }
  $$(".filter").forEach((button) =>
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      $$(".filter").forEach((n) => {
        n.classList.toggle("active", n === button);
        n.setAttribute("aria-pressed", String(n === button));
      });
      $$(".project-card").forEach((n) => {
        n.hidden =
          activeFilter !== "all" && n.dataset.category !== activeFilter;
        n.classList.remove("pending");
      });
      updateProjectCount();
    }),
  );
  function openDialog(dialog) {
    dialogOrigin = document.activeElement;
    closeMobile();
    if (!dialog.open) dialog.showModal();
    document.body.style.overflow = "hidden";
    document.body.classList.add("dialog-open");
    syncDragonMotion();
  }
  function closeDialog(dialog) {
    dialog.close();
  }
  $$("dialog").forEach((dialog) => {
    dialog.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      const focusable = $$(
        "button:not(:disabled),a[href],input,select,textarea,[tabindex]:not([tabindex='-1'])",
        dialog,
      ).filter((node) => node.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    dialog.addEventListener("close", () => {
      document.body.style.overflow = "";
      document.body.classList.remove("dialog-open");
      syncDragonMotion();
      activeProject = undefined;
      if (dialogOrigin instanceof HTMLElement) dialogOrigin.focus();
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        const r = dialog.getBoundingClientRect();
        if (
          event.clientX < r.left ||
          event.clientX > r.right ||
          event.clientY < r.top ||
          event.clientY > r.bottom
        )
          closeDialog(dialog);
      }
    });
    $("[data-close]", dialog).addEventListener("click", () =>
      closeDialog(dialog),
    );
  });
  function renderProject(id) {
    const project = projectData[id];
    const data = project[language];
    $("#project-dialog-content").innerHTML =
      `<p class="chapter-kicker">CASE_${project.number} / ${id === "auxilium" ? t("APP · PROTÓTIPO", "APP · PROTOTYPE") : "BACKEND"}</p><h2 id="project-dialog-title">${project.title}</h2><p class="dossier-subtitle">${data.summary}</p><ul class="tags">${project.tags.map((tag) => `<li>${tag}</li>`).join("")}</ul><div class="dossier-grid"><div><h3>${t("01 / O DESAFIO", "01 / THE CHALLENGE")}</h3><p>${data.challenge}</p></div><div><h3>${t("02 / AS DECISÕES", "02 / THE DECISIONS")}</h3><ul>${data.decisions.map((item) => `<li>${item}</li>`).join("")}</ul></div><div><h3>${t("03 / A IMPLEMENTAÇÃO", "03 / THE IMPLEMENTATION")}</h3><p>${data.implementation}</p></div><div><h3>${t("04 / PARA CONFERIR", "04 / THE EVIDENCE")}</h3><p>${data.proof}</p></div></div><p class="dossier-footnote">${data.note}</p><div class="dialog-actions">${project.demo ? `<a class="button button-primary" href="${project.demo}" target="_blank" rel="noopener noreferrer">${t("Experimentar a demo", "Try the demo")} ↗︎</a>` : ""}${project.repo ? `<a class="button button-light" href="${project.repo}" target="_blank" rel="noopener noreferrer">${t("Explorar no GitHub", "Explore on GitHub")} ↗︎</a>` : `<a class="button button-primary" href="mailto:vinicius.oliveiratwt@gmail.com">${t("Conversar sobre o projeto", "Talk about the project")} ↗︎</a>`}</div>`;
  }
  $$("[data-project-open]").forEach((button) =>
    button.addEventListener("click", () => {
      activeProject = button.dataset.projectOpen;
      renderProject(activeProject);
      openDialog($("#project-dialog"));
    }),
  );
  $$("[data-open]").forEach((button) =>
    button.addEventListener("click", () => {
      if (button.dataset.open === "quick") openDialog($("#quick-dialog"));
      else openCommands();
    }),
  );
  $("#copy-email").addEventListener("click", async () => {
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText("vinicius.oliveiratwt@gmail.com");
      showToast(t("E-mail copiado!", "Email copied!"));
    } catch {
      showToast(
        t(
          "Não foi possível copiar. Use o link de e-mail acima.",
          "Could not copy. Use the email link above.",
        ),
      );
    }
  });
  function renderResponse(type, announce = true) {
    const mission = $("#sandbox-mission").value;
    const missionNames = {
      paper: t("Dojo de Papel", "Paper Dojo"),
      piribull: t("Protocolo Perebull", "Perebull Protocol"),
      wakanda: t("Arquivo WAKANDA", "WAKANDA Archive"),
    };
    const identity = {
      name: "Vinicius Oliveira",
      mode: "developer",
      runtime: "local-demo",
    };
    const results = {
      profile: {
        body: {
          ...identity,
          focus: "backend",
          toolkit: ["Python", "JavaScript", "TypeScript", "Node.js", "SQL"],
          github: "https://github.com/viniciuslks7",
          mission: missionNames[mission],
          fictionalMission: true,
        },
        explanation: t(
          "O perfil usa meu nome e repertório. A missão é um cenário fictício; esta resposta é montada no navegador.",
          "The profile uses my name and toolkit. The mission is fictional; this response is assembled in your browser.",
        ),
      },
      opportunities: {
        body: {
          ...identity,
          discussionTopics: [
            "backend",
            "integrations",
            "automation",
            "web_and_mobile_interfaces",
          ],
          contact: {
            email: "vinicius.oliveiratwt@gmail.com",
            github: "https://github.com/viniciuslks7",
          },
          mission: missionNames[mission],
          fictionalMission: true,
        },
        explanation: t(
          "Assuntos para uma conversa sobre projetos e oportunidades. Não informa vagas, agenda, horas disponíveis ou status profissional em tempo real.",
          "Topics for a conversation about projects and opportunities. It does not report vacancies, schedules, available hours, or real-time professional status.",
        ),
      },
      health: {
        body: {
          status: "ok",
          ...identity,
          mission: missionNames[mission],
          fictionalMission: true,
          message: t(
            "Pronto para explorar o próximo capítulo.",
            "Ready to explore the next chapter.",
          ),
        },
        explanation: t(
          "Um health check ilustrativo: simula uma resposta saudável, sem consultar um servidor real.",
          "An illustrative health check: it simulates a healthy response without querying a real server.",
        ),
      },
      ledger: {
        body: {
          ...identity,
          mission: missionNames[mission],
          fictionalMission: true,
          currency: "BRL",
          amountsAreFictional: true,
          entries: [
            {
              side: "DEBIT",
              account: t("Equipamentos do dojo", "Dojo equipment"),
              amountCents: 4000,
            },
            {
              side: "CREDIT",
              account: t("Fundo da missão", "Mission fund"),
              amountCents: 4000,
            },
          ],
          sumCents: 0,
          balanced: true,
        },
        explanation: t(
          "Missão fictícia, regra real de partidas dobradas: débito e crédito se equilibram. Os valores não representam dinheiro ou contas reais.",
          "Fictional mission, real double-entry rule: debit and credit balance. These amounts do not represent real money or accounts.",
        ),
      },
      retry: {
        body: {
          ...identity,
          mission: missionNames[mission],
          fictionalMission: true,
          idempotencyKey: "demo-001",
          transactionId: "tx-local-001",
          attempt: retryCount || 1,
          replayed: retryCount > 1,
          postedTransactions: 1,
        },
        explanation: t(
          "Execute novamente: a mesma chave retorna a mesma transação fictícia. A tentativa aumenta, o lançamento não.",
          "Run again: the same key returns the same fictional transaction. Attempts increase; postings do not.",
        ),
      },
    };
    const result = results[type] || results.profile;
    $("#response-output").textContent = JSON.stringify(result.body, null, 2);
    $("#response-status").textContent = "200 OK · LOCAL";
    $("#response-explanation").textContent = result.explanation;
    if (announce)
      $("#response-output").setAttribute(
        "aria-label",
        t(
          "Resposta JSON ilustrativa local",
          "Illustrative local JSON response",
        ),
      );
  }
  $("#sandbox-mission").addEventListener("change", () => {
    clearTimeout(requestTimer);
    retryCount = 0;
    $("#run-request").disabled = false;
    $("#run-request").textContent = t("Executar →", "Run →");
    renderResponse($("#endpoint").value);
  });
  $("#run-request").addEventListener("click", () => {
    const button = $("#run-request");
    button.disabled = true;
    button.textContent = t("Executando…", "Running…");
    $("#response-status").textContent = t(
      "PROCESSANDO LOCALMENTE…",
      "PROCESSING LOCALLY…",
    );
    clearTimeout(requestTimer);
    requestTimer = setTimeout(
      () => {
        if ($("#endpoint").value === "retry") retryCount++;
        renderResponse($("#endpoint").value);
        button.disabled = false;
        button.textContent = t("Executar →", "Run →");
      },
      motionDisabled ? 0 : 350,
    );
  });
  $("#endpoint").addEventListener("change", () => {
    clearTimeout(requestTimer);
    $("#run-request").disabled = false;
    $("#run-request").textContent = t("Executar →", "Run →");
    renderResponse($("#endpoint").value);
  });
  let commandIndex = 0;
  let filteredCommands = [];
  function commandItems() {
    return [
      {
        label: t("Início / Prólogo", "Home / Prologue"),
        hint: "00",
        hash: "#home",
      },
      {
        label: t("História & experiência", "Story & experience"),
        hint: "01",
        hash: "#story",
      },
      {
        label: t("Projetos & laboratório", "Projects & playground"),
        hint: "02",
        hash: "#projects",
      },
      { label: "GitHub / @viniciuslks7", hint: "↗︎", hash: "#github" },
      {
        label: t("Ferramentas & habilidades", "Tools & skills"),
        hint: "03",
        hash: "#skills",
      },
      {
        label: t("Cursos & credenciais", "Courses & credentials"),
        hint: "04",
        hash: "#credentials",
      },
      { label: t("Contato", "Contact"), hint: "05", hash: "#contact" },
      {
        label: t("Visão rápida para recrutadores", "Recruiter quick view"),
        hint: "↗︎",
        action: "quick",
      },
      {
        label: t("Alternar idioma", "Switch language"),
        hint: "PT / EN",
        action: "language",
      },
      {
        label: motionDisabled
          ? t("Ativar animações", "Enable animations")
          : t("Pausar animações", "Pause animations"),
        hint: "Ⅱ",
        action: "motion",
      },
    ];
  }
  function renderCommands() {
    const query = $("#command-search").value.trim().toLocaleLowerCase();
    filteredCommands = commandItems().filter((item) =>
      item.label
        .toLocaleLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .includes(query.normalize("NFD").replace(/[\u0300-\u036f]/g, "")),
    );
    commandIndex = Math.min(
      commandIndex,
      Math.max(0, filteredCommands.length - 1),
    );
    $("#command-results").innerHTML = filteredCommands.length
      ? filteredCommands
          .map(
            (item, index) =>
              `<button class="command-result ${index === commandIndex ? "selected" : ""}" data-command="${index}"><span>${item.label}</span><small>${item.hint} ↗︎</small></button>`,
          )
          .join("")
      : `<p class="command-hint">${t("Nenhum destino encontrado.", "No destinations found.")}</p>`;
    $$("[data-command]").forEach((button) =>
      button.addEventListener("click", () =>
        executeCommand(Number(button.dataset.command)),
      ),
    );
  }
  function openCommands() {
    commandIndex = 0;
    $("#command-search").value = "";
    renderCommands();
    openDialog($("#command-dialog"));
    $("#command-search").focus();
  }
  function executeCommand(index) {
    const item = filteredCommands[index];
    if (!item) return;
    $("#command-dialog").close();
    if (item.hash) {
      location.hash = item.hash;
      $(item.hash).scrollIntoView({
        behavior: motionDisabled ? "instant" : "smooth",
        block: "start",
      });
    } else if (item.action === "quick") {
      openDialog($("#quick-dialog"));
    } else {
      $(`#${item.action}`).click();
    }
  }
  $("#command-open").addEventListener("click", openCommands);
  $("#command-search").addEventListener("input", () => {
    commandIndex = 0;
    renderCommands();
  });
  $("#command-dialog").addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      commandIndex =
        (commandIndex +
          (event.key === "ArrowDown" ? 1 : -1) +
          filteredCommands.length) %
        Math.max(1, filteredCommands.length);
      renderCommands();
    }
    if (event.key === "Enter" && event.target === $("#command-search")) {
      event.preventDefault();
      executeCommand(commandIndex);
    }
  });
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      const open = $("dialog[open]");
      if (open) open.close();
      openCommands();
    }
  });
  // One request, four understandable layers. All code snippets below are illustrative.
  let architectureIndex = 0;
  let traceTimer;
  let traceRunning = false;
  const architectureData = [
    {
      file: "infrastructure / http",
      pt: {
        title: "A porta de entrada",
        body: "A camada HTTP recebe a requisição, valida seu formato e traduz o resultado para uma resposta. As regras de negócio ficam fora daqui.",
      },
      en: {
        title: "The entry point",
        body: "The HTTP layer receives the request, validates its shape, and translates the result into a response. Business rules stay outside this layer.",
      },
      code: "// Simplified, illustrative example\nconst input = schema.parse(request.body);\nconst result = await deposit.execute(input);\nreturn reply.code(201).send(result);",
    },
    {
      file: "application / use-cases",
      pt: {
        title: "Quem coordena o trabalho",
        body: "O caso de uso orquestra a operação: acessa portas de persistência, aplica regras do domínio e coordena a unidade de trabalho. Ele não depende do Fastify.",
      },
      en: {
        title: "Coordinating the work",
        body: "The use case orchestrates the operation: it uses persistence ports, applies domain rules, and coordinates a unit of work. It does not depend on Fastify.",
      },
      code: "// Simplified, illustrative example\nawait unitOfWork.run(async () => {\n  const account = await accounts.find(id);\n  const entry = postTransaction(account, amount);\n  await ledger.append(entry);\n});",
    },
    {
      file: "domain / rules",
      pt: {
        title: "As regras que não negociam",
        body: "O domínio representa dinheiro em unidades inteiras e exige lançamentos balanceados. Não conhece HTTP, SQL ou o navegador. As regras têm uma fonte de verdade.",
      },
      en: {
        title: "Rules that do not compromise",
        body: "The domain represents money in integer minor units and requires balanced entries. It knows nothing about HTTP, SQL, or the browser. The rules have one source of truth.",
      },
      code: '// Simplified, illustrative example\nconst amountCents = 4000;\nconst entries = [\n  { side: "DEBIT", amountCents },\n  { side: "CREDIT", amountCents }\n];\n// debit - credit === 0',
    },
    {
      file: "infrastructure / persistence",
      pt: {
        title: "A mesma porta, outro adaptador",
        body: "PostgreSQL persiste a aplicação no servidor. O adaptador in-memory atende testes e a demo no navegador. O domínio continua o mesmo; muda como os dados são armazenados.",
      },
      en: {
        title: "The same port, a different adapter",
        body: "PostgreSQL persists the server application. The in-memory adapter powers tests and the browser demo. The domain stays the same; data storage changes.",
      },
      code: "// Simplified, illustrative example\ninterface LedgerRepository {\n  append(entries: Entry[]): Promise<void>;\n}\n// PostgreSQL adapter → server\n// In-memory adapter → tests / browser demo",
    },
  ];
  function renderArchitecture(index) {
    architectureIndex = index;
    const layer = architectureData[index];
    $$("[data-architecture]").forEach((button) => {
      const selected = Number(button.dataset.architecture) === index;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    $("#architecture-file").textContent = layer.file;
    $("#architecture-detail-title").textContent = layer[language].title;
    $("#architecture-description").textContent = layer[language].body;
    $("#architecture-code").textContent = layer.code;
    $("#architecture-code").setAttribute(
      "aria-label",
      t("Exemplo ilustrativo de código", "Illustrative code example"),
    );
  }
  function stopTrace() {
    clearTimeout(traceTimer);
    traceRunning = false;
    $("#trace-request").disabled = false;
    $("#trace-request").innerHTML =
      `<span data-i18n="traceRequest">${translate("traceRequest")}</span> →`;
    $(".architecture-lab").classList.remove("tracing");
  }
  $$("[data-architecture]").forEach((button) => {
    button.addEventListener("click", () => {
      stopTrace();
      renderArchitecture(Number(button.dataset.architecture));
    });
    button.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        stopTrace();
        const index =
          (Number(button.dataset.architecture) +
            (event.key === "ArrowRight" ? 1 : -1) +
            4) %
          4;
        renderArchitecture(index);
        $(`[data-architecture="${index}"]`).focus();
      }
    });
  });
  $("#trace-request").addEventListener("click", () => {
    stopTrace();
    traceRunning = true;
    $("#trace-request").disabled = true;
    $("#trace-request").textContent = t(
      "Seguindo a requisição…",
      "Following the request…",
    );
    $(".architecture-lab").classList.add("tracing");
    let step = 0;
    const advance = () => {
      renderArchitecture(step);
      if (step === 3) {
        stopTrace();
        showToast(
          t(
            "Requisição concluída: responsabilidades separadas",
            "Request complete: separate responsibilities",
          ),
        );
        return;
      }
      step++;
      traceTimer = setTimeout(advance, motionDisabled ? 0 : 430);
    };
    advance();
  });

  // A single coordinated, native Web Animations timeline articulates the paper dragon.
  // Banner anchors never move; only the paper creature and non-interactive decoration do.
  const badgeData = [
    {
      id: "aws-serverless",
      image: "aws-serverless.png",
      title: "AWS Knowledge: Serverless - Training Badge",
      url: "https://www.credly.com/badges/db3f3724-9e29-435f-8859-d6d189e6cbdd",
      issuer: "Amazon Web Services / Credly",
      type: "learning",
      pt: "Conceitos e serviços serverless da AWS, com foco em Lambda e API Gateway. Badge de treinamento com avaliação da trilha de conhecimento.",
      en: "AWS serverless concepts and services, focusing on Lambda and API Gateway. A training badge with a learning-path assessment.",
      kindKey: "singleLearningBadge",
      category: "cloud",
      issued: "2024-03-30",
      criteriaPt: "Conclusão da trilha Serverless Knowledge Badge Readiness.",
      criteriaEn:
        "Completion of the Serverless Knowledge Badge Readiness learning path.",
      skills: [
        "AWS",
        "AWS Cloud",
        "AWS Lambda",
        "Amazon API Gateway",
        "Amazon Web Services (AWS)",
        "Serverless Computing",
      ],
    },
    {
      id: "aws-cloud-quest",
      image: "aws-cloud-quest.png",
      title: "AWS Cloud Quest: Cloud Practitioner - Training Badge",
      url: "https://www.credly.com/badges/921fdafd-06c5-4fa2-a63d-587eeabc2642",
      issuer: "Amazon Web Services / Credly",
      type: "learning",
      pt: "Experiência prática construindo soluções introdutórias com serviços AWS de computação, redes, dados e segurança. É um badge de treinamento, não a certificação AWS Certified Cloud Practitioner por exame.",
      en: "Hands-on introductory solution building with AWS compute, networking, data, and security services. This is a training badge, not the AWS Certified Cloud Practitioner examination certification.",
      kindKey: "singleLearningBadge",
      category: "cloud",
      issued: "2023-09-01",
      criteriaPt:
        "Conclusão das tarefas práticas da função Cloud Practitioner no AWS Cloud Quest.",
      criteriaEn:
        "Completion of the Cloud Practitioner role’s practical assignments in AWS Cloud Quest.",
      skills: [
        "AWS",
        "AWS Cloud",
        "AWS Cloud Computing",
        "AWS Cloud Foundations",
        "Amazon Web Services (AWS)",
        "Cloud Platform",
      ],
    },
    {
      id: "aws-cloud-essentials",
      image: "aws-cloud-essentials.png",
      title: "AWS Knowledge: Cloud Essentials - Training Badge",
      url: "https://www.credly.com/badges/4106ffb6-2ac8-4dce-97a3-5369fa3981fd",
      issuer: "Amazon Web Services / Credly",
      type: "learning",
      pt: "Fundamentos de cloud AWS: computação, armazenamento, redes, bancos de dados, segurança, arquitetura e modelos de preço e suporte.",
      en: "AWS cloud fundamentals: compute, storage, networking, databases, security, architecture, and pricing and support models.",
      kindKey: "singleLearningBadge",
      category: "cloud",
      issued: "2023-09-04",
      criteriaPt: "Aprovação na avaliação Cloud Essentials Knowledge Badge.",
      criteriaEn: "Passing the Cloud Essentials Knowledge Badge assessment.",
      skills: [
        "AWS",
        "AWS Cloud",
        "AWS Compute",
        "AWS Databases",
        "AWS Networking",
        "AWS Security",
        "AWS storage",
        "Amazon Web Services (AWS)",
      ],
    },
    {
      id: "aws-braket",
      image: "aws-braket.png",
      title: "AWS Knowledge: Amazon Braket - Training Badge",
      url: "https://www.credly.com/badges/c05f92e0-4dbe-48a8-a2b7-670df772e703",
      issuer: "Amazon Web Services / Credly",
      type: "learning",
      pt: "Conhecimento introdutório de computação quântica com foco no Amazon Braket. Badge de treinamento, com verificação de conhecimento ao concluir a trilha.",
      en: "Introductory quantum-computing knowledge with a focus on Amazon Braket. A training badge with a learning-path knowledge check.",
      kindKey: "singleLearningBadge",
      category: "cloud",
      issued: "2025-01-22",
      criteriaPt:
        "Conclusão e aprovação na avaliação final da trilha de aprendizado.",
      criteriaEn:
        "Completion of the learning path and passing its final knowledge assessment.",
      skills: [
        "AWS",
        "AWS Cloud",
        "Amazon Braket",
        "Amazon Web Services (AWS)",
        "Quantum Computing",
      ],
    },
    {
      id: "oracle-foundations",
      image: "oracle-foundations.png",
      title: "OCI 2023 Foundations Associate",
      url: "https://catalog-education.oracle.com/ords/certview/sharebadge?id=F85043432294C78FD1BE13EE826D50FB57D2B6F8434C5FEBDA0BA0E70744B530",
      issuer: "Oracle / CertView",
      type: "issuer",
      pt: "Credencial Foundations Associate, edição 2023. Arte original compartilhada no perfil público. A página oficial da Oracle é o local para conferir o registro e seu status atual.",
      en: "A Foundations Associate credential, 2023 edition. Original artwork shared on the public profile. Oracle’s official page is the place to review the record and its current status.",
      kindKey: "singleIssuerCredential",
      category: "history",
      criteriaPt:
        "Credencial histórica da edição 2023. Consulte o emissor para a situação do registro.",
      criteriaEn:
        "Historical 2023-edition credential. Check the issuer for the record’s status.",
      statusPt: "Validade atual não confirmada",
      statusEn: "Current validity not confirmed",
      skills: ["Oracle Cloud", "Foundations"],
    },
    {
      id: "oracle-ai-foundations",
      image: "oracle-ai-foundations.png",
      title: "OCI 2023 AI Foundations Associate",
      url: "https://catalog-education.oracle.com/ords/certview/sharebadge?id=F1F8769652CBB65BCD646A65BB55F48E8F7041370A430B2AD03A43B36FEBB6AD",
      issuer: "Oracle / CertView",
      type: "issuer",
      pt: "Credencial histórica AI Foundations Associate, edição 2023. O aviso do emissor informa inatividade desde 15 de janeiro de 2026. Não é apresentada como uma credencial atualmente válida.",
      en: "Historical AI Foundations Associate credential, 2023 edition. The issuer’s notice reports inactivity since January 15, 2026. It is not presented as a currently valid credential.",
      kindKey: "singleIssuerCredential",
      category: "history",
      criteriaPt:
        "Credencial histórica da edição 2023. Consulte o emissor para a situação do registro.",
      criteriaEn:
        "Historical 2023-edition credential. Check the issuer for the record’s status.",
      issued: "2024-01-15",
      inactive: "2026-01-15",
      skills: ["Oracle Cloud", "Foundations"],
    },
    {
      id: "oracle-data-management",
      image: "oracle-data-management.png",
      title: "Oracle Cloud Data Management 2023 Foundations Associate",
      url: "https://catalog-education.oracle.com/ords/certview/sharebadge?id=2964B215E6919B906F493A29741D4E9C5D2D161A24352BC4995B9259EA760472",
      issuer: "Oracle / CertView",
      type: "issuer",
      pt: "Credencial de fundamentos em Cloud Data Management, edição 2023. Imagem original e link oficial permitem conferir o título sem confundir cursos com certificações por exame.",
      en: "A Cloud Data Management foundations credential, 2023 edition. Original artwork and the official record let you inspect the title while keeping courses distinct from examination credentials.",
      kindKey: "singleIssuerCredential",
      category: "history",
      criteriaPt:
        "Credencial histórica da edição 2023. Consulte o emissor para a situação do registro.",
      criteriaEn:
        "Historical 2023-edition credential. Check the issuer for the record’s status.",
      statusPt: "Validade atual não confirmada",
      statusEn: "Current validity not confirmed",
      skills: ["Oracle Cloud", "Foundations"],
    },
    {
      id: "cisco-network-defense",
      image: "cisco-network-defense.png",
      title: "Network Defense",
      url: "https://www.credly.com/badges/d9a5a5e4-e0e9-43bb-9ac9-63b091f1b527",
      issuer: "Cisco / Credly",
      type: "student",
      category: "security",
      issued: "2026-09-04",
      pt: "Proteção de redes, controles de acesso, firewalls, segurança em cloud e análise de alertas. Formação de nível estudante do Cisco Networking Academy.",
      en: "Network protection, access control, firewalls, cloud security, and alert analysis. A Cisco Networking Academy student-level course credential.",
      kindKey: "studentCredential",
      criteriaPt:
        "Conclusão do curso e aprovação na avaliação final do Cisco Networking Academy.",
      criteriaEn:
        "Course completion and passing the Cisco Networking Academy final assessment.",
      skills: [
        "Access Controls",
        "Application Security",
        "Cloud Security",
        "Defense-in-Depth",
        "End Device Logs",
        "Evaluating Alerts",
        "Firewalls",
        "Hashing",
        "Integrity And Authenticity",
        "Network Hardening",
        "Network Logs",
        "Physical Security",
        "Public Key Cryptography",
        "Security Policies - Regulations - Standards",
        "System And Network Defense",
      ],
    },
    {
      id: "cisco-endpoint-security",
      image: "cisco-endpoint-security.png",
      title: "Endpoint Security",
      url: "https://www.credly.com/badges/0793859e-4dbb-4af1-98cf-6b48c6507e4b",
      issuer: "Cisco / Credly",
      type: "student",
      category: "security",
      issued: "2026-08-14",
      pt: "Segurança de endpoints e sistemas operacionais, ameaças comuns e medidas de proteção em Windows, Linux e redes.",
      en: "Endpoint and operating-system security, common threats, and protection measures for Windows, Linux, and networks.",
      kindKey: "studentCredential",
      criteriaPt:
        "Conclusão do curso e aprovação na avaliação final do Cisco Networking Academy.",
      criteriaEn:
        "Course completion and passing the Cisco Networking Academy final assessment.",
      skills: [
        "Antimalware Protection",
        "Application Security",
        "Common Cyber Threats",
        "Defending Systems And Devices",
        "Host-based Intrusion Prevention",
        "IP/TCP/UDP Vulnerabilities",
        "Linux Basics",
        "Mitigating Common Network Attacks",
        "Network Security Infrastructure",
        "Securing WLANs",
        "System And Endpoint Protection",
        "Windows Security",
        "Wireless And Mobile Device Attacks",
      ],
    },
    {
      id: "cisco-devices-config",
      image: "cisco-devices-config.png",
      title: "Networking Devices and Initial Configuration",
      url: "https://www.credly.com/badges/12da6274-ee79-4353-aaab-4efb01fd1644",
      issuer: "Cisco / Credly",
      type: "student",
      category: "security",
      issued: "2026-04-27",
      pt: "Configuração inicial de dispositivos Cisco, endereçamento IPv4, protocolos e conectividade. Inclui prática de redes no Packet Tracer.",
      en: "Initial Cisco device configuration, IPv4 addressing, protocols, and connectivity, with practical network exercises in Packet Tracer.",
      kindKey: "studentCredential",
      criteriaPt:
        "Conclusão do curso e aprovação na avaliação final do Cisco Networking Academy.",
      criteriaEn:
        "Course completion and passing the Cisco Networking Academy final assessment.",
      skills: [
        "ARP",
        "Binary Systems",
        "Cisco Devices",
        "Cisco IOS",
        "DHCP",
        "DNS",
        "Ethernet Operates",
        "Hierarchical Network Design",
        "IPv4 Subnetting",
        "Network Layer Protocols",
        "Transport Layer Protocols",
        "Virtualization and Cloud Services",
      ],
    },
    {
      id: "cisco-networking-basics",
      image: "cisco-networking-basics.png",
      title: "Networking Basics",
      url: "https://www.credly.com/badges/05dd8fba-799b-45c3-8dfd-a22c2349b2b7",
      issuer: "Cisco / Credly",
      type: "student",
      category: "security",
      issued: "2026-03-30",
      pt: "Fundamentos de redes, dispositivos, transmissão de dados, endereços IP, protocolos e acesso sem fio.",
      en: "Network fundamentals, devices, data transmission, IP addressing, protocols, and wireless access.",
      kindKey: "studentCredential",
      criteriaPt:
        "Conclusão do curso e aprovação na avaliação final do Cisco Networking Academy.",
      criteriaEn:
        "Course completion and passing the Cisco Networking Academy final assessment.",
      skills: [
        "Application Layer Services",
        "IPv4 Addresses",
        "NetWork Types",
        "Network Media",
        "Protocols Standards",
        "Wireless Access",
      ],
    },
    {
      id: "cisco-learnathon-2026",
      image: "cisco-learnathon-2026.png",
      title: "Cisco Networking Academy Learn-A-Thon 2026",
      url: "https://www.credly.com/badges/f404418f-09d0-47e6-901c-e385462eb614",
      issuer: "Cisco / Credly",
      type: "participation",
      category: "security",
      issued: "2026-03-29",
      pt: "Participação no Learn-A-Thon do Cisco Networking Academy, com atividades introdutórias de tecnologia. É um reconhecimento de participação.",
      en: "Participation in the Cisco Networking Academy Learn-A-Thon and introductory technology activities. This is a participation recognition.",
      kindKey: "participationCredential",
      criteriaPt:
        "Participação em um curso introdutório durante o evento Learn-A-Thon.",
      criteriaEn:
        "Participation in an introductory technology course during the Learn-A-Thon event.",
      skills: ["Self Motivated"],
    },
    {
      id: "cisco-cybersecurity",
      image: "cisco-cybersecurity.png",
      title: "Introduction to Cybersecurity",
      url: "https://www.credly.com/badges/d1c76def-0ef3-4488-b68f-20777a60a2ba",
      issuer: "Cisco / Credly",
      type: "student",
      category: "security",
      issued: "2026-03-25",
      pt: "Introdução a ameaças, vulnerabilidades, privacidade e práticas de proteção. Formação introdutória do Cisco Networking Academy.",
      en: "An introduction to threats, vulnerabilities, privacy, and protective practices through Cisco Networking Academy.",
      kindKey: "studentCredential",
      criteriaPt:
        "Conclusão do curso e aprovação na avaliação final do Cisco Networking Academy.",
      criteriaEn:
        "Course completion and passing the Cisco Networking Academy final assessment.",
      skills: [
        "Cyber Best Practices",
        "Cybersecurity",
        "Network Vulnerabilities",
        "Privacy And Data Confidentiality",
        "Threat Detection",
      ],
    },
    {
      id: "microsoft-mie-expert",
      image: "microsoft-mie-expert.png",
      title: "Microsoft Innovative Educator Expert 2025-2026",
      url: "https://www.credly.com/badges/324ea9a7-d58e-4c96-b3c8-6c54e4eb2e94",
      issuer: "Microsoft Elevate / Credly",
      type: "recognition",
      category: "education",
      issued: "2025-10-09",
      pt: "Reconhecimento como Microsoft Innovative Educator Expert na edição 2025–2026. Relaciona tecnologia educacional, ferramentas Microsoft e IA na educação.",
      en: "Recognition as a Microsoft Innovative Educator Expert in the 2025–2026 edition, connecting education technology, Microsoft tools, and AI in education.",
      kindKey: "professionalRecognition",
      criteriaPt:
        "Seleção para a comunidade MIE Expert após trilhas de aprendizado e inscrição com evidências educacionais.",
      criteriaEn:
        "Selection for the MIE Expert community after learning paths and an application with educational evidence.",
      skills: [
        "AI in Education",
        "Education Technology",
        "Global Learning And Teaching",
        "microsoft tools",
      ],
    },
  ];
  const dragon = {
    travel: null,
    animations: [],
    raf: 0,
    state: "ready",
    userPaused: false,
    generation: 0,
    progress: 0,
    played: false,
    delivered: false,
    selected: "cisco-network-defense",
    duration: 14800,
    metrics: null,
    visible: false,
    cycle: 0,
    readPaused: false,
    variant: 0,
    keepDock: false,
    launch: null,
    landed: false,
    lastDelivered: null,
  };
  let dragonGreetingTimer;
  let activeBadge;
  function dragonCanMove() {
    return !motionDisabled || $("#dragon-full-motion").checked;
  }
  function dragonMetrics() {
    const width = $("#dragon-stage").clientWidth;
    const mobile = width <= 600;
    const scale = mobile ? 0.46 : width < 850 ? 0.65 : 0.8;
    $("#dragon-stage").style.setProperty(
      "--ground-y",
      (mobile ? 42 : 44) + 304 * (1050 / 1240) * scale + 5 + "px",
    );
    return {
      width,
      scale,
      startX: -1050 * scale + 25,
      exitX: width + 45,
      endX: mobile
        ? Math.min(18, width - 1050 * scale - 18)
        : Math.max(0, width - 1050 * scale - (width < 850 ? 160 : 205) - 24),
      y: mobile ? 52 : 55,
    };
  }
  const caravanTransform = (x, y, m) =>
    `translate(${x}px,${y}px) scale(${m.scale})`;
  function dragonBadge() {
    return (
      badgeData.find((badge) => badge.id === dragon.selected) || badgeData[0]
    );
  }
  function renderDragonMission({ preserveDelivery = false } = {}) {
    const selected = dragonBadge();
    $("#dragon-mission").value = selected.id;
    const index = badgeData.indexOf(selected);
    const carried = [0, 1, 2, 3].map(
      (i) => badgeData[(index + i) % badgeData.length],
    );
    const anchors = [
      [330, 129],
      [484, 148],
      [721, 112],
      [919, 100],
    ];
    $("#dragon-cargo").innerHTML = carried
      .map((badge, i) => {
        const [x, y] = anchors[i];
        const ratio = 1050 / 1240;
        const left = 1050 - x * ratio - 54;
        const top = y * ratio + 46;
        return `<div class="cargo-hinge" data-cargo-segment="${[0, 1, 3, 5][i]}" style="left:${left}px;top:${top}px"><span class="cargo-anchor" aria-hidden="true"></span><span class="banner-rope" aria-hidden="true"></span><a class="dragon-badge-banner" data-badge-open="${badge.id}" href="${badge.url}" target="_blank" rel="noopener noreferrer" aria-label="${badge.title}: ${t("abrir detalhes", "open details")}"><img src="${asset(`assets/badges/${badge.image}`)}" alt="" width="75" height="75"/><strong>${badge.title.replace(" - Training Badge", "")}</strong><span>${badge.issuer.split(" /")[0]}</span></a></div>`;
      })
      .join("");
    if (!preserveDelivery) renderDragonDelivery(false);
    updateDragonStatus();
  }
  function renderDragonDelivery(delivered) {
    const badge = dragonBadge();
    const title = badge.title.replace(" - Training Badge", "");
    const historical =
      badge.category === "history"
        ? badge.inactive
          ? t(
              "Registro histórico · inativo desde janeiro de 2026",
              "Historical record · inactive since January 2026",
            )
          : t(
              "Registro histórico · validade atual não confirmada",
              "Historical record · current validity unconfirmed",
            )
        : "";
    if (delivered) dragon.lastDelivered = badge.id;
    $("#dragon-delivery-content").innerHTML = delivered
      ? `<div class="delivered-paper"><img src="${asset(`assets/badges/${badge.image}`)}" alt="${badge.title}" width="120" height="120"/><div><span class="credential-type">${translate(badge.kindKey)}</span><h3>${title}</h3>${historical ? `<p class="delivery-history">${historical}</p>` : ""}<button class="text-button" data-delivered-badge="${badge.id}" aria-label="${t("Abrir detalhes", "Open details")}: ${badge.title}">${t("Abrir detalhes", "Open details")} ↗︎</button></div></div>`
      : `<div class="delivery-outline" aria-hidden="true"><span>✷</span></div><p>${t("A próxima credencial chega aqui.", "The next credential arrives here.")}</p>`;
    dragon.delivered = delivered;
    const button = $("[data-delivered-badge]");
    if (button) button.addEventListener("click", () => openBadge(badge.id));
  }
  function updateDragonStatus() {
    const moving =
      dragon.state === "walking" &&
      !dragon.userPaused &&
      dragonCanMove() &&
      !document.hidden &&
      dragon.visible &&
      !dragon.readPaused &&
      !document.body.classList.contains("dialog-open");
    $("#dragon-cargo").inert = moving;
    $("#dragon-cargo").setAttribute("aria-hidden", String(moving));
    $(".dragon-scene").classList.toggle("dragon-moving", moving);
    $("#dragon-toggle").setAttribute("aria-pressed", String(!moving));
    $("#dragon-toggle").textContent = !dragonCanMove()
      ? t("Modo estático", "Static mode")
      : dragon.userPaused
        ? t("Continuar ▷", "Continue ▷")
        : dragon.readPaused
          ? t("Pausa para leitura", "Paused for reading")
          : dragon.state === "walking"
            ? t("Pausar Ⅱ", "Pause Ⅱ")
            : t("Iniciar ▷", "Play ▷");
    $("#dragon-start").innerHTML =
      `<span>${t("Voar & entregar", "Fly & deliver")}</span> →`;
    const key =
      !dragonCanMove() && dragon.state === "delivered"
        ? t(
            "Badge entregue sem movimento, conforme sua preferência.",
            "Badge delivered without motion, following your preference.",
          )
        : dragon.readPaused
          ? t(
              "Pausado enquanto você lê a credencial entregue.",
              "Paused while you read the delivered credential.",
            )
          : dragon.userPaused
            ? t(
                "Voo pausado. Você pode explorar ou ajustar o percurso.",
                "Flight paused. Explore or adjust the route.",
              )
            : dragon.state === "walking"
              ? dragon.progress > 0.78
                ? t(
                    "O guardião volta às margens para buscar outra credencial…",
                    "The guardian returns to the margins for another credential…",
                  )
                : t(
                    "Voando em ondas, com as credenciais presas às dobras.",
                    "Flying in waves, with credentials attached to the paper folds.",
                  )
              : dragon.state === "delivered"
                ? t(
                    "Entrega concluída. Abra os detalhes da credencial.",
                    "Delivery complete. Open the credential details.",
                  )
                : t(
                    "Escolha uma badge. O guardião cuida do caminho.",
                    "Choose a badge. The guardian takes care of the journey.",
                  );
    const scene = $(".dragon-scene");
    scene.dataset.dragonState = dragon.state;
    scene.dataset.dragonCycle = String(dragon.cycle);
    scene.dataset.dragonCredential = dragon.selected;
    const cycleNote = t(
      `VOO ${String(dragon.cycle || 1).padStart(2, "0")} · ${dragonBadge().title.replace(" - Training Badge", "")}`,
      `FLIGHT ${String(dragon.cycle || 1).padStart(2, "0")} · ${dragonBadge().title.replace(" - Training Badge", "")}`,
    );
    if ($("#dragon-cycle-note").textContent !== cycleNote)
      $("#dragon-cycle-note").textContent = cycleNote;
    if ($("#dragon-status").textContent !== key)
      $("#dragon-status").textContent = key;
  }
  function cancelDragonMotion() {
    dragon.generation++;
    cancelAnimationFrame(dragon.raf);
    dragon.raf = 0;
    dragon.animations.forEach((animation) => animation.cancel());
    dragon.animations = [];
    dragon.travel = null;
    dragon.launch = null;
    $("#dragon-flight-layer").replaceChildren();
  }
  function applyRestPose() {
    const baseline =
      "M245 135L330 129L484 148L624 117L721 112L824 119L919 100L990 94";
    $("#dragon-spine-link").setAttribute("d", baseline);
    $("#dragon-spine-fill").setAttribute("d", baseline);
    dragon.metrics = dragonMetrics();
    $("#dragon-caravan").style.transform = caravanTransform(
      dragon.metrics.endX,
      dragon.metrics.y,
      dragon.metrics,
    );
  }
  function resetDragon() {
    cancelDragonMotion();
    dragon.state = "ready";
    dragon.userPaused = false;
    dragon.progress = 0;
    $("#dragon-scrub").value = "0";
    $("#dragon-progress").value = "0%";
    applyRestPose();
    renderDragonMission();
  }
  function addDragonAnimation(target, frames, options, start) {
    const animation = target.animate(frames, { fill: "both", ...options });
    animation.startTime = start;
    dragon.animations.push(animation);
    return animation;
  }
  const dragonAnchors = [
    [330, 129],
    [484, 148],
    [624, 117],
    [721, 112],
    [824, 119],
    [919, 100],
    [990, 94],
  ];
  const waveCycle = 2300;
  function dragonWave(x, time) {
    const phase =
      2 * Math.PI * (time / waveCycle - (x - 230) / 760) +
      dragon.variant * 0.62;
    return {
      y: 26 * Math.sin(phase),
      angle:
        (Math.atan(((-26 * 2 * Math.PI) / 760) * Math.cos(phase)) * 180) /
        Math.PI,
    };
  }
  function waveFrames(sample) {
    return Array.from({ length: 65 }, (_, i) => ({
      transform: sample((i / 64) * waveCycle),
      offset: i / 64,
    }));
  }
  function updateDragonRibbon(time) {
    const points = [[245, 135], ...dragonAnchors].map(([x, y]) => [
      x,
      y + dragonWave(x, time).y,
    ]);
    let d = `M${points[0][0]} ${points[0][1].toFixed(2)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[Math.max(0, i - 1)],
        b = points[i],
        c = points[i + 1],
        e = points[Math.min(points.length - 1, i + 2)];
      d += `C${(b[0] + (c[0] - a[0]) / 6).toFixed(2)} ${(b[1] + (c[1] - a[1]) / 6).toFixed(2)} ${(c[0] - (e[0] - b[0]) / 6).toFixed(2)} ${(c[1] - (e[1] - b[1]) / 6).toFixed(2)} ${c[0]} ${c[1].toFixed(2)}`;
    }
    $("#dragon-spine-link").setAttribute("d", d);
    $("#dragon-spine-fill").setAttribute("d", d);
  }
  function dragonTick() {
    dragon.raf = 0;
    if (!dragon.travel) return;
    const time = dragon.travel.currentTime || 0;
    dragon.progress = Math.min(1, Math.max(0, time / dragon.duration));
    const percent = Math.round(dragon.progress * 100);
    $("#dragon-scrub").value = String(percent);
    $("#dragon-progress").value = percent + "%";
    updateDragonRibbon(time);
    applyDragonDelivery();
    updateDragonStatus();
    if (dragon.state === "walking" && dragon.travel.playState === "running")
      dragon.raf = requestAnimationFrame(dragonTick);
  }
  function launchDragonCredential() {
    const source = $(".cargo-hinge .dragon-badge-banner"),
      stage = $("#dragon-stage").getBoundingClientRect();
    if (!source) return;
    const rect = source.getBoundingClientRect();
    const target = (
      $("#dragon-delivery-content img") || $(".delivery-outline")
    ).getBoundingClientRect();
    const width = dragon.metrics.width <= 600 ? 88 : 100;
    const card = source.cloneNode(true);
    card.removeAttribute("href");
    card.removeAttribute("data-badge-open");
    card.setAttribute("aria-hidden", "true");
    card.tabIndex = -1;
    card.className = "dragon-badge-banner dragon-flight-card";
    card.style.cssText =
      "position:absolute;left:0;top:0;width:108px;height:108px;overflow:hidden;transform-origin:0 0;";
    $("#dragon-flight-layer").replaceChildren(card);
    const targetX = target.left - stage.left + (target.width - width) / 2;
    dragon.launch = {
      card,
      x: rect.left - stage.left,
      y: rect.top - stage.top,
      scale: rect.width / 108,
      targetX,
      targetY: target.top - stage.top,
      targetScale: width / 108,
    };
    $("#dragon-stage").dataset.launchOrigin = JSON.stringify({
      x: rect.left - stage.left,
      y: rect.top - stage.top,
      width: rect.width,
    });
    source.style.visibility = "hidden";
    $("#dragon-stage").dataset.launchCredential = dragon.selected;
  }
  function applyDragonDelivery() {
    const q = Math.max(0, Math.min(1, (dragon.progress - 0.55) / 0.16));
    if (dragon.progress < 0.71 && dragon.landed) {
      dragon.landed = false;
      $(".cargo-hinge").style.visibility = "";
    }
    if (dragon.progress < 0.55) {
      if (dragon.landed) {
        dragon.landed = false;
        $(".cargo-hinge").style.visibility = "";
      }
      if (dragon.launch) {
        $("#dragon-flight-layer").replaceChildren();
        dragon.launch = null;
        $(".cargo-hinge .dragon-badge-banner").style.visibility = "";
      }
      return;
    }
    if (!dragon.launch && !dragon.landed) launchDragonCredential();
    if (dragon.launch) {
      const f = dragon.launch,
        arc = (dragon.metrics.width <= 600 ? 105 : 115) * Math.sin(Math.PI * q);
      const x = f.x + (f.targetX - f.x) * q,
        y = f.y + (f.targetY - f.y) * q - arc;
      const scale = f.scale + (f.targetScale - f.scale) * q;
      f.card.style.transform = `translate(${x}px,${y}px) rotate(${18 * Math.sin(Math.PI * q)}deg) scale(${scale})`;
      f.card.dataset.flightProgress = q.toFixed(3);
      if (q >= 1) {
        renderDragonDelivery(true);
        const landedImage = $(
            "#dragon-delivery-content img",
          ).getBoundingClientRect(),
          stage = $("#dragon-stage").getBoundingClientRect();
        $("#dragon-stage").dataset.landingContinuity = JSON.stringify({
          dx: landedImage.left - stage.left - f.targetX,
          dy: landedImage.top - stage.top - f.targetY,
          dw: landedImage.width - 108 * f.targetScale,
        });
        dragon.lastDelivered = dragon.selected;
        dragon.landed = true;
        $("#dragon-stage").dataset.landedCredential = dragon.selected;
        $(".cargo-hinge").style.visibility = "hidden";
        $("#dragon-flight-layer").replaceChildren();
        dragon.launch = null;
        if (
          $("#dragon-delivery").matches(":hover") ||
          $("#dragon-delivery").contains(document.activeElement)
        ) {
          dragon.readPaused = true;
          syncDragonMotion();
        }
      }
    }
  }
  function finishDragon(token, { manual = false } = {}) {
    if (token !== dragon.generation) return;
    const loop = $("#dragon-loop").checked && dragonCanMove() && !manual;
    cancelDragonMotion();
    if (loop) {
      dragon.selected =
        badgeData[
          (badgeData.findIndex((b) => b.id === dragon.selected) + 1) %
            badgeData.length
        ].id;
      startDragonJourney({ autoplay: true, preserveDelivery: true });
      return;
    }
    dragon.state = "delivered";
    dragon.progress = 1;
    dragon.userPaused = manual;
    applyRestPose();
    renderDragonDelivery(true);
    $(".cargo-hinge").style.visibility = "hidden";
    $("#dragon-scrub").value = "100";
    $("#dragon-progress").value = "100%";
    updateDragonStatus();
  }
  function startDragonJourney({
    autoplay = false,
    paused = false,
    preserveDelivery = false,
    continuation = false,
  } = {}) {
    cancelDragonMotion();
    dragon.played = true;
    dragon.state = "walking";
    dragon.userPaused = paused;
    dragon.progress = 0;
    dragon.metrics = dragonMetrics();
    if (!continuation) dragon.cycle++;
    dragon.variant = (dragon.cycle - 1) % 3;
    dragon.landed = false;
    dragon.readPaused =
      $("#dragon-delivery").contains(document.activeElement) ||
      ($("#dragon-delivery").matches(":hover") &&
        preserveDelivery &&
        Boolean($("[data-delivered-badge]")));
    renderDragonMission({ preserveDelivery });
    if (!dragonCanMove() || !Element.prototype.animate) {
      dragon.state = "delivered";
      dragon.progress = 1;
      applyRestPose();
      renderDragonDelivery(true);
      $("#dragon-scrub").value = "100";
      $("#dragon-progress").value = "100%";
      updateDragonStatus();
      return;
    }
    const m = dragon.metrics,
      start = document.timeline.currentTime,
      token = dragon.generation;
    const distance = m.endX - m.startX;
    const lift = [0, -9, 5][dragon.variant];
    dragon.travel = addDragonAnimation(
      $("#dragon-caravan"),
      [
        { transform: caravanTransform(m.startX, m.y, m), offset: 0 },
        {
          transform: caravanTransform(
            m.startX + distance * 0.3,
            m.y - 12 + lift,
            m,
          ),
          offset: 0.2,
        },
        {
          transform: caravanTransform(m.endX, m.y - 5 + lift, m),
          offset: 0.52,
        },
        {
          transform: caravanTransform(m.endX, m.y - 5 + lift, m),
          offset: 0.74,
        },
        {
          transform: caravanTransform(m.exitX, m.y - 17 - lift, m),
          offset: 0.96,
        },
        { transform: caravanTransform(m.exitX, m.y - 17 - lift, m), offset: 1 },
      ],
      { duration: dragon.duration, easing: "linear" },
      start,
    );
    const options = {
      duration: waveCycle,
      iterations: Infinity,
      easing: "linear",
    };
    $$(".dragon-segment").forEach((segment, i) =>
      addDragonAnimation(
        segment,
        waveFrames((time) => {
          const w = dragonWave(dragonAnchors[i][0], time);
          return `translateY(${w.y}px) rotate(${w.angle}deg)`;
        }),
        options,
        start,
      ),
    );
    $$(".cargo-hinge").forEach((hinge) => {
      const x = dragonAnchors[Number(hinge.dataset.cargoSegment)][0];
      addDragonAnimation(
        hinge,
        waveFrames(
          (time) => `translateY(${dragonWave(x, time).y * (1050 / 1240)}px)`,
        ),
        options,
        start,
      );
    });
    $$(".dragon-limb").forEach((limb) => {
      const fore = limb.dataset.leg.includes("fore"),
        far = limb.dataset.leg.includes("far"),
        x = fore ? 345 : 805;
      addDragonAnimation(
        limb,
        waveFrames((time) => {
          const w = dragonWave(x, time),
            curl =
              (fore ? -37 : 33) +
              7 * Math.sin((time / waveCycle) * 2 * Math.PI - (far ? 1.6 : 0));
          return `translateY(${w.y - 16}px) rotate(${curl + w.angle * 0.5}deg)`;
        }),
        options,
        start,
      );
    });
    addDragonAnimation(
      $(".dragon-head"),
      waveFrames((time) => {
        const w = dragonWave(230, time);
        return `translateY(${w.y}px) rotate(${w.angle * 0.8}deg)`;
      }),
      options,
      start,
    );
    addDragonAnimation(
      $(".dragon-tail"),
      waveFrames((time) => {
        const w = dragonWave(990, time);
        return `translateY(${w.y}px) rotate(${Math.max(-8, Math.min(8, w.angle * 0.65 + 3 * Math.sin((time / waveCycle) * 2 * Math.PI - 1.3)))}deg)`;
      }),
      options,
      start,
    );
    [
      [".dragon-whisker", 8, 0.6],
      [".dragon-mane", 5, 0.85],
      [".dragon-beard", 7, 1.05],
      [".dragon-tail-tassel", 10, 1.55],
    ].forEach(([selector, amplitude, lag]) =>
      addDragonAnimation(
        $(selector),
        waveFrames(
          (time) =>
            `rotate(${amplitude * Math.sin((time / waveCycle) * 2 * Math.PI - lag)}deg)`,
        ),
        options,
        start,
      ),
    );
    $$(".dragon-fin").forEach((fin, i) =>
      addDragonAnimation(
        fin,
        waveFrames(
          (time) =>
            `rotate(${4 * Math.sin((time / waveCycle) * 2 * Math.PI - i * 0.6 - 0.8)}deg)`,
        ),
        options,
        start,
      ),
    );
    updateDragonRibbon(0);
    dragon.travel.onfinish = () => finishDragon(token);
    syncDragonMotion();
  }
  function syncDragonMotion() {
    const scene = $(".dragon-scene");
    const blocked =
      !dragonCanMove() ||
      document.hidden ||
      !dragon.visible ||
      dragon.readPaused ||
      document.body.classList.contains("dialog-open");
    if (dragon.state === "walking") {
      if (blocked || dragon.userPaused) {
        cancelAnimationFrame(dragon.raf);
        dragon.raf = 0;
      }
      dragon.animations.forEach((animation) => {
        if (blocked || dragon.userPaused) animation.pause();
        else animation.play();
      });
      if (!blocked && !dragon.userPaused && !dragon.raf) dragonTick();
    }
    updateDragonStatus();
    if (!blocked && !dragon.played && !motionDisabled) {
      startDragonJourney({ autoplay: true });
    }
  }
  function greetDragon() {
    clearTimeout(dragonGreetingTimer);
    $("#dragon-speech").hidden = false;
    $("#dragon-speech").textContent = t(
      "Escolha uma credencial. Vou buscá-la nas margens.",
      "Choose a credential. I will fetch it from the margins.",
    );
    dragonGreetingTimer = setTimeout(
      () => ($("#dragon-speech").hidden = true),
      3800,
    );
  }
  const dragonDetailViews = {
    head: "0 0 310 315",
    body: "232 22 390 305",
    tail: "930 4 310 235",
    whole: "0 0 1240 340",
  };
  function selectDragonDetail(view) {
    $("#dragon-art-viewport svg").setAttribute(
      "viewBox",
      dragonDetailViews[view],
    );
    $$("[data-dragon-view]").forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.dragonView === view),
      ),
    );
    $("#dragon-art-viewport").dataset.view = view;
  }
  $("#dragon-inspect").addEventListener("click", () => {
    // Clone geometry, not animated state. Prefix all paint servers to preserve unique document IDs.
    const artwork = $(".paper-dragon").cloneNode(true);
    artwork.removeAttribute("class");
    artwork.setAttribute("class", "dragon-inspection-art");
    artwork.setAttribute("aria-labelledby", "detail-dragon-art-title");
    $$("#dragon-spine-link,#dragon-spine-fill", artwork).forEach((node) =>
      node.setAttribute(
        "d",
        "M245 135L330 129L484 148L624 117L721 112L824 119L919 100L990 94",
      ),
    );
    $$("[id]", artwork).forEach((node) => (node.id = `detail-${node.id}`));
    $$("*", artwork).forEach((node) => {
      node.removeAttribute("class");
      node.removeAttribute("data-segment");
      node.removeAttribute("data-leg");
      for (const attribute of [...node.attributes]) {
        if (attribute.value.includes("url(#"))
          node.setAttribute(
            attribute.name,
            attribute.value.replaceAll("url(#", "url(#detail-"),
          );
      }
    });
    $("#dragon-art-viewport").replaceChildren(artwork);
    selectDragonDetail("head");
    openDialog($("#dragon-inspect-dialog"));
  });
  $$("[data-dragon-view]").forEach((button) =>
    button.addEventListener("click", () =>
      selectDragonDetail(button.dataset.dragonView),
    ),
  );
  function revealDragonFlight() {
    if (dragonCanMove())
      $("#dragon-stage").scrollIntoView({ block: "start", behavior: "auto" });
  }
  $("#dragon-start").addEventListener("click", () => {
    revealDragonFlight();
    startDragonJourney();
  });
  $("#dragon-toggle").addEventListener("click", () => {
    if (!dragonCanMove()) {
      startDragonJourney();
      return;
    }
    if (dragon.state !== "walking") {
      startDragonJourney();
      return;
    }
    dragon.userPaused = !dragon.userPaused;
    syncDragonMotion();
  });
  $("#dragon-reset").addEventListener("click", () => {
    resetDragon();
    if (dragonCanMove()) {
      revealDragonFlight();
      startDragonJourney();
    }
  });
  $("#dragon-greet").addEventListener("click", greetDragon);
  $("#dragon-mission").addEventListener("change", () => {
    dragon.selected = $("#dragon-mission").value;
    revealDragonFlight();
    startDragonJourney({ paused: dragon.userPaused });
  });
  $("#dragon-scrub").addEventListener("input", () => {
    if (!dragonCanMove()) {
      startDragonJourney();
      return;
    }
    const percent = Number($("#dragon-scrub").value);
    if (!dragon.travel) startDragonJourney({ paused: true });
    dragon.userPaused = true;
    dragon.animations.forEach((animation) => {
      animation.pause();
      animation.currentTime = (percent / 100) * dragon.duration;
    });
    dragon.progress = percent / 100;
    updateDragonRibbon((percent / 100) * dragon.duration);
    applyDragonDelivery();
    $("#dragon-progress").value = percent + "%";
    if (percent >= 100) finishDragon(dragon.generation, { manual: true });
    else {
      dragon.state = "walking";
      updateDragonStatus();
    }
  });
  $("#dragon-cargo").addEventListener("click", (event) => {
    const link = event.target.closest("[data-badge-open]");
    if (
      !link ||
      $("#dragon-cargo").inert ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    openBadge(link.dataset.badgeOpen);
  });
  $("#dragon-full-motion").addEventListener("change", () => {
    if ($("#dragon-full-motion").checked) {
      revealDragonFlight();
      startDragonJourney();
    } else syncDragonMotion();
  });
  $("#dragon-mission").innerHTML = [...badgeData]
    .sort((a, b) => (b.issued || "").localeCompare(a.issued || ""))
    .map((badge) => `<option value="${badge.id}">${badge.title}</option>`)
    .join("");
  renderDragonMission();
  applyRestPose();
  let dragonWidth = $("#dragon-stage").clientWidth;
  window.addEventListener("resize", () => {
    const width = $("#dragon-stage").clientWidth;
    if (Math.abs(width - dragonWidth) < 2) return;
    dragonWidth = width;
    if (dragon.state === "walking") {
      const p = dragon.progress,
        paused = dragon.userPaused,
        cycle = dragon.cycle;
      startDragonJourney({
        paused,
        preserveDelivery: true,
        continuation: true,
      });
      dragon.cycle = cycle;
      dragon.animations.forEach((a) => (a.currentTime = p * dragon.duration));
      updateDragonRibbon(p * dragon.duration);
      dragonTick();
    } else applyRestPose();
  });
  $("#dragon-loop").addEventListener("change", () => {
    if (
      $("#dragon-loop").checked &&
      dragonCanMove() &&
      dragon.state === "delivered"
    ) {
      if (dragon.lastDelivered === dragon.selected)
        dragon.selected =
          badgeData[
            (badgeData.findIndex((b) => b.id === dragon.selected) + 1) %
              badgeData.length
          ].id;
      revealDragonFlight();
      startDragonJourney({ preserveDelivery: true });
    }
    updateDragonStatus();
  });
  const dock = $("#dragon-delivery");
  dock.addEventListener("mouseenter", () => {
    dragon.readPaused = Boolean($("[data-delivered-badge]"));
    syncDragonMotion();
  });
  dock.addEventListener("mouseleave", () => {
    dragon.readPaused = dock.contains(document.activeElement);
    syncDragonMotion();
  });
  dock.addEventListener("focusin", () => {
    dragon.readPaused = true;
    syncDragonMotion();
  });
  dock.addEventListener("focusout", () =>
    requestAnimationFrame(() => {
      dragon.readPaused =
        dock.contains(document.activeElement) || dock.matches(":hover");
      syncDragonMotion();
    }),
  );

  function renderBadge(id) {
    const badge = badgeData.find((item) => item.id === id);
    if (!badge) return;
    const status = badge.inactive
      ? t("Inativa desde 15/01/2026", "Inactive since 15/01/2026")
      : badge.statusPt
        ? t(badge.statusPt, badge.statusEn)
        : t(
            "Registro público verificado no emissor",
            "Public issuer record verified",
          );
    $("#badge-dialog-content").innerHTML =
      `<p class="chapter-kicker">${badge.issuer}</p><div class="badge-dossier"><img src="${asset(`assets/badges/${badge.image}`)}" alt="${badge.title}" width="240" height="240"/><div><span class="credential-type">${translate(badge.kindKey)}</span><h2 id="badge-dialog-title">${badge.title}</h2><p>${badge[language]}</p><dl class="badge-record-facts"><div><dt>${t("EMISSÃO", "ISSUED")}</dt><dd>${badge.issued || "2023"}</dd></div><div><dt>${t("STATUS", "STATUS")}</dt><dd>${status}</dd></div></dl><h3 class="badge-detail-kicker">${t("CRITÉRIO DO EMISSOR", "ISSUER CRITERION")}</h3><p>${t(badge.criteriaPt, badge.criteriaEn)}</p><h3 class="badge-detail-kicker">${t("TEMAS DA CREDENCIAL", "CREDENTIAL TOPICS")}</h3><ul class="tags">${(badge.skills || []).map((skill) => `<li>${skill}</li>`).join("")}</ul><div class="dialog-actions"><a class="button button-primary" href="${badge.url}" target="_blank" rel="noopener noreferrer">${translate(badge.type === "issuer" ? "verifyOracle" : "verifyCredly")} ↗︎</a></div><p class="badge-dossier-note">${t("Arte original. Consulte o emissor para todos os detalhes e a situação atual.", "Original artwork. Check the issuer for full details and current status.")}</p></div></div>`;
  }
  function openBadge(id) {
    activeBadge = id;
    renderBadge(id);
    $(".dragon-scene").classList.add("badge-selected");
    openDialog($("#badge-dialog"));
  }
  $$(".badge-art-link").forEach((link) => {
    const src = $("img", link).getAttribute("src");
    const badge = badgeData.find(
      (item) => item.id === link.dataset.badgeOpen || src.endsWith(item.image),
    );
    if (!badge) return;
    link.dataset.badgeOpen = badge.id;
    link.removeAttribute("aria-hidden");
    link.removeAttribute("tabindex");
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;
      event.preventDefault();
      openBadge(badge.id);
    });
  });
  $("#badge-dialog").addEventListener("close", () => {
    activeBadge = undefined;
    $(".dragon-scene").classList.remove("badge-selected");
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        dragon.visible =
          entry.isIntersecting &&
          entry.intersectionRect.height >=
            Math.min(90, entry.boundingClientRect.height * 0.25);
        $(".dragon-scene").classList.toggle("loop-offscreen", !dragon.visible);
        syncDragonMotion();
      },
      { threshold: [0, 0.1, 0.25, 0.5, 1] },
    ).observe($("#dragon-stage"));
  } else {
    const check = () => {
      const r = $("#dragon-stage").getBoundingClientRect();
      dragon.visible = r.top < innerHeight - 90 && r.bottom > 90;
      syncDragonMotion();
    };
    window.addEventListener("scroll", check, { passive: true });
    check();
  }
  document.addEventListener("visibilitychange", syncDragonMotion);

  function updateCredentialCount() {
    const count = $$(".badge-card").filter((card) => !card.hidden).length;
    $("#credential-count").textContent =
      `${count} ${t("CREDENCIAIS", "CREDENTIALS")}`;
  }
  $$("[data-credential-filter]").forEach((button) =>
    button.addEventListener("click", () => {
      const category = button.dataset.credentialFilter;
      $$("[data-credential-filter]").forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
        item.classList.toggle("active", item === button);
      });
      $$(".badge-card").forEach(
        (card) =>
          (card.hidden =
            category !== "all" && card.dataset.credentialCategory !== category),
      );
      $$("[data-credential-group]").forEach(
        (group) =>
          (group.hidden =
            category !== "all" && group.dataset.credentialGroup !== category),
      );
      updateCredentialCount();
    }),
  );
  let formationExpanded = false;
  function filterFormation() {
    const search = $("#formation-search")
      .value.trim()
      .toLocaleLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const kind = $("#formation-type").value;
    let matched = 0;
    let shown = 0;
    $$(".formation-record").forEach((record) => {
      const text = record.textContent
        .toLocaleLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const matches =
        (!search || text.includes(search)) &&
        (kind === "all" || record.dataset.recordKind === kind);
      if (matches) matched++;
      const visible =
        matches &&
        (formationExpanded || search || kind !== "all" || shown < 12);
      record.hidden = !visible;
      if (visible) shown++;
    });
    $("#formation-count").textContent =
      `${shown} / ${matched} ${t("REGISTROS", "RECORDS")}`;
    $("#formation-empty").hidden = matched > 0;
    $("#formation-more").hidden =
      Boolean(search) || kind !== "all" || matched <= 12;
    $("#formation-more").textContent = formationExpanded
      ? t("Mostrar menos registros −", "Show fewer records −")
      : translate("formationMore");
  }
  $("#formation-search").addEventListener("input", filterFormation);
  $("#formation-type").addEventListener("change", filterFormation);
  $("#formation-more").addEventListener("click", () => {
    formationExpanded = !formationExpanded;
    filterFormation();
  });
  // Margin annotations, old key sequences, and two owner-requested inside jokes.
  let activeBonus = "hunter";
  let caughtBugs = new Set();
  let marginCount = 0;
  let secretLetters = "";
  let secretKeys = [];
  const konami = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];
  function renderBonus(type) {
    activeBonus = type;
    $$("[data-bonus]").forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.bonus === type),
      ),
    );
    if (type === "hunter") {
      $("#bonus-panel").innerHTML =
        `<p class="small-label">LOCAL BONUS / BUG HUNT</p><h3>${t("Caçador de bugs por profissão.<br>De monstros, por paixão.", "Bug hunter by profession.<br>Monster hunter by passion.")}</h3><p>${t("Três bugs escaparam para as margens. Encontre todos para fechar este capítulo.", "Three bugs escaped into the margins. Find them all to close this chapter.")}</p><div class="bug-arena">${[0, 1, 2].map((i) => `<button class="bug-target ${caughtBugs.has(i) ? "caught" : ""}" data-catch-bug="${i}" aria-label="${t("Capturar bug", "Catch bug")} ${i + 1}" ${caughtBugs.has(i) ? "disabled" : ""}><svg viewBox="0 0 60 60" aria-hidden="true"><path d="M19 25l-11-8m11 20L7 40m17 6-8 10m25-31 11-8m-11 20 12 3m-17 6 8 10M26 17l-6-9m14 9 6-9" fill="none" stroke="currentColor" stroke-width="3"/><path d="M19 26l11-8 11 8v17l-11 8-11-8z" fill="none" stroke="currentColor" stroke-width="3"/><path d="M30 20v29M20 33h20" stroke="currentColor" stroke-width="2"/></svg><span>bug_0${i + 1}</span></button>`).join("")}</div><div class="bug-game-footer"><span id="bug-count" aria-live="polite">${caughtBugs.size} / 3 ${t("CAPTURADOS", "CAUGHT")}</span><button class="text-button" id="reset-bugs">${t("Recomeçar a caçada", "Restart the hunt")} ↺</button></div><p class="hunt-complete" id="hunt-complete" ${caughtBugs.size === 3 ? "" : "hidden"}>${t("CAÇADA CONCLUÍDA. BUGS CAPTURADOS.", "HUNT COMPLETE. BUGS CAUGHT.")}</p>`;
      $$("[data-catch-bug]").forEach((button) =>
        button.addEventListener("click", () => {
          caughtBugs.add(Number(button.dataset.catchBug));
          button.classList.add("caught");
          button.disabled = true;
          $("#bug-count").textContent =
            `${caughtBugs.size} / 3 ${t("CAPTURADOS", "CAUGHT")}`;
          if (caughtBugs.size === 3) {
            $("#hunt-complete").hidden = false;
            $("#reset-bugs").focus();
          } else {
            $$("[data-catch-bug]")
              .find((item) => !item.disabled)
              ?.focus();
          }
        }),
      );
      $("#reset-bugs").addEventListener("click", () => {
        caughtBugs = new Set();
        renderBonus("hunter");
        $("[data-catch-bug]").focus();
      });
    } else if (type === "wakanda") {
      $("#bonus-panel").innerHTML =
        `<p class="small-label">SECRET_002 / WAKANDA</p><div class="wakanda-art" aria-hidden="true"><span>W</span><i></i><i></i><i></i></div><h3>WAKANDA!</h3><p>${t("Até o backend tem seu vibranium: testes, contratos e boas decisões de arquitetura.", "Even a backend has its vibranium: tests, contracts, and sound architecture decisions.")}</p><span class="bonus-stamp">${t("PAINEL DESBLOQUEADO", "PANEL UNLOCKED")}</span>`;
    } else {
      $("#bonus-panel").innerHTML =
        `<p class="small-label">SECRET_003 / PIRIBULL</p><div class="piribull-art" aria-hidden="true">PIRI<br>BULL<span>!</span></div><h3>Piribull. Perebull.</h3><p>${t("Se você entendeu a referência, este painel é seu. Algumas piadas não precisam de documentação.", "If you got the reference, this panel is yours. Some jokes do not need documentation.")}</p><span class="bonus-stamp">${t("ENCONTRADO NAS MARGENS", "FOUND IN THE MARGINS")}</span>`;
    }
  }
  function openBonus(type) {
    if ($("dialog[open]")) return;
    renderBonus(type);
    openDialog($("#bonus-dialog"));
  }
  $$("[data-bonus]").forEach((button) =>
    button.addEventListener("click", () => renderBonus(button.dataset.bonus)),
  );
  $("#secret-ink").addEventListener("click", () => {
    marginCount++;
    if (marginCount % 3 === 0) openBonus("hunter");
    else
      showToast(
        marginCount % 3 === 1
          ? t("Uma anotação curiosa…", "A curious annotation…")
          : t("Tem mais coisa nesta margem.", "There is more in this margin."),
      );
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.repeat ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.target.closest('input,textarea,select,[contenteditable="true"]') ||
      $("dialog[open]")
    )
      return;
    secretKeys.push(
      event.key.length === 1 ? event.key.toLowerCase() : event.key,
    );
    secretKeys = secretKeys.slice(-10);
    if (secretKeys.join("|") === konami.join("|")) {
      secretKeys = [];
      openBonus("hunter");
      return;
    }
    if (event.key.length === 1) {
      secretLetters = (secretLetters + event.key.toLowerCase()).slice(-12);
      if (secretLetters.endsWith("wakanda")) {
        secretLetters = "";
        openBonus("wakanda");
      } else if (
        secretLetters.endsWith("piribull") ||
        secretLetters.endsWith("perebull")
      ) {
        secretLetters = "";
        openBonus("piribull");
      }
    }
  });

  // Reader controls change pages without scroll hijacking; Back/Forward still use real anchors.
  const chapterIds = [
    "home",
    "story",
    "projects",
    "github",
    "skills",
    "credentials",
    "contact",
  ];
  let currentChapter = 0;
  function updateChapterDock() {
    const position = window.scrollY + window.innerHeight * 0.35;
    let index = 0;
    chapterIds.forEach((id, i) => {
      if ($("#" + id).offsetTop <= position) index = i;
    });
    currentChapter = index;
    $("#chapter-position").textContent = `0${index + 1} / 07`;
    $("#chapter-prev").disabled = index === 0;
    $("#chapter-next").disabled = index === chapterIds.length - 1;
  }
  function turnPanel(direction) {
    const index = Math.max(
      0,
      Math.min(chapterIds.length - 1, currentChapter + direction),
    );
    const target = $("#" + chapterIds[index]);
    location.hash = "#" + chapterIds[index];
    target.scrollIntoView({
      behavior: motionDisabled ? "instant" : "smooth",
      block: "start",
    });
    if (!motionDisabled) {
      target.classList.remove("page-turning");
      void target.offsetWidth;
      target.classList.add("page-turning");
    }
    currentChapter = index;
    $("#chapter-position").textContent = `0${index + 1} / 07`;
    $("#chapter-prev").disabled = index === 0;
    $("#chapter-next").disabled = index === chapterIds.length - 1;
  }
  $("#chapter-prev").addEventListener("click", () => turnPanel(-1));
  $("#chapter-next").addEventListener("click", () => turnPanel(1));
  chapterIds.forEach((id) =>
    $("#" + id).addEventListener("animationend", () =>
      $("#" + id).classList.remove("page-turning"),
    ),
  );

  let scrollQueued = false;
  function updateProgress() {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    $("#progress").style.width =
      `${total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0}%`;
    updateChapterDock();
    scrollQueued = false;
  }
  window.addEventListener(
    "scroll",
    () => {
      if (!scrollQueued) {
        requestAnimationFrame(updateProgress);
        scrollQueued = true;
      }
    },
    { passive: true },
  );
  window.addEventListener("resize", () => {
    updateProgress();
    if (window.innerWidth > 820) closeMobile();
  });
  if ("IntersectionObserver" in window) {
    const loopObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) =>
          entry.target.classList.toggle(
            "loop-offscreen",
            !entry.isIntersecting,
          ),
        ),
      { threshold: 0 },
    );
    $$(".ticker,.cover-sun,.contact-asterisk,.scroll-symbol").forEach((node) =>
      loopObserver.observe(node),
    );
  }
  document.addEventListener("visibilitychange", () =>
    document.body.classList.toggle("tab-inactive", document.hidden),
  );
  document.body.classList.add("has-js");
  applyLanguage();
  updateProgress();
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("pending");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    $$(".section-heading.reveal").forEach((node) => {
      if (!motionDisabled) node.classList.add("pending");
      observer.observe(node);
    });
    const chapterObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting)
            $$(".desktop-nav a").forEach((link) =>
              link.classList.toggle(
                "active",
                link.hash === `#${entry.target.id}`,
              ),
            );
        }),
      { rootMargin: "-20% 0px -60% 0px" },
    );
    $$("main>section[id]").forEach((node) => chapterObserver.observe(node));
  }
})();
