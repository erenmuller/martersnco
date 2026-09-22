// Screens contact-form submissions for unsolicited SEO / marketing pitches.
// Genuine enquiries sometimes mention SEO or traffic, so a loose keyword is
// never enough: a submission is rejected on one unmistakable pitch phrase, or
// on SEO talk combined with the shape of a cold pitch.

// Phrases that only ever appear in a sales pitch aimed at us.
const PITCH_PATTERNS: RegExp[] = [
  /\brank(ing)? (your|ur) (website|site|business|page)/,
  /\b(your|ur) (website|site) (is not|isn't|isnt|not) (ranking|showing|appearing|visible)/,
  /\b(we|i) (offer|provide|specialize in|specialise in) [\w\s,&-]{0,40}\bseo\b/,
  /\bseo (expert|specialist|agency|company|services?|packages?|team|consultant|freelancer)\b/,
  /\b(affordable|cheap|white[- ]hat|guaranteed|monthly) seo\b/,
  /\b(high[- ]quality|high da|do[- ]?follow|niche|pbn|edu|gov) backlinks?\b/,
  /\bguest (post|posting|article)s?\b/,
  /\bdomain (authority|rating)\b/,
  /\blink[- ]?building\b/,
  /\b(reply|respond|write back) (with )?["'“]?(yes|interested|ok)["'”]?/,
  /\b(google|search engine) (ranking|rankings|results|listing)s? (for|of) (your|ur)\b/,
  /\b(reply|respond) (with )?["'“]?(stop|unsubscribe|no)["'”]? to (unsubscribe|opt out|stop)/,
  /\bfiverr\.com|upwork\.com\/freelancers\b/,
];

// Talk of search rankings is fine alone: clients do ask about it.
const SEO_TOPIC =
  /\bseo\b|search engine optimi[sz]ation|\bbacklinks?\b|\bserps?\b|\b(organic|website|web) traffic\b|\bgoogle (ranking|rank|page|maps|my business|business profile)\b|\bdigital marketing\b|\blead generation\b|\b(first|1st|top) (page|position|spot)s? (of|on|in) (google|bing|search)/;

// It becomes a pitch when written *about our* site, or in cold-outreach form.
const PITCH_SIGNALS: RegExp[] = [
  /\b(your|ur) (website|site|online presence|business listing)\b/,
  /\b(checking|reviewing|analy[sz]ing|audited|went through) (your|ur) (website|site)\b/,
  /\b(dear|hello|hi) (sir|madam|sir\/madam|business owner|website owner|webmaster)\b/,
  /\b(send|share) (you )?(our |the |a )?(price|pricing|quote|proposal|packages?|plans?|report|audit)\b/,
  /\b(free|quick) (seo |website )?(audit|analysis|report)\b/,
  /\b(our|my) (services|agency|team) (can|will) (help|boost|increase|improve)\b/,
  /\b(increase|boost|improve|double|triple) (your|ur) (traffic|sales|ranking|rankings|visibility|leads)\b/,
];

export function isSeoSpam(fields: {
  name?: string;
  email?: string;
  company?: string;
  message: string;
}): boolean {
  const text = [fields.name, fields.company, fields.message]
    .filter(Boolean)
    .join("\n")
    .toLowerCase()
    .replace(/\s+/g, " ");

  if (PITCH_PATTERNS.some((pattern) => pattern.test(text))) return true;

  // Pitches are commonly sent from addresses named after the service.
  const emailSignal = /(^|[^a-z])(seo|backlinks?|ranking)([^a-z]|$)/.test(
    fields.email?.toLowerCase().split("@")[0] ?? "",
  );

  if (!SEO_TOPIC.test(text)) return false;
  return emailSignal || PITCH_SIGNALS.some((pattern) => pattern.test(text));
}
