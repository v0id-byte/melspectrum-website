// AS218883 — public network facts.
//
// GOVERNANCE (do not relax these when editing):
//  1. Only ORIGINATED prefixes appear here. Provider-assigned management space
//     (AVS 2a14:7580:c057::1/48, MoeDove 2602:f92a:100:d800::a/56, Route64
//     2a11:6c7:f08:14::2/64) is NOT ours to advertise as a network asset.
//  2. Telemetry is a dated SNAPSHOT, never a permanent property. Every observed
//     figure carries its own provenance; `routingPresence` is operator-maintained
//     and deliberately does NOT inherit the RIS observedAt/source.
//  3. Three fact classes must not be derived from one another:
//     registry fact / routing fact / operational fact.
//  4. Static data only — the site never calls the RIPE API at runtime.
//  5. No RPKI claim: the RIPE prefix's ROA status is still `unknown` upstream, and
//     every figure here links out to pages where a visitor would see that.
//  6. Prefixes carry their own RIR + first-announced date. The two are NOT
//     equivalent in provenance and must not be flattened into one label:
//       - 2a13:c8c3:e803::/48 is assigned to our own RIPE org (ORG-MTCL12-RIPE).
//       - 2602:f92a:a463::/48 is a reassignment out of an ARIN /32 held by
//         MoeDove. We originate it (ROA + IRR route6 both say origin AS218883),
//         which is why it belongs here under rule 1 — but it is NOT our own
//         allocation, and ARIN remote registration is not enabled yet. Do not
//         describe it as "our allocation" anywhere on the site.
//  7. The site itself is served by GitHub Pages (Fastly), NOT by AS218883.
//     `directService` is the one property actually served from our own prefix.
//     Never write "this website runs on our own IPv6 network" — it is false.

export const networkSnapshot = {
  // registry fact
  asn: 218883,
  legalName: 'Melspectrum Technology Co., Ltd.',
  rir: 'RIPE',

  // routing fact — what AS218883 actually originates (see governance rule 6)
  originatedPrefixes: [
    { prefix: '2a13:c8c3:e803::/48', rir: 'RIPE', since: '2026-08-27' },
    { prefix: '2602:f92a:a463::/48', rir: 'ARIN', since: '2026-09-05' },
  ],

  // routing fact — observed by public collectors.
  // Scoped to ONE prefix on purpose: RIS had not yet observed the ARIN prefix at
  // the snapshot time (announced 2026-09-05; RIS dataset was still at 09-04).
  // Do not relabel this as covering both prefixes until RIS actually shows both.
  ris: {
    prefix: '2a13:c8c3:e803::/48',
    source: 'RIPE RIS',
    observedAt: '2026-09-04',
    visible: 320,
    total: 320,
    firstSeen: '2026-08-27',
  },

  // operational fact — a page a visitor can open that is actually served from
  // an address inside our own prefix (not GitHub Pages, not Cloudflare).
  directService: {
    host: 'v6.pianotuner.top',
    address: '2602:f92a:a463:400::80',
    ipv6Only: true,
  },

  // operational fact — routing control-plane endpoints we actually run.
  // Transit coverage direction is NOT a POP.
  routingPresence: [
    { code: 'AMS', region: 'Europe', regionEn: 'Europe' },
    { code: 'SLC', region: '北美 · 山区', regionEn: 'US Mountain' },
    { code: 'LAX', region: '北美 · 西岸', regionEn: 'US West' },
  ],
};

export const networkLinks = [
  { label: 'RIPEstat', href: 'https://stat.ripe.net/AS218883' },
  { label: 'PeeringDB', href: 'https://www.peeringdb.com/asn/218883' },
  { label: 'bgp.tools', href: 'https://bgp.tools/as/218883' },
  { label: 'Hurricane Electric', href: 'https://bgp.he.net/AS218883' },
  { label: 'ipinfo', href: 'https://ipinfo.io/AS218883' },
];
