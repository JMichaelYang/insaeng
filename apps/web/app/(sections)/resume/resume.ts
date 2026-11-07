export type Impact = { value: string; label: string; source: string };

export type Role = {
  company: string;
  title: string;
  focus: string;
  start: string;
  end: string;
  current?: boolean;
  highlights: string[];
};

export type Entry = {
  name: string;
  start: string;
  end: string;
  details: string[];
};

export const headline = {
  name: "Jaewon Yang",
  role: "Senior Software Engineer",
  summary: "Fullstack engineer building AI tooling and consumer apps.",
};

export const impacts: Impact[] = [
  { value: "~50%", label: "lift in member workout creation", source: "Whoop" },
  { value: "22%", label: "boost in home and event page GGR", source: "DraftKings" },
  { value: "15k", label: "users in the first two weeks", source: "Campfire" },
  { value: "30%", label: "faster internal tooling loads", source: "Tesla" },
];

export const roles: Role[] = [
  {
    company: "Whoop",
    title: "Senior Software Engineer",
    focus: "AI Platform, Fullstack/Mobile",
    start: "Jan 2026",
    end: "Present",
    current: true,
    highlights: [
      "Created and maintained a Claude plugin marketplace that hosts **over 20 shared skills**, enabling teams to distribute time-saving capabilities to the entire organization.",
      "Planned and executed the AI Strength Trainer, leading to a **~50% lift** in member workout creation.",
    ],
  },
  {
    company: "DraftKings",
    title: "Software Engineer",
    focus: "Sportsbook, Android",
    start: "Sep 2022",
    end: "Dec 2025",
    highlights: [
      "Boosted home and event page GGR (gross gaming revenue) by **22%** by planning, leading, and executing the content card project, then increased engagement **20%** by suggesting and implementing a bet counter.",
      "Created an agentic bug triaging workflow with n8n that reduced the team's average bug lifetime by **8%**.",
    ],
  },
  {
    company: "Tesla",
    title: "Software Engineer Co-op",
    focus: "Fullstack/Web",
    start: "Jan 2021",
    end: "Aug 2021",
    highlights: [
      "Decreased internal tooling load time by **30%** by converting 5 legacy pages from Ruby on Rails to React.",
      "Implemented and achieved **80% adoption** of the new vehicle jobs page by working with other teams to ensure the new features met their specifications.",
    ],
  },
  {
    company: "Campfire Technology",
    title: "Lead Developer Co-op",
    focus: "Fullstack/Web",
    start: "Jan 2020",
    end: "Aug 2020",
    highlights: [
      "Led the full-stack development of a SaaS React web application for writers and role players, reaching **15,000 users** within the first two weeks after launch.",
      "Defined architecture standards for the project, leading to a **99.5% crash-free** session rate in the first month after launch.",
    ],
  },
];

export const education = {
  school: "Northeastern University",
  college: "Khoury College of Computer and Information Science",
  degree: "Bachelor of Science in Computer Science",
  start: "Sep 2017",
  end: "Apr 2022",
  gpa: "3.72",
  honors: ["National Merit Scholar", "Dean's List"],
};

export const skills = {
  languages: [
    "Kotlin",
    "Java",
    "JavaScript",
    "HTML",
    "Dart",
    "C#",
    "Ruby",
    "Swift",
    "Python",
    "C",
    "Assembly",
    "Scheme",
  ],
  tools: [
    "Claude Code",
    "Cursor",
    "Compose",
    "SwiftUI",
    "React",
    "Redux",
    "MongoDB",
    "Ruby on Rails",
    "Flutter",
    "MySQL",
    "Azure",
    "Git",
    "Vim",
    "Bamboo",
    "Jira",
    "Confluence",
    "Figma",
    "Premiere",
    "Excel",
    "Windows",
  ],
};

export const projects: Entry[] = [
  {
    name: "Kitchen",
    start: "Dec 2024",
    end: "Present",
    details: [
      "A custom AI agent orchestration framework wrapping inference provider SDKs.",
      "Agents work through Slack, with tools, skills, triggers, evals, credential isolation, Docker, an operator dashboard, and an operator CLI that Claude uses to configure them.",
    ],
  },
];

export const community: Entry[] = [
  {
    name: "Greater Boston Food Bank",
    start: "Aug 2025",
    end: "Present",
    details: [
      "Volunteer weekly, preparing and serving meals and unloading deliveries.",
    ],
  },
  {
    name: "Roxbury Robotics Club",
    start: "Sep 2019",
    end: "Apr 2021",
    details: [
      "Taught STEM through Lego robotics on weekly visits to an underserved local middle school.",
    ],
  },
  {
    name: "NEU Scout Club",
    start: "Sep 2020",
    end: "Apr 2022",
    details: [
      "Brand consultant with a tech focus for an alum's chocolate-centered small business.",
    ],
  },
];

export const interests = [
  "Baseball",
  "Basketball",
  "Skiing",
  "Surfing",
  "Rock Climbing",
  "Guitar",
  "Mechanical Engineering",
  "Cooking",
];
