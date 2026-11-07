export type Section = {
  slug: string;
  title: string;
  image: string;
  photo: string;
};

export const sections = [
  [
    {
      slug: "dreams",
      title: "Dreams",
      image: "/wedges/dreams.jpg",
      photo: "/details/dreams.jpg",
    },
    {
      slug: "about",
      title: "About",
      image: "/wedges/about.jpg",
      photo: "/details/about.jpg",
    },
    {
      slug: "sports",
      title: "Sports",
      image: "/wedges/sports.jpg",
      photo: "/details/sports.jpg",
    },
    {
      slug: "interests",
      title: "Interests",
      image: "/wedges/interests.jpg",
      photo: "/details/interests.jpg",
    },
  ],
  [
    {
      slug: "mission",
      title: "Mission",
      image: "/wedges/mission.jpg",
      photo: "/details/mission.jpg",
    },
    {
      slug: "resume",
      title: "Resume",
      image: "/wedges/resume.jpg",
      photo: "/details/resume.jpg",
    },
    {
      slug: "projects",
      title: "Projects",
      image: "/wedges/projects.png",
      photo: "/details/projects.png",
    },
    {
      slug: "contact",
      title: "Contact",
      image: "/wedges/contact.jpg",
      photo: "/details/contact.jpg",
    },
  ],
] as const satisfies readonly [readonly Section[], readonly Section[]];

export const sectionHref = (section: Section) => `/${section.slug}`;

export type SectionSlug = (typeof sections)[number][number]["slug"];

export function sectionBySlug(slug: SectionSlug): Section {
  const section = sections.flat().find((entry) => entry.slug === slug);
  if (!section) {
    throw new Error(`Unknown section: ${slug}`);
  }
  return section;
}
