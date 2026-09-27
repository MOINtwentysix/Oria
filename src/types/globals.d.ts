declare const window: typeof globalThis & {
  location: Location;
  localStorage: Storage;
  assign: (url: string) => void;
};

declare const document: Document;
