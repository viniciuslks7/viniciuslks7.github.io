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
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let motionDisabled =
    storage.get("vo-motion") === "off" || prefersReduced.matches;
  const originals = new Map();
  $$("[data-i18n]").forEach((node) => {
    if (!originals.has(node.dataset.i18n))
      originals.set(node.dataset.i18n, node.innerHTML);
  });
  $$("[data-i18n-aria]").forEach((node) =>
    originals.set(node.dataset.i18nAria, node.getAttribute("aria-label")),
  );
  $$("[data-i18n-placeholder]").forEach((node) =>
    originals.set(node.dataset.i18nPlaceholder, node.placeholder),
  );
  const english = {
    appearanceLabel: "Customize appearance",
    appearanceTitle: "Appearance",
    appearanceButton: "Theme",
    lightTheme: "Paper",
    darkTheme: "Night",
    systemTheme: "System",
    accentTitle: "Accent color",
    accentRed: "Red",
    accentTeal: "Teal",
    accentIndigo: "Indigo",
    accentCustom: "Custom",
    chooseColor: "Choose a color",
    doneAppearance: "Done",
    brandLabel: "Vinicius Oliveira, home",
    mobileNavLabel: "Mobile navigation",
    skip: "Skip to content",
    brandSub: "BACKEND DEVELOPER",
    navStory: "Story",
    navProjects: "Projects",
    navCredentials: "Credentials",
    navContact: "Contact",
    navLabel: "Main navigation",
    commandLabel: "Open quick navigation",
    introRole: "Software developer",
    introDescription:
      "At Ciplafe Móveis, I build internal applications, integrate TOTVS Protheus with other systems, and migrate ERP databases. I built the system the reception team uses to log visitors and fleet vehicle movements in place of paper logs and spreadsheets.",
    exploreProjects: "View projects",
    quickView: "Professional summary",
    portraitLocation: "Brazil",
    highlightsLabel: "Portfolio highlights",
    highlightExperience: "Current role",
    highlightEducation: "Education",
    highlightCourse: "Completion badge",
    highlightCollection: "Interactive collection",
    highlightDragon: "Dragon flight",
    storyKicker: "Background",
    storyTitle: "From ETEC<br>to backend.",
    storyIntro:
      "I began studying chemistry at technical school in 2017. By the time I earned my degree in Internet Systems in 2026, I had worked on the Auxilium prototype and built backend applications for SESI’s education programs.",
    originTitle: "From chemistry to Auxilium",
    originBody:
      "At ETEC Professor Armando José Farinazzo, I studied Chemistry from 2017 to 2019. In 2019, I joined the CROWS Formula Drone team in administration and operations. Observing assembly and programming sparked my curiosity about technology.",
    award: "AUXILIUM",
    awardPlace: "2ND PLACE",
    awardEvent: "ACADEMIC HACKATHON · ROBOTICS · 2022",
    journeyLabel: "EDUCATION",
    ciplafeDate: "JUL 2026 — PRESENT",
    ciplafeRole: "Junior Software Developer",
    ciplafeBody:
      "TOTVS Protheus, ADVPL/TLPP, SQL Server, and RM BI. Integrations and internal tools with Python and Node.js.",
    sesiRole: "Internship · Backend & IT",
    sesiBody:
      "Python and PostgreSQL applications, process automation, and infrastructure support.",
    education: "Technology degree in Internet Systems.",
    philosophyTitle: "How I work<br>with AI",
    philosophyBody:
      "Before delegating, I define the problem and what a successful result looks like. I give agents clear responsibilities for investigation, implementation, and review. I then integrate their changes and test the result end to end.",
    agentMotto: "Whatever the problem, I’ll find a way to solve it.",
    agentOrchestration: "Agent orchestration",
    agentInstructionsTitle: "Instructions, skills, and MCP",
    agentInstructions: "I write <code>AGENTS.md</code> and <code>CLAUDE.md</code> files that set the project scope, repository conventions, and verification commands. I turn recurring procedures into skills and use MCP to connect agents to the tools and data each task needs.",
    agentToolsTitle: "Development environments",
    agentTools: "I use Antigravity, Codex, and Claude Code to run agent tasks from investigation through review. In Cursor and GitHub Copilot, I use editor context to trace code, compare implementations, and review changes. The same project acceptance criteria apply in every environment.",
    resumeDownload: "Download résumé (PDF)",
    philosophyFooter: "LEARNING IS PART OF THE PROCESS.",
    projectsKicker: "CASE STUDIES",
    projectsTitle: "Selected projects",
    projectsIntro:
      "Choose a skill to explore. Try the interfaces for Keel and Auxilium, or start with a test or component in Star Wars API and Analytics Dashboard.",
    filterLabel: "Filter projects",
    filterAll: "All",
    filterMobile: "Mobile",
    filterData: "Data",
    dataCategory: "DATA",
    projectTechnologies: "Technologies",
    ledgerDebit: "DEBIT",
    ledgerCredit: "CREDIT",
    keelKind: "TRANSACTION CONSISTENCY",
    keelSummary:
      "This TypeScript wallet records both sides of every transfer. Try sending the same amount twice with one idempotency key, then check the statements for both accounts.",
    readCase: "Read case study",
    keelDemo: "Test a transfer",
    starwarsKind: "EXTERNAL API CACHING",
    starwarsTest: "Read the cache tests",
    starwarsSummary:
      "This Python API turns SWAPI data into search results and rankings. The cache tests show when the API can reuse an earlier response and when it needs to fetch fresh data.",
    auxiliumKind: "NAVIGATION & FORMS",
    auxiliumDemo: "Explore the web demo",
    auxiliumSummary:
      "The mobile prototype guides people offering or requesting donations. In the separate web demo, filter the fictional listings by city and save a favorite to find it again under Minha atividade.",
    analyticsKind: "DATA VISUALIZATION",
    analyticsSummary:
      "The dashboard compares order volume and average delivery time by neighborhood. Read the chart component to see how each area’s order count affects the average for the group labeled “Outros” (other neighborhoods).",
    analyticsDecision: "Which neighborhoods appear in the chart?",
    analyticsInline:
      "The query returns up to 50 neighborhoods ranked by sales volume. The chart shows the first ten individually and groups the rest of the results into a single bar to keep the comparison readable.",
    analyticsSource: "Read the component",
    browseSource: "Browse the repository index",
    allRepositories: "All repositories",
    sandboxKicker: "LOCAL LAB",
    sandboxTitle: "Make a request.<br>See the reasoning.",
    sandboxIntro:
      "This portfolio simulator generates sample API responses in your browser. Pick an endpoint to inspect the JSON.",
    sandboxNote:
      "Anime missions and amounts are fictional. The name and links are mine; this experiment does not represent a deployed backend or professional availability.",
    endpointLabel: "Choose an experiment",
    run: "Run →",
    healthExplanation:
      "A health check tells you whether the service is available.",
    skillsKicker: "Technologies",
    skillsTitle: "Tools I<br>work with.",
    skillsIntro:
      "In my ERP work, I use ADVPL, TLPP and SQL Server. In my public projects, I use TypeScript to model a digital wallet’s transaction rules and Python to cache responses from an external API by resource.",
    skillBackend: "INPUT VALIDATION AND BUSINESS RULES",
    skillDataTitle: "Data & ERP",
    skillData: "PROTHEUS CUSTOMIZATION AND SQL QUERIES",
    skillCloud: "SERVER AUTOMATION AND CLOUD TRAINING",
    skillPracticeTitle: "Engineering practice",
    skillPractice: "TESTING CACHE BEHAVIOR AND BUSINESS RULES",
    credentialsKicker: "Continuing education",
    credentialsTitle: "Courses and<br>credentials.",
    credentialsIntro:
      "The first card shows my most recently issued badge. Check the issuer’s record, browse earlier badges, or choose one for the dragon to deliver.",
    courseCompletion: "COMPLETED COURSES",
    viewCertificates: "View certificates",
    cyberTitle: "Introduction to Cybersecurity",
    aiCourseTitle: "AI & development",
    credentialNote:
      "Learning badges, issuer credentials, and completed courses are listed separately. Check each issuer for current status.",
    certificateCollection: "Courses & certificates",
    contactKicker: "Contact",
    contactTitle: "Let’s <span>talk.</span>",
    contactDescription:
      "If you’d like to discuss a backend role or an integration project, get in touch by email or on LinkedIn. I’d like to hear about the problem your team is working on and the systems involved.",
    copyEmail: "Copy email",
    backTop: "Back to top",
    footer: "ONE CHAPTER AT A TIME.",
    keyboard: "Keyboard shortcuts",
    closeLabel: "Close",
    quickKicker: "PROFESSIONAL SUMMARY",
    quickRole: "Software Engineering",
    quickSummary:
      "At Ciplafe, I build internal applications, migrate Protheus databases, and develop tools for IT updates. At SESI, I worked on Python and PostgreSQL backends, supported Linux servers, and used AI in teaching.",
    quickCurrent: "CURRENTLY",
    quickCurrentValue:
      "Junior Software Developer at Ciplafe Móveis · Jul/2026 – present",
    quickEducation: "EDUCATION",
    quickEducationValue:
      "Technology degree in Internet Systems · FATEC · Jul/2026",
    quickProjects: "EXPLORE",
    emailMe: "Send an email",
    commandTitle: "WHERE TO NEXT?",
    commandSearchLabel: "Search destinations",
    commandPlaceholder: "Find a chapter or action…",
    commandHint: "↑ ↓ navigate · Enter open · Esc close · Ctrl/⌘ K search",
    awsExamSummary: "I earned the <strong>AWS Certified Cloud Practitioner</strong> certification by examination. The AWS Cloud Quest: Cloud Practitioner badge records completion of the hands-on learning path.",
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
      "Look closely at the forked antlers above the brow, the curved fangs, and the rows of scales that narrow toward the tail.",
    dragonInspectViews: "Dragon illustration views",
    dragonInspectHead: "Face & antlers",
    dragonInspectBody: "Scales & claws",
    dragonInspectTail: "Tail & folds",
    dragonInspectWhole: "Whole dragon",
    dragonInspectNote:
      "A static illustration study. The flying sequence pauses while you look closer.",
    oct2025: "OCT 2025",
    openSourceLabel: "OPEN SOURCE",
    keelDecision: "Why use double-entry bookkeeping?",
    starwarsDecision: "When does the API fetch fresh data?",
    auxiliumDecision: "When can someone continue registration?",
    keelInline:
      "Each transfer creates a debit and a credit for the same amount. The entries preserve enough history to reconstruct each balance and trace a movement back to its transaction.",
    starwarsInline:
      "The client keeps film responses for 24 hours and other resources for one hour. Repeat lookups during that window save a call to SWAPI, though a change upstream can take time to appear.",
    auxiliumInline:
      "In the React Native prototype, someone requesting help can advance once they enter their name, address and age and select at least one category of donation.",
    workKicker: "WORK EXPERIENCE",
    workTitle: "Software in<br>daily operations.",
    workSummary:
      "At SESI, I combined software development and server automation with the use of AI in teaching. At Ciplafe, I work on the company’s manufacturing ERP and build applications for its property management and IT teams.",
    workDirection:
      "I want to keep broadening this toolkit in software engineering, cloud, and useful products. Contact channels for project and opportunity discussions are in the final chapter.",
    workCurrent: "JUL 2026 — PRESENT",
    workCiplafe1:
      "I adapt TOTVS Protheus routines and fields using ADVPL and TLPP. I also apply patches and maintain the ERP environments.",
    workCiplafe2:
      "I migrate Protheus databases and refresh the data in ERP environments. I write SQL Server queries and use TOTVS RM BI to organize the information our teams use in their daily work.",
    workCiplafe3:
      "I automate tasks with Python and build internal applications with Node.js for both business operations and the IT team.",
    workSesi1:
      "I built backend services for educational applications and internal systems using Python and PostgreSQL.",
    workSesi2:
      "I wrote Python scripts for server tasks, automated administrative workflows, and supported physical servers and Linux and Windows environments.",
    githubKicker: "GITHUB",
    githubTitle: "Repository index",
    githubIntro:
      "Three ways into my code. Open an architecture decision, read the API tests, or see how delivery times are plotted.",
    githubProfile: "Visit my profile",
    repoKeel:
      "The architecture records explain why balances come from ledger entries and how the system handles simultaneous transfers.",
    repoStarwars:
      "The tests show how the API validates SWAPI data and organizes characters, planets, and starships.",
    repoAnalytics:
      "A dashboard for restaurants to track sales and delivery times. Its React component turns delivery metrics into an ECharts visualization.",
    repoDecisions: "Architecture decisions ↗︎",
    repoDemo: "Browser demo ↗︎",
    repoTests: "Explore the tests ↗︎",
    repoChart: "Chart source ↗︎",
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
    dragonKicker: "The credential dragon",
    dragonPause: "Pause dragon Ⅱ",
    dragonGreetLabel: "Greet the paper dragon",
    dragonGreet: "Greet the dragon",
    dragonCaption:
      "Folded paper. Real learning. The badges stay still for you to explore.",
  });
  Object.assign(english, {
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
    dragonDeliveryLabel: "Collection · 15 badges",
    galleryIssuers: "Credly and Oracle",
    dragonCaptionV3:
      "Each badge lands in its own slot. Open a slot to read the credential or ask the guardian to bring it.",
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
    formationTitle: "59 learning records",
    claudeCompletion: "Completion badge",
    verifyClaudeBadge: "Verify the Claude 101 badge",
    verifyBadge: "Verify badge",
    claudeIssued: "October 28, 2026",
    claudeIssuedLabel: "ISSUED",
    claudeCourseTopics:
      "The course covers writing prompts for Claude, organizing context in projects, and creating artifacts.",
    claudeCourseLink: "View the course syllabus",
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
      "I co-founded MigrateDev and served as technical lead for Auxilium. I worked with the team on the application architecture and the prototype’s data model.",
    independentTitle: "Independent projects",
    independentDate: "JAN 2023 — PRESENT",
    independentBody:
      "I build APIs and web applications. In Keel, I document the architecture decisions behind a digital wallet. In Star Wars API, the tests show when the service should fetch fresh data.",
    prototypeSource: "Mobile prototype source",
    skillWebTitle: "Web & interfaces",
    skillWeb: "REGISTRATION FORMS AND INTERACTIVE CHARTS",
    skillLanguagesTitle: "Other languages",
    skillLanguages: "COURSEWORK AND PRACTICE PROJECTS",
    skillInfraTitle: "Infrastructure, cloud & workflow",
    sandboxOwner: "VINICIUS OLIVEIRA · DEVELOPER MODE",
    sandboxLocal: "LOCAL · ILLUSTRATIVE",
    sandboxMissionLabel: "Choose a fictional mission",
    missionPaper: "Paper Dojo",
    missionPiribull: "Perebull Protocol",
    missionWakanda: "WAKANDA Archive",
  });
  Object.assign(english, {
    skillBackend: "INPUT VALIDATION AND BUSINESS RULES",
    skillData: "PROTHEUS CUSTOMIZATION AND SQL QUERIES",
    skillCloud: "SERVER AUTOMATION AND CLOUD TRAINING",
    healthExplanation:
      "An illustrative health check, without querying a real server.",
    workSesi3: "I mentored learners in programming, supported the use of AI in teaching, and worked on harness engineering for AI.",
    ciplafeProjectsLink: "View Ciplafe’s internal projects",
    ciplafeProjectsTitle: "Internal projects at Ciplafe",
    ciplafeReceptionTitle: "Reception System",
    ciplafeReceptionBody: "I built a modular Node.js monolith to log visitors and fleet vehicle movements. Staff can search the history, see who made each change, and export reports to Excel.",
    ciplafeReceptionData: "The front desk writes to a local SQLite database. SQL Server receives a copy for reporting and auditing, so staff can keep logging activity when the mirror is unavailable.",
    ciplafePropertyTitle: "Property Management System",
    ciplafePropertyBody: "I built a web application with Node.js and SQLite to track urban and rural properties, along with their taxes, contracts, and documents. The data model keeps the property, its land registry record, and its tax registration distinct so each retains its own history.",
    ciplafePropertyStatus: "Undergoing operational validation. The next step is to verify that the services start and stop correctly on the pilot server.",
    ciplafeErpTitle: "Protheus Update Console",
    ciplafeErpBody: "I built a console that compares ERP versions and checks packages before installation. An execution log ties each update to its environment, package, and operator, giving the team a record for checking backup steps, resuming work, and investigating failures.",
    ciplafeErpStatus: "Assisted pilot. The rehearsal used a real package and simulated patch installation and service operations. The first live maintenance window is pending.",
    ciplafeInfraTitle: "Workstation Update Console",
    ciplafeInfraBody: "I built a console for remotely updating Claude, Node.js, and Python on networked workstations. From the same console, IT can check whether Claude and each workstation’s MCP connections are working.",
    workMigrateDate: "MAY 2023 — JAN 2025",
  });
  const projectData = {
    keel: {
      title: "Keel",
      category: "Backend",
      number: "001",
      tags: ["TypeScript", "Fastify", "PostgreSQL", "Vitest"],
      repo: "https://github.com/viniciuslks7/Keel",
      demo: "https://viniciuslks7.github.io/Keel/",
      pt: {
        summary:
          "Carteira digital em TypeScript que registra débitos e créditos em PostgreSQL e calcula o saldo a partir desses lançamentos.",
        challenge:
          "Uma transferência pode ser concluída mesmo quando o cliente perde a resposta. O serviço precisa reconhecer a nova tentativa e proteger o saldo quando chegam operações simultâneas.",
        decisions: [
          "Armazenar valores em centavos usando números inteiros",
          "Vincular a chave de idempotência ao conteúdo da operação",
          "Bloquear as contas por ordem de identificador antes de verificar o saldo",
        ],
        implementation:
          "O Fastify valida o pedido e chama o caso de uso. No adaptador PostgreSQL, a verificação da chave e os lançamentos participam da mesma transação.",
        proof:
          "A decisão de arquitetura ADR-0004 explica por que enviar os mesmos dados devolve a transação original e por que mudar o valor com a mesma chave gera um conflito HTTP 409.",
        note: "A demo executa o mesmo domínio com contas fictícias em memória. Recarregar a página reinicia os saldos.",
      },
      en: {
        summary:
          "A digital wallet service with a TypeScript ledger and PostgreSQL persistence.",
        challenge:
          "A transfer can succeed even if the client loses the response. The service must recognize a retry and protect the available balance when requests arrive at the same time.",
        decisions: [
          "Represent amounts in integer minor units",
          "Bind the idempotency key to the request contents",
          "Lock accounts in ID order before checking the balance",
        ],
        implementation:
          "Fastify validates the request and invokes the use case. In PostgreSQL, the key check and the entries are part of the same transaction.",
        proof:
          "Architecture decision ADR-0004 explains why resending identical data returns the original transaction and why changing the amount under the same key returns HTTP 409 Conflict.",
        note: "The demo runs the same domain code with fictional accounts in memory. Reloading the page resets their balances.",
      },
    },
    starwars: {
      title: "Star Wars API",
      category: "Backend",
      number: "002",
      tags: ["Python", "HTTPX", "Pydantic", "Google Cloud", "Pytest"],
      repo: "https://github.com/viniciuslks7/API-Starwars",
      pt: {
        summary:
          "Serviço REST para pesquisar personagens, ordenar naves e consultar a cronologia dos filmes com dados da SWAPI.",
        challenge:
          "Montar uma busca ou um ranking pode exigir várias páginas da fonte. A escolha do prazo de cache afeta tanto o número de chamadas quanto a atualização dos resultados.",
        decisions: [
          "Usar a URL consultada como chave de cache",
          "Definir a validade de acordo com o tipo de recurso",
          "Manter o acesso à SWAPI em um cliente assíncrono com HTTPX",
        ],
        implementation:
          "O cliente procura a URL no cache antes da chamada HTTP. Ao buscar os dados na SWAPI, guarda a resposta em memória. Cada instância da aplicação mantém sua própria cópia.",
        proof:
          "Em test_cache_service.py, os testes cobrem a leitura de uma entrada válida, a expiração e a execução com o cache desativado.",
        note: "O README traz as instruções para executar a API e os testes localmente.",
      },
      en: {
        summary:
          "A REST service for searching characters, ranking starships and exploring film timelines with data from SWAPI.",
        challenge:
          "Building a search result or ranking can take several pages from the upstream API. The cache lifetime affects both the number of requests and how quickly a change becomes visible.",
        decisions: [
          "Use the upstream URL as the cache key",
          "Set the lifetime by resource type",
          "Keep SWAPI access in an asynchronous HTTPX client",
        ],
        implementation:
          "The client checks the cache before making an HTTP request. After a fetch, it stores the response in memory. Each application instance maintains its own copy.",
        proof:
          "In test_cache_service.py, the tests cover reading a valid entry, expiration and operation with caching disabled.",
        note: "The README explains how to run the API and the tests locally.",
      },
    },
    auxilium: {
      title: "Auxilium",
      category: "Mobile / Web",
      number: "003",
      repo: "https://github.com/viniciuslks7/Aulas-de-React",
      demo: "https://viniciuslks7.github.io/auxilium-demo/",
      tags: ["ETEC 2022", "MigrateDev 2023–2025", "React Native / Expo"],
      pt: {
        summary:
          "Projeto de doações criado em equipe na ETEC em 2022 e desenvolvido depois pela equipe da MigrateDev.",
        challenge:
          "Quem oferece uma doação e quem pede ajuda precisam fornecer informações diferentes. A equipe organizou o cadastro a partir dessa escolha inicial.",
        decisions: [
          "Separar os percursos por perfil",
          "Dividir o cadastro em etapas",
          "Validar os campos antes de encaminhar os dados à tela seguinte",
        ],
        implementation:
          "De maio de 2023 a janeiro de 2025, atuei como cofundador e responsável técnico na MigrateDev. Minha contribuição incluiu a arquitetura da aplicação e a modelagem dos dados.",
        proof:
          "O repositório Aulas-de-React preserva as telas do protótipo em Expo. A Oracle Academy registra o 2º lugar da equipe Starshooting com o Auxilium no hackathon de robótica de 2022.",
        note: "A demo web é uma versão de portfólio em HTML, CSS e JavaScript. Usa itens fictícios e mantém os favoritos em memória até a página ser recarregada.",
      },
      en: {
        summary:
          "A team donation project started at ETEC in 2022 and later developed as a MigrateDev initiative.",
        challenge:
          "People offering donations and people requesting help need to supply different information. The team used that initial choice to structure registration.",
        decisions: [
          "Provide a separate path for each role",
          "Split registration into steps",
          "Validate each step before passing its data to the next screen",
        ],
        implementation:
          "From May 2023 to January 2025, I worked as a cofounder and technical lead at MigrateDev. My contribution included application architecture and data modeling.",
        proof:
          "The Aulas-de-React repository preserves the Expo prototype screens. Oracle Academy records team Starshooting’s second place with Auxilium at the 2022 robotics hackathon.",
        note: "The web demo is a separate HTML, CSS and JavaScript portfolio version. It uses fictional listings and keeps favorites in memory until the page reloads.",
      },
    },
    analytics: {
      title: "Analytics Dashboard",
      category: "Analytics",
      number: "004",
      tags: ["React", "TypeScript", "ECharts", "FastAPI", "PostgreSQL"],
      repo: "https://github.com/viniciuslks7/Analytics-Dashboard",
      pt: {
        summary: "Painel para restaurantes acompanharem vendas e entregas. A API em FastAPI recebe os filtros e o frontend em React apresenta os resultados por bairro.",
        challenge: "Um bairro com poucos pedidos pode ter um tempo de entrega atípico. Ao combinar vários bairros, a média precisa refletir quantos pedidos cada um representa.",
        decisions: ["Consultar a média e a quantidade de vendas juntas", "Ponderar o tempo de cada bairro pela quantidade de pedidos", "Abrir o detalhamento somente para bairros individuais"],
        implementation: "O componente soma os tempos médios multiplicados pelos respectivos volumes e divide pelo total de pedidos do grupo. O ECharts exibe o resultado ao lado dos bairros individuais.",
        proof: "Em DeliveryMetricsChart.tsx, acompanhe o cálculo de totalTime e totalQtd até a barra “Outros” e a identificação do grupo no detalhe do gráfico.",
        note: "O README descreve como executar o painel, a API e o PostgreSQL localmente.",
      },
      en: {
        summary: "A restaurant dashboard for tracking sales and deliveries. The FastAPI service receives the filters, and the React frontend displays the results by neighborhood.",
        challenge: "An area with few orders can have an unusual delivery time. When several neighborhoods are combined, the average needs to reflect how many orders each one represents.",
        decisions: ["Request both average time and sales count", "Weight each area’s delivery time by its order count", "Enable drill-down for individual neighborhoods only"],
        implementation: "The component multiplies each mean by the corresponding volume, sums those values and divides by the group’s total orders. ECharts plots the result alongside the individual neighborhoods.",
        proof: "In DeliveryMetricsChart.tsx, follow totalTime and totalQtd into the “Outros” bar and the tooltip identifying it as a grouped result.",
        note: "The README explains how to run the dashboard, API and PostgreSQL locally.",
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
    $("#language").lang = language === "en" ? "pt-BR" : "en";
    $("#language").setAttribute(
      "aria-label",
      t("Switch to English", "Mudar para português"),
    );
    $$("[data-badge-en]").forEach((node) => {
      node.textContent = language === "en" ? node.dataset.badgeEn : node.dataset.badgePt;
    });
    updateMenuLabel();
    $$(".badge-art-link[data-badge-open], [data-badge-slot]").forEach((link) => {
      const id = link.dataset.badgeSlot || link.dataset.badgeOpen;
      const badge = badgeData.find((item) => item.id === id);
      if (badge)
        link.setAttribute(
          "aria-label",
          `${badge.title}: ${t("abrir detalhes", "open details")}`,
        );
    });
    document.title = t(
      "Vinicius Oliveira — Desenvolvedor de software",
      "Vinicius Oliveira — Software developer",
    );
    $(".portrait-print img").alt = t(
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
  function updateMenuLabel() {
    $("#menu-toggle").setAttribute(
      "aria-label",
      $("#mobile-nav").hidden
        ? t("Abrir menu", "Open menu")
        : t("Fechar menu", "Close menu"),
    );
  }
  function closeMobile() {
    $("#mobile-nav").hidden = true;
    $("#menu-toggle").setAttribute("aria-expanded", "false");
    updateMenuLabel();
  }
  $("#menu-toggle").addEventListener("click", () => {
    const isOpen = !$("#mobile-nav").hidden;
    $("#mobile-nav").hidden = isOpen;
    $("#menu-toggle").setAttribute("aria-expanded", String(!isOpen));
    updateMenuLabel();
  });
  $$("#mobile-nav a").forEach((a) => a.addEventListener("click", closeMobile));
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || event.isComposing) return;
    const dialog = event.target.closest("dialog[open]");
    if (dialog) {
      event.preventDefault();
      dialog.close();
    } else if (!$("#mobile-nav").hidden) {
      closeMobile();
      $("#menu-toggle").focus();
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
    $("#project-grid").dataset.visibleCount = String(count);
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
    if ($("#mobile-nav").contains(document.activeElement))
      $("#menu-toggle").focus();
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
        ":is(button,a[href],input,select,textarea,[tabindex]):not(:disabled,[tabindex='-1'])",
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
      if (dialog.id === "project-dialog" && !dialog.open)
        activeProject = undefined;
      if ($("dialog[open]")) return;
      document.body.style.overflow = "";
      document.body.classList.remove("dialog-open");
      syncDragonMotion();
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
      `<p class="chapter-kicker">CASE_${project.number} / ${project.category}</p><h2 id="project-dialog-title">${project.title}</h2><p class="dossier-subtitle">${data.summary}</p><ul class="tags">${project.tags.map((tag) => `<li>${tag}</li>`).join("")}</ul><div class="dossier-grid"><div><h3>${t("01 / O DESAFIO", "01 / THE CHALLENGE")}</h3><p>${data.challenge}</p></div><div><h3>${t("02 / AS DECISÕES", "02 / THE DECISIONS")}</h3><ul>${data.decisions.map((item) => `<li>${item}</li>`).join("")}</ul></div><div><h3>${t("03 / A IMPLEMENTAÇÃO", "03 / THE IMPLEMENTATION")}</h3><p>${data.implementation}</p></div><div><h3>${t("04 / PARA CONFERIR", "04 / THE EVIDENCE")}</h3><p>${data.proof}</p></div></div><p class="dossier-footnote">${data.note}</p><div class="dialog-actions">${project.demo ? `<a class="button button-primary" href="${project.demo}" target="_blank" rel="noopener noreferrer">${t("Experimentar a demo", "Try the demo")} ↗︎</a>` : ""}${project.repo ? `<a class="button button-light" href="${project.repo}" target="_blank" rel="noopener noreferrer">${t("Explorar no GitHub", "Explore on GitHub")} ↗︎</a>` : `<a class="button button-primary" href="mailto:vinicius.oliveiratwt@gmail.com">${t("Conversar sobre o projeto", "Talk about the project")} ↗︎</a>`}</div>`;
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
      else if (button.dataset.open === "appearance") openDialog($("#appearance-dialog"));
      else openCommands();
    }),
  );
  let copyFeedbackTimer;
  $("#copy-email").addEventListener("click", async ({ currentTarget: button }) => {
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText("vinicius.oliveiratwt@gmail.com");
      button.classList.add("copied");
      const mark = button.querySelector("[aria-hidden]");
      mark.textContent = "✓";
      clearTimeout(copyFeedbackTimer);
      copyFeedbackTimer = setTimeout(() => {
        button.classList.remove("copied");
        mark.textContent = "▣";
      }, 2500);
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
      { label: t("Voo do dragão e badges", "Dragon flight and badges"), hint: "✷", hash: "#dragon" },
      { label: t("Aparência, temas e cores", "Appearance, themes and colors"), hint: "◐", action: "appearance-open" },
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
    const search = $("#command-search");
    const query = search.value.trim().toLocaleLowerCase();
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
    const options = filteredCommands
      .map(
        (item, index) =>
          `<button type="button" role="option" id="command-option-${index}" class="command-result" data-command="${index}" tabindex="-1"><span>${item.label}</span><small aria-hidden="true">${item.hint} ↗︎</small></button>`,
      )
      .join("");
    $("#command-results").innerHTML =
      `<div id="command-options" role="listbox" aria-label="${t("Destinos e ações", "Destinations and actions")}" ${options ? "" : "hidden"}>${options}</div>` +
      (options
        ? ""
        : `<p role="status" class="command-hint">${t("Nenhum destino encontrado.", "No destinations found.")}</p>`);
    search.setAttribute("aria-expanded", String(Boolean(options)));
    selectCommand(commandIndex);
    $$("[data-command]").forEach((button) =>
      button.addEventListener("click", () =>
        executeCommand(Number(button.dataset.command)),
      ),
    );
  }
  function selectCommand(index) {
    commandIndex = index;
    const search = $("#command-search");
    const options = $$("#command-options [role='option']");
    options.forEach((option, i) => {
      option.setAttribute("aria-selected", String(i === index));
      option.classList.toggle("selected", i === index);
    });
    if (options[index])
      search.setAttribute("aria-activedescendant", options[index].id);
    else search.removeAttribute("aria-activedescendant");
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
      const section = $(item.hash);
      const heading = $("h1,h2", section);
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
      section.scrollIntoView({
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
  $("#command-search").addEventListener("keydown", (event) => {
    if (event.isComposing) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!filteredCommands.length) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      selectCommand(
        (commandIndex + step + filteredCommands.length) % filteredCommands.length,
      );
      $("#command-option-" + commandIndex).scrollIntoView({ block: "nearest" });
    }
    if (event.key === "Enter") {
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
        body: "O domínio representa valores em centavos e exige que a soma dos débitos seja igual à dos créditos. A API e a demo no navegador aplicam essa mesma regra.",
      },
      en: {
        title: "Rules that do not compromise",
        body: "The domain stores amounts in integer cents and requires total debits to equal total credits. The API and the browser demo both apply this rule.",
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
  const badgeData = JSON.parse($("#badge-catalog").textContent);
  const badgeMarkup = (value) => String(value).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
  const dragon = {
    travel: null,
    animations: [],
    raf: 0,
    state: "ready",
    userPaused: false,
    generation: 0,
    progress: 0,
    played: false,
    selected: $("#dragon-mission").value,
    duration: 14800,
    metrics: null,
    visible: false,
    cycle: 0,
    readPaused: false,
    variant: 0,
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
    const stage = $("#dragon-stage");
    const bounds = stage.getBoundingClientRect();
    const dock = $("#dragon-delivery").getBoundingClientRect();
    const stacked = matchMedia("(max-width: 700px)").matches;
    const flightWidth = stacked ? bounds.width : dock.left - bounds.left;
    const scale = Math.min(0.82, Math.max(0.22, (flightWidth - 15) / 1050));
    const y = stacked ? 40 : 54;
    const endX = flightWidth - 1050 * scale - 6;
    const destination = dragonSlot().querySelector("[data-slot-art]").getBoundingClientRect();
    const targetX = destination.left + destination.width / 2 - bounds.left;
    const targetY = destination.top + destination.height / 2 - bounds.top;
    // Fly along the cabinet on a wide page; descend over the correct column
    // on a stacked page. The cargo then covers the final distance to its pocket.
    const releaseX = stacked
      ? Math.max(-0.27 * flightWidth, Math.min(endX + 15, targetX - 590 * scale))
      : endX - 30 + 40 * (targetX - flightWidth) / Math.max(1, dock.width);
    const dockTop = dock.top - bounds.top;
    const releaseY = stacked
      ? Math.max(y + 22, Math.min(dockTop - 185 * scale - 60 + (targetY - dockTop) * 0.1, 108))
      : Math.max(y - 18, Math.min(144, targetY - 110 * scale - 16));
    return { width: stage.clientWidth, scale, y, endX, releaseX, releaseY,
      startX: -1000 * scale, exitX: stage.clientWidth + 50 };
  }
  const caravanTransform = (x, y, m, bank = 0) =>
    `translate(${x}px,${y}px) scale(${m.scale}) translate(525px,135px) rotate(${bank}deg) translate(-525px,-135px)`;
  function dragonBadge() {
    return (
      badgeData.find((badge) => badge.id === dragon.selected) || badgeData[0]
    );
  }
  function renderDragonMission() {
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
        return `<div class="cargo-hinge" data-cargo-segment="${[0, 1, 3, 5][i]}" style="left:${left}px;top:${top}px"><span class="cargo-anchor" aria-hidden="true"></span><span class="banner-rope" aria-hidden="true"></span><a class="dragon-badge-banner" data-badge-open="${badge.id}" href="${badgeMarkup(badge.url)}" target="_blank" rel="noopener noreferrer" aria-label="${badgeMarkup(badge.title)}: ${t("abrir detalhes", "open details")}"><span class="mail-packet"><i class="envelope-shell" aria-hidden="true"><i class="envelope-fold"></i></i><img src="${asset(`assets/badges/${badge.image}`)}" alt="" width="50" height="50"/></span><span class="sr-only">${badgeMarkup(badge.title)}</span></a></div>`;
      })
      .join("");
    const previous = $("[data-slot-destination]");
    if (previous) {
      previous.removeAttribute("data-slot-destination");
      clearFolderPose(previous);
    }
    const slot = dragonSlot();
    slot.setAttribute("data-slot-destination", "");
    // Scroll only the collection itself. Page position and keyboard focus stay with the reader.
    const grid = $("#dragon-delivery-content");
    const bounds = grid.getBoundingClientRect();
    const target = slot.getBoundingClientRect();
    if (target.bottom > bounds.bottom) grid.scrollTop += target.bottom - bounds.bottom;
    else if (target.top < bounds.top) grid.scrollTop -= bounds.top - target.top;
    updateDragonStatus();
  }
  function dragonSlot() {
    return document.querySelector(`[data-badge-slot="${dragon.selected}"]`);
  }
  function markDragonDelivery() {
    dragonSlot().dataset.deliveredBadge = dragon.selected;
    dragon.lastDelivered = dragon.selected;
    dragon.landed = true;
    $("#dragon-stage").dataset.landedCredential = dragon.selected;
  }
  function flightPhase(progress) {
    if (progress >= receivedAt) return "filed";
    return progress >= releaseAt ? "released" : "approaching";
  }
  function dragonStatusText() {
    if (!dragonCanMove() && dragon.state === "delivered")
      return t("Badge entregue sem movimento, conforme sua preferência.", "Badge delivered without motion, following your preference.");
    if (dragon.readPaused)
      return t("Voo pausado enquanto você consulta a coleção.", "Flight paused while you read the collection.");
    if (dragon.state === "delivered")
      return t("Badge na pasta. Abra a ficha para consultar os detalhes.", "Badge filed. Open its record for details.");
    if (dragon.state !== "walking")
      return t("Escolha uma badge. O guardião cuida do caminho.", "Choose a badge. The guardian takes care of the journey.");

    const phase = flightPhase(dragon.progress);
    let caption = t("O guardião se aproxima com o envelope.", "The guardian approaches with the envelope.");
    if (phase === "released")
      caption = t("Envelope solto, a caminho da pasta.", "Envelope released and heading for its folder.");
    else if (phase === "filed")
      caption = t("Badge na pasta. O guardião se afasta.", "Badge filed. The guardian flies on.");
    return dragon.userPaused || !dragonCanMove()
      ? t("Voo pausado. ", "Flight paused. ") + caption
      : caption;
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
    const key = dragonStatusText();
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
    const target = $("[data-slot-destination]");
    if (target) clearFolderPose(target);
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
    dragon.lastDelivered = null;
    delete $("#dragon-stage").dataset.landedCredential;
    $$("[data-delivered-badge]").forEach((slot) => slot.removeAttribute("data-delivered-badge"));
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
  const waveCycle = 3000;
  function dragonWave(x, time) {
    const length = 875, tau = Math.PI * 2;
    const position = (x - 230) / length;
    const phase = tau * (time / waveCycle - position) + dragon.variant * 0.6;
    // A quiet head leads the turn. Amplitude increases down the spine; the second
    // harmonic sharpens the crest without a kink where one joint meets the next.
    const amplitude = 12 + 22 * position;
    const wave = Math.sin(phase) + 0.16 * Math.sin(2 * phase + 0.7);
    const derivative = Math.cos(phase) + 0.32 * Math.cos(2 * phase + 0.7);
    return {
      y: amplitude * wave,
      angle: Math.atan((22 * wave - tau * amplitude * derivative) / length) * 180 / Math.PI,
    };
  }

  function dragonRoute(m) {
    const { releaseX: dockX, releaseY: dockY } = m;
    const distance = dockX - m.startX;
    const lift = Math.min(42, 62 * m.scale);
    // The keys describe the guardian's centre and pitch. Cubic Hermite
    // interpolation shares the velocity on both sides of every key.
    const keys = [
      [0, m.startX, m.y + lift, -5],
      [0.22, m.startX + distance * 0.55, m.y - lift * 0.92, -6],
      [0.38, dockX - distance * 0.22, m.y - lift, 2],
      [0.51, dockX - distance * 0.025, dockY - 8, 8],
      [0.57, dockX, dockY, 4],
      [0.67, dockX - 14 * m.scale, dockY - lift * 0.50, -6],
      [0.78, dockX + distance * 0.14, dockY - lift * 1.12, -8],
      [1, m.exitX, m.y - lift, -2],
    ];
    return (progress) => {
      const i = keys.findIndex(([time], index) => index > 0 && progress <= time);
      const a = keys[i - 1], b = keys[i], before = keys[Math.max(0, i - 2)];
      const after = keys[Math.min(keys.length - 1, i + 1)];
      const span = b[0] - a[0], t = (progress - a[0]) / span;
      const t2 = t * t, t3 = t2 * t;
      const value = (axis) => {
        const v0 = (b[axis] - before[axis]) * span / (b[0] - before[0]);
        const v1 = (after[axis] - a[axis]) * span / (after[0] - a[0]);
        return (2*t3 - 3*t2 + 1)*a[axis] + (t3 - 2*t2 + t)*v0
          + (3*t2 - 2*t3)*b[axis] + (t3 - t2)*v1;
      };
      return { x: value(1), y: value(2), bank: value(3) };
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
    const previous = dragon.progress;
    dragon.progress = Math.min(1, Math.max(0, time / dragon.duration));
    const percent = Math.round(dragon.progress * 100);
    if (percent !== Math.round(previous * 100)) {
      $("#dragon-scrub").value = String(percent);
      $("#dragon-progress").value = percent + "%";
    }
    updateDragonRibbon(time);
    applyDragonDelivery();
    if (flightPhase(previous) !== flightPhase(dragon.progress)) updateDragonStatus();
    if (dragon.state === "walking" && dragon.travel.playState === "running")
      dragon.raf = requestAnimationFrame(dragonTick);
  }
  const releaseAt = 0.55, receivedAt = 0.71;
  const unit = (n) => Math.min(1, Math.max(0, n));
  function smooth(n) {
    const t = unit(n);
    return t * t * (3 - 2 * t);
  }
  function clearFolderPose(slot) {
    for (const property of ["--flap-angle", "--pocket-dip", "--ink-impact"]) {
      slot.style.removeProperty(property);
    }
    delete slot.dataset.folderPhase;
  }
  function poseFolder(slot, progress) {
    const reception = unit((progress - receivedAt) / 0.11);
    const open = smooth((progress - 0.43) / 0.18) * (1 - smooth(reception));
    const tap = Math.sin(reception * Math.PI * 2) * (1 - reception) ** 3;
    const phase = progress < 0.43 ? "closed" : progress < receivedAt ? "open" : reception < 1 ? "settling" : "filed";
    if (slot.dataset.folderPhase === phase && (phase === "closed" || phase === "filed")) return;
    slot.dataset.folderPhase = phase;
    slot.style.setProperty("--flap-angle", (open * -72 + tap * 10).toFixed(2) + "deg");
    slot.style.setProperty("--pocket-dip", (tap * 5).toFixed(2) + "px");
    slot.style.setProperty("--ink-impact", Math.sin(Math.PI * unit(reception / 0.5)).toFixed(3));
  }
  function launchDragonCredential() {
    const source = $(".cargo-hinge .mail-packet");
    const layer = $("#dragon-flight-layer");
    const stage = layer.getBoundingClientRect();
    // Seeking straight into a handoff should find the same release position as playback.
    const time = dragon.travel.currentTime;
    const jumped = Math.abs(dragon.progress - releaseAt) > 0.003;
    if (jumped) dragon.animations.forEach((a) => { a.currentTime = releaseAt * dragon.duration; });
    const rect = source.getBoundingClientRect();
    const vehicle = new DOMMatrix(getComputedStyle($("#dragon-caravan")).transform);
    const hinge = new DOMMatrix(getComputedStyle(source.closest(".cargo-hinge")).transform);
    const matrix = vehicle.multiply(hinge);
    if (jumped) dragon.animations.forEach((a) => { a.currentTime = time; });

    const width = source.offsetWidth * Math.hypot(matrix.a, matrix.b);
    const height = source.offsetHeight * Math.hypot(matrix.c, matrix.d);
    const card = source.cloneNode(true);
    card.classList.add("dragon-flight-card");
    card.setAttribute("aria-hidden", "true");
    card.style.width = width + "px";
    card.style.height = height + "px";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "courier-streaks");
    svg.setAttribute("aria-hidden", "true");
    const trail = document.createElementNS(svg.namespaceURI, "path");
    svg.append(trail);
    layer.replaceChildren(svg, card);
    dragon.launch = {
      card, trail, width, height,
      x: rect.left + rect.width / 2 - stage.left,
      y: rect.top + rect.height / 2 - stage.top,
      angle: Math.atan2(matrix.b, matrix.a) * 180 / Math.PI,
      target: $("[data-slot-art]", dragonSlot()),
    };
    $("#dragon-stage").dataset.launchOrigin = JSON.stringify({
      x: rect.left - stage.left, y: rect.top - stage.top, width: rect.width,
    });
    $(".cargo-hinge").style.visibility = "hidden";
    $("#dragon-stage").dataset.launchCredential = dragon.selected;
  }
  function courierPoint(f, targetX, targetY, progress) {
    const u = (1 - unit(progress)) ** 2.45, t = 1 - u;
    const dx = targetX - f.x, dy = targetY - f.y;
    const lift = Math.min(90, Math.max(32, Math.hypot(dx, dy) * 0.26));
    const crest = Math.max(12, Math.min(f.y, targetY) - lift);
    // The bridle imparts forward momentum, even when the pocket is behind
    // the guardian. The letter banks around its destination and drops in.
    const lead = Math.min(100, Math.max(34, Math.abs(dx) * 0.38));
    const overshoot = Math.min(30, Math.abs(dx) * 0.1 + 10);
    const x = u**3*f.x + 3*u*u*t*(f.x + lead) + 3*u*t*t*(targetX + overshoot) + t**3*targetX;
    const y = u**3*f.y + 3*u*u*t*crest + 3*u*t*t*(targetY - lift) + t**3*targetY;
    return { x, y, t };
  }
  function drawCourier(f, q) {
    const stage = $("#dragon-flight-layer").getBoundingClientRect();
    const target = f.target.getBoundingClientRect();
    const tx = target.left + target.width / 2 - stage.left;
    const ty = target.top + target.height / 2 - stage.top;
    const { x, y, t } = courierPoint(f, tx, ty, q);
    const width = f.width + (target.width - f.width) * t;
    const height = f.height + (target.height - f.height) * t;
    const turn = Math.sin(Math.PI * t) * (22 - 46 * t);
    const rotation = f.angle * (1 - t) + turn;
    f.card.style.transform = `translate(${x - f.width / 2}px,${y - f.height / 2}px) rotate(${rotation}deg) scale(${width / f.width},${height / f.height})`;
    f.card.style.setProperty("--envelope-ink", String(1 - smooth((q - 0.63) / 0.33)));
    f.card.dataset.flightProgress = q.toFixed(3);

    // Three tapered strokes trace the letter's recent path, including when
    // the reader scrubs backwards. They have no independent animation clock.
    const marks = [-1, 0, 1].map((line) => {
      const end = Math.max(0, q - 0.027 - Math.abs(line) * 0.022);
      const start = Math.max(0, end - 0.13 + Math.abs(line) * 0.034);
      const samples = Array.from({ length: 7 }, (_, i) => {
        const p = courierPoint(f, tx, ty, start + (end - start) * i / 6);
        return [p.x, p.y + line * (2 + i * 0.6)];
      });
      const trace = samples.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`);
      const edge = samples.reverse().map(([px, py], i) => `${px.toFixed(1)},${(py + 1.65 * (1 - i / 6)).toFixed(1)}`);
      return "M" + [...trace, ...edge].join(" L") + "Z";
    });
    f.trail.setAttribute("d", marks.join(" "));
    f.trail.style.opacity = String(0.75 * smooth(q / 0.12) * (1 - smooth((q - 0.68) / 0.25)));
    return target;
  }
  function applyDragonDelivery() {
    const q = unit((dragon.progress - releaseAt) / (receivedAt - releaseAt));
    if (dragonCanMove()) poseFolder(dragonSlot(), dragon.progress);
    if (dragon.progress < receivedAt && dragon.landed) dragon.landed = false;
    if (dragon.progress < releaseAt) {
      if (dragon.launch) $("#dragon-flight-layer").replaceChildren();
      dragon.launch = null;
      $(".cargo-hinge").style.visibility = "";
      return;
    }
    if (dragon.landed) return;
    if (!dragon.launch) launchDragonCredential();
    const f = dragon.launch;
    const target = drawCourier(f, q);
    if (q < 1) return;

    const landed = f.card.getBoundingClientRect();
    $("#dragon-stage").dataset.landingContinuity = JSON.stringify({
      dx: landed.left - target.left, dy: landed.top - target.top,
      dw: landed.width - target.width, dh: landed.height - target.height,
    });
    markDragonDelivery();
    $("#dragon-flight-layer").replaceChildren();
    dragon.launch = null;
  }
  function finishDragon(token, { manual = false } = {}) {
    if (token !== dragon.generation) return;
    const loop = $("#dragon-loop").checked && dragonCanMove() && !manual;
    if (!dragon.landed) markDragonDelivery();
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
    markDragonDelivery();
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
    $("#dragon-scrub").value = "0";
    $("#dragon-progress").value = "0%";
    dragon.metrics = dragonMetrics();
    if (!continuation) dragon.cycle++;
    dragon.variant = (dragon.cycle - 1) % 3;
    dragon.landed = false;
    dragon.readPaused =
      $("#dragon-delivery").contains(document.activeElement) ||
      ($("#dragon-delivery").matches(":hover") &&
        preserveDelivery &&
        Boolean($("[data-delivered-badge]")));
    renderDragonMission();
    if (!dragonCanMove() || !Element.prototype.animate) {
      dragon.state = "delivered";
      dragon.progress = 1;
      applyRestPose();
      markDragonDelivery();
      $(".cargo-hinge").style.visibility = "hidden";
      $("#dragon-scrub").value = "100";
      $("#dragon-progress").value = "100%";
      updateDragonStatus();
      return;
    }
    const m = dragon.metrics,
      start = document.timeline.currentTime,
      token = dragon.generation;
    const route = dragonRoute(m);
    const routeFrames = Array.from({ length: 151 }, (_, i) => {
      const offset = i / 150, pose = route(offset);
      return { offset, transform: caravanTransform(pose.x, pose.y, m, pose.bank) };
    });
    dragon.travel = addDragonAnimation(
      $("#dragon-caravan"), routeFrames,
      { duration: dragon.duration, easing: "linear" }, start,
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
      const frames = Array.from({ length: 241 }, (_, i) => {
        const offset = i / 240, time = offset * dragon.duration;
        const body = dragonWave(x, time);
        // Gravity keeps the mail beneath its joint. Delayed banking and a
        // damped kick after the release make the remaining envelopes swing.
        const bank = route(Math.max(0, offset - 0.014)).bank;
        const elapsed = Math.max(0, time - dragon.duration * 0.55) / 1000;
        const recoil = 9 * Math.exp(-1.6 * elapsed) * Math.sin(5.9 * elapsed);
        const swing = -0.78 * bank - 0.40 * dragonWave(x, time - 180).angle + recoil;
        return { offset, transform: `translateY(${body.y * 1050 / 1240}px) rotate(${swing}deg)` };
      });
      addDragonAnimation(hinge, frames, { duration: dragon.duration, easing: "linear" }, start);
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
    dragon.readPaused = true;
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
      ? (badge.inactiveSince ? t(`Inativa desde ${badge.inactiveSince}`, `Inactive since ${badge.inactiveSince}`) : t("Inativa", "Inactive"))
      : badge.statusPt
        ? t(badge.statusPt, badge.statusEn)
        : t(
            "Registro público verificado no emissor",
            "Public issuer record verified",
          );

    $("#badge-dialog-content").innerHTML =
      `<p class="chapter-kicker">${badgeMarkup(badge.issuer)}</p><div class="badge-dossier"><img src="${asset(`assets/badges/${badge.image}`)}" alt="${badgeMarkup(badge.title)}" width="240" height="240"/><div><span class="credential-type">${badgeMarkup(t(...badge.typeLabel))}</span><h2 id="badge-dialog-title">${badgeMarkup(badge.title)}</h2><p>${badgeMarkup(badge[language])}</p><dl class="badge-record-facts"><div><dt>${t("EMISSÃO", "ISSUED")}</dt><dd>${badgeMarkup(badge.issued || t("Data não confirmada", "Date unconfirmed"))}</dd></div><div><dt>${t("STATUS", "STATUS")}</dt><dd>${badgeMarkup(status)}</dd></div></dl><h3 class="badge-detail-kicker">${t("CRITÉRIO DO EMISSOR", "ISSUER CRITERION")}</h3><p>${badgeMarkup(t(badge.criteriaPt, badge.criteriaEn))}</p><h3 class="badge-detail-kicker">${t("TEMAS DA CREDENCIAL", "CREDENTIAL TOPICS")}</h3><ul class="tags">${(badge.skills || []).map((skill) => `<li>${badgeMarkup(skill)}</li>`).join("")}</ul><div class="dialog-actions"><a class="button button-primary" href="${badgeMarkup(badge.url)}" target="_blank" rel="noopener noreferrer">${t("Verificar badge", "Verify badge")} ↗︎</a><button type="button" class="button button-light" data-deliver-badge="${badge.id}">${t("Trazer esta badge", "Deliver this badge")}</button></div><p class="badge-dossier-note">${t("Arte original. Consulte o emissor para todos os detalhes e a situação atual.", "Original artwork. Check the issuer for full details and current status.")}</p></div></div>`;
  }
  $("#badge-dialog").addEventListener("click", (event) => {
    const action = event.target.closest("[data-deliver-badge]");
    if (!action) return;
    closeDialog($("#badge-dialog"));
    dragon.selected = action.dataset.deliverBadge;
    $("#dragon-start").focus({ preventScroll: true });
    $("#dragon-stage").scrollIntoView({ block: "start", behavior: "instant" });
    startDragonJourney();
  });
  function openBadge(id) {
    activeBadge = id;
    renderBadge(id);
    $(".dragon-scene").classList.add("badge-selected");
    openDialog($("#badge-dialog"));
  }
  $$(".badge-art-link, [data-badge-slot]").forEach((link) => {
    const src = $("img", link).getAttribute("src");
    const badge = badgeData.find(
      (item) => item.id === (link.dataset.badgeSlot || link.dataset.badgeOpen) || src.endsWith(item.image),
    );
    if (!badge) return;
    if (!link.dataset.badgeSlot) link.dataset.badgeOpen = badge.id;
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
      $$(".badge-history-group").forEach((group) => {
        group.hidden = !$(".badge-card:not([hidden])", group);
      });
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
    const terms = search.split(/\s+/).filter(Boolean);
    let matched = 0;
    let shown = 0;
    $$(".formation-record").forEach((record) => {
      const text = record.textContent
        .toLocaleLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const matches =
        terms.every((term) => text.includes(term)) &&
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
  const chapters = $$("main > section[id]");
  const chapterLinks = $$(".desktop-nav a[href^='#'], #mobile-nav a[href^='#']");
  let currentChapter = -1;
  function setChapter(index) {
    if (index === currentChapter) return;
    currentChapter = index;
    $("#chapter-position").textContent =
      `${String(index + 1).padStart(2, "0")} / ${String(chapters.length).padStart(2, "0")}`;
    $("#chapter-prev").disabled = index === 0;
    $("#chapter-next").disabled = index === chapters.length - 1;
    chapterLinks.forEach((link) => {
      const active = link.hash === "#" + chapters[index].id;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }
  function updateChapterDock() {
    const position = window.innerHeight * 0.35;
    const index = chapters.findLastIndex(
      (chapter) => chapter.getBoundingClientRect().top <= position,
    );
    const atBottom =
      window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    setChapter(atBottom ? chapters.length - 1 : Math.max(0, index));
  }
  function turnPanel(direction) {
    const index = Math.max(
      0,
      Math.min(chapters.length - 1, currentChapter + direction),
    );
    const target = chapters[index];
    location.hash = "#" + target.id;
    target.scrollIntoView({
      behavior: motionDisabled ? "instant" : "smooth",
      block: "start",
    });
    if (!motionDisabled) {
      target.classList.remove("page-turning");
      void target.offsetWidth;
      target.classList.add("page-turning");
    }
    setChapter(index);
  }
  $("#chapter-prev").addEventListener("click", () => turnPanel(-1));
  $("#chapter-next").addEventListener("click", () => turnPanel(1));
  chapters.forEach((chapter) =>
    chapter.addEventListener("animationend", () =>
      chapter.classList.remove("page-turning"),
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
  }
})();
