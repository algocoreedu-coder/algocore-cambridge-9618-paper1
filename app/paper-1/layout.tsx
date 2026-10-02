import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Paper1Shell } from "@/app/components/paper1-learning/Paper1Shell";
import { getPaper1Catalog } from "@/app/lib/paper1/catalog";

export const metadata: Metadata = {
  title: { default: "Paper 1 Study Map · AlgoCore", template: "%s · AlgoCore Paper 1" },
  description: "Cambridge 9618 Paper 1 revision with bilingual lessons, interactive visual models and honest learning progress.",
};

export default function Paper1Layout({ children }: { readonly children: ReactNode }) {
  return <Paper1Shell catalog={getPaper1Catalog()}>{children}</Paper1Shell>;
}
