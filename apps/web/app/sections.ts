export type Section = { slug: string; title: string; image: string };

export const sections = [
  [
    { slug: "dreams", title: "Dreams", image: "/wedges/dreams.jpg" },
    { slug: "about", title: "About", image: "/wedges/about.jpg" },
    { slug: "sports", title: "Sports", image: "/wedges/sports.jpg" },
    { slug: "interests", title: "Interests", image: "/wedges/interests.jpg" },
  ],
  [
    { slug: "mission", title: "Mission", image: "/wedges/mission.jpg" },
    { slug: "resume", title: "Resume", image: "/wedges/resume.jpg" },
    { slug: "projects", title: "Projects", image: "/wedges/projects.png" },
    { slug: "contact", title: "Contact", image: "/wedges/contact.jpg" },
  ],
] as const satisfies readonly [readonly Section[], readonly Section[]];

export const sectionHref = (section: Section) => `/${section.slug}`;
