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
//  5. No RPKI claim: ROA status is currently `unknown` upstream, and every figure
//     here links out to pages where a visitor would see that.

export const networkSnapshot = {
  // registry fact
  asn: 218883,
  legalName: 'Melspectrum Technology Co., Ltd.',
  rir: 'RIPE',

  // routing fact — what AS218883 actually originates
  originatedPrefixes: ['2a13:c8c3:e803::/48'],

  // routing fact — observed by public collectors
  ris: {
    source: 'RIPE RIS',
    observedAt: '2026-09-04',
    visible: 320,
    total: 320,
    firstSeen: '2026-08-27',
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
