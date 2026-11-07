export type Sport = {
  name: string;
  photo: string;
  paragraphs: string[];
};

export const intro =
  "Sports have been a cornerstone of my life. They've kept me active and healthy, introduced me to my closest friends, and taught me some of life's most important lessons.";

const placeholder = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
];

export const sports: Sport[] = [
  { name: "Baseball", photo: "/sports/baseball.png", paragraphs: placeholder },
  { name: "Basketball", photo: "/sports/basketball.png", paragraphs: placeholder },
  { name: "Skiing", photo: "/sports/skiing.png", paragraphs: placeholder },
  { name: "Surfing", photo: "/sports/surfing.png", paragraphs: placeholder },
];
