import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { previewRoutesAllowed } from "./access";

export default function PreviewLayout({ children }: { children: ReactNode }) {
  if (!previewRoutesAllowed()) notFound();
  return children;
}
