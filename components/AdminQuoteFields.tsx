"use client";

import { useState } from "react";
import { QUOTE_STATUS_LABEL } from "@/lib/types";
import type { QuoteStatus } from "@/lib/types";

const options = Object.entries(QUOTE_STATUS_LABEL) as [QuoteStatus, string][];
const PRICED: QuoteStatus[] = ["quoted", "accepted", "declined"];

/**
 * Pricing for a client request: quote an amount, waive the charge, or record
 * how the client answered. The amount field appears only for the states that
 * carry a price — the same rule the server and a column constraint enforce.
 */
export default function AdminQuoteFields({
  defaultStatus = "none",
  defaultAmount = "",
  defaultCurrency = "AED",
  defaultNote = "",
}: {
  defaultStatus?: QuoteStatus;
  defaultAmount?: string;
  defaultCurrency?: string;
  defaultNote?: string;
}) {
  const [status, setStatus] = useState<QuoteStatus>(defaultStatus);
  const priced = PRICED.includes(status);

  return (
    <fieldset className="mt-2 mb-5 border border-rule bg-shade p-4">
      <legend className="eyebrow eyebrow-pine px-2">Quote</legend>

      <div className="grid gap-x-5 sm:grid-cols-3">
        <label className="field">
          <span className="field-label">Pricing</span>
          <select
            className="select"
            name="quote_status"
            value={status}
            onChange={(event) => setStatus(event.target.value as QuoteStatus)}
          >
            {options.map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        {priced ? (
          <>
            <label className="field">
              <span className="field-label">Amount</span>
              <input
                className="input mono"
                name="quote_amount"
                inputMode="decimal"
                defaultValue={defaultAmount}
                placeholder="0.00"
                required
              />
            </label>
            <label className="field">
              <span className="field-label">Currency</span>
              <input
                className="input mono uppercase"
                name="quote_currency"
                defaultValue={defaultCurrency}
                minLength={3}
                maxLength={3}
                required
              />
            </label>
          </>
        ) : (
          // Kept in the payload so the server always sees a valid currency.
          <input type="hidden" name="quote_currency" value={defaultCurrency || "AED"} />
        )}
      </div>

      {status === "none" ? (
        <p className="mb-0 text-[0.8125rem] text-ink-45">
          The client sees no pricing until you quote it or mark it free of charge.
        </p>
      ) : (
        <label className="field mb-0">
          <span className="field-label">Note to the client</span>
          <textarea
            className="textarea"
            name="quote_note"
            defaultValue={defaultNote}
            maxLength={2000}
            rows={2}
            placeholder={
              status === "free"
                ? "Why this one is on us — the client sees this."
                : "What the price covers — the client sees this."
            }
          />
        </label>
      )}
    </fieldset>
  );
}
