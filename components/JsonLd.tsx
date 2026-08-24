/**
 * Structured data. Two audiences read this: search engines building a
 * knowledge panel, and AI assistants answering "who does automation
 * consulting in Dubai". Both want unambiguous, machine-readable facts.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  // Escaping `<` prevents an environment-provided value from closing the
  // script element early while preserving valid JSON-LD.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
