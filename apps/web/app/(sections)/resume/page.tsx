import { SectionBackdrop } from "../section-backdrop";
import { Impacts } from "./impacts";
import { Chips, Dates, Entries, Panel } from "./panel";
import {
  community,
  education,
  headline,
  interests,
  projects,
  skills,
} from "./resume";
import { Timeline } from "./timeline";

export default function ResumePage() {
  return (
    <main className="
      relative -mt-16 flex flex-1 flex-col
      lg:-mt-20
    ">
      <SectionBackdrop slug="resume" />
      <div className="
        relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pt-24 pb-16
        lg:gap-16 lg:px-8 lg:pt-32 lg:pb-24
      ">
        <header className="flex flex-col items-center gap-3 text-center">
          <h1 className="type-display text-on-surface">
            {headline.name}
          </h1>
          <p className="type-heading-sm text-on-surface">
            {headline.role}
          </p>
          <p className="max-w-prose type-body-lg text-on-surface-variant">
            {headline.summary}
          </p>
        </header>
        <Impacts />
        <div className="
          grid gap-12
          lg:grid-cols-3 lg:gap-16
        ">
          <section
            aria-labelledby="experience"
            className="
              flex flex-col gap-8
              lg:col-span-2
            "
          >
            <h2 id="experience" className="type-heading-xl text-on-surface">
              Experience
            </h2>
            <Timeline />
          </section>
          <aside className="
            grid content-start gap-6
            md:grid-cols-2
            lg:grid-cols-1
          ">
            <Panel title="Education">
              <div className="flex flex-col gap-1">
                <div className="
                  flex flex-wrap items-baseline justify-between gap-x-3
                ">
                  <h3 className="type-heading-sm text-on-surface">
                    {education.school}
                  </h3>
                  <Dates start={education.start} end={education.end} />
                </div>
                <p className="type-body-sm text-on-surface-variant">
                  {education.college}
                </p>
                <p className="type-body-md text-on-surface">
                  {education.degree}
                </p>
              </div>
              <p className="type-label text-on-surface">
                GPA{" "}
                <span className="text-primary">{education.gpa}</span>
                <span className="text-on-surface-variant"> / 4.0</span>
              </p>
              <Chips items={education.honors} tone="primary" label="Honors" />
            </Panel>
            <Panel title="Skills">
              <div className="flex flex-col gap-2">
                <h3 className="type-label text-on-surface-variant">Languages</h3>
                <Chips items={skills.languages} label="Languages" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="type-label text-on-surface-variant">Tools</h3>
                <Chips items={skills.tools} tone="tertiary" label="Tools" />
              </div>
            </Panel>
          </aside>
        </div>
        <div className="
          grid gap-6
          md:grid-cols-2
          lg:grid-cols-3
        ">
          <Panel title="Projects">
            <Entries entries={projects} />
          </Panel>
          <Panel title="Community">
            <Entries entries={community} />
          </Panel>
          <Panel
            title="Interests"
            className="
              md:col-span-2
              lg:col-span-1
            "
          >
            <Chips items={interests} tone="primary" label="Interests" />
          </Panel>
        </div>
      </div>
    </main>
  );
}
