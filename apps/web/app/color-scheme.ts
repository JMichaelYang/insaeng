export const rootAttributes = {
  scheme: { storageKey: "insaeng-scheme", fallback: "default" },
  theme: { storageKey: "insaeng-theme", fallback: "system" },
} as const;

export type RootAttribute = keyof typeof rootAttributes;

export const restoreRootAttributes = `try{for(const[name,{storageKey}]of Object.entries(${JSON.stringify(rootAttributes)})){const value=localStorage.getItem(storageKey);if(value)document.documentElement.dataset[name]=value}}catch{}`;
