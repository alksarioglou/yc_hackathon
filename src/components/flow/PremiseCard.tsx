"use client";

import type { Premise } from "@/lib/types";
import { BTN } from "./constants";
import { Field } from "./Field";

export function PremiseCard({
  premise,
  onChange,
  onConfirm,
}: {
  premise: Premise;
  onChange: (p: Premise) => void;
  onConfirm: () => void;
}) {
  return (
    <section className="animate-fade-in-up">
      <p className="label mb-3 text-orange">Mission · 002 · Target profile</p>
      <h2 className="display text-3xl">Here&apos;s what we found</h2>
      <p className="mt-2 text-muted">
        Review and edit anything before we hunt for leads.
      </p>

      <div className="mt-8 space-y-6 border border-line bg-panel p-7">
        <Field label="Product name">
          <input
            value={premise.productName}
            onChange={(e) => onChange({ ...premise, productName: e.target.value })}
            className="w-full rounded-sm border border-line bg-paper-pure px-3 py-2.5 outline-none focus:border-orange"
          />
        </Field>

        <Field label="Key feature">
          <textarea
            value={premise.keyFeature}
            onChange={(e) => onChange({ ...premise, keyFeature: e.target.value })}
            rows={2}
            className="w-full resize-none rounded-sm border border-line bg-paper-pure px-3 py-2.5 outline-none focus:border-orange"
          />
        </Field>

        <Field
          label={`Ideal Customer Profile · ${premise.icp.length} traits · one per line`}
        >
          <textarea
            value={premise.icp.join("\n")}
            onChange={(e) =>
              onChange({
                ...premise,
                icp: e.target.value.split("\n").filter((l) => l.trim() !== ""),
              })
            }
            rows={12}
            className="w-full resize-y rounded-sm border border-line bg-paper-pure px-3 py-2.5 font-mono text-sm leading-relaxed outline-none focus:border-orange"
          />
        </Field>
      </div>

      <button onClick={onConfirm} className={`${BTN} mt-8 w-full`}>
        Find leads →
      </button>
    </section>
  );
}