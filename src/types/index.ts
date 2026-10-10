import type { ReactNode } from "react";

export interface LayoutProps<T extends PropertyKey = string> {
  children: ReactNode;
  params?: { [key in T]?: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}