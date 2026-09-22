import { site } from "./site";

export function whatsappUrl(message?: string) {
  const url = `https://wa.me/${site.whatsappNumber}`;
  return message ? `${url}?text=${encodeURIComponent(message)}` : url;
}

export function whatsappEnquiry(
  details: { name: string; email: string; company: string; message: string },
  interest: string,
) {
  return [
    "Hello Marters & Co., I’d like to discuss how you could help my business.",
    "",
    ...[
      ["Name", details.name],
      ["Email", details.email],
      ["Company", details.company],
      ["Interest", interest],
    ].flatMap(([label, value]) => value.trim() ? [`${label}: ${value.trim()}`] : []),
    "",
    details.message.trim(),
  ].join("\n");
}
