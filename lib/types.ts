export interface NotionPage {
  id: string;
  title: string;
  content: NotionBlock[];
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  emoji?: string;
}

export interface NotionBlock {
  id: string;
  type:
    | "paragraph"
    | "heading1"
    | "heading2"
    | "heading3"
    | "bulletList"
    | "numberedList"
    | "quote"
    | "code"
    | "divider"
    | "image"
    | "video"
    | "callout"
    | "toggle"
    | "checklist"
    | "bookmark"
    | "math";
  content: string;
  children?: NotionBlock[];
  formatting?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    code?: boolean;
  };
}

export interface NotionWorkspace {
  pages: NotionPage[];
  currentPageId?: string;
  comments: Comment[];
  activityLog: ActivityLog[];
  sharedPages: SharedPage[];
}

export interface Comment {
  id: string;
  blockId: string;
  pageId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
  resolved: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: "created" | "updated" | "deleted" | "commented" | "shared";
  pageId: string;
  pageTitle: string;
  timestamp: Date;
  details?: string;
}

export interface SharedPage {
  id: string;
  pageId: string;
  shareId: string;
  permissions: "read" | "write";
  createdBy: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface ThemePalette {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
}

export type ThemeMode = "light" | "dark";
