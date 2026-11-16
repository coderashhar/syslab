export const backOfEnvelopeScenarios = [
  {
    id: "peak-api-traffic",
    category: "Traffic",
    title: "Peak API traffic",
    prompt: "Estimate the peak requests per second for a consumer API.",
    answerUnit: "requests / second",
    fields: [
      { key: "users", label: "Daily active users", value: 10000000, min: 100000, step: 100000 },
      { key: "requestsPerUser", label: "Requests per user / day", value: 20, min: 1, step: 1 },
      { key: "peakMultiplier", label: "Peak vs average", value: 3, min: 1, step: 0.5 },
    ],
    calculate: ({ users, requestsPerUser, peakMultiplier }) => {
      const average = (users * requestsPerUser) / 86400;
      const peak = average * peakMultiplier;
      return {
        answer: peak,
        steps: [
          `${formatNumber(users)} users x ${formatNumber(requestsPerUser)} requests/day = ${formatNumber(users * requestsPerUser)} requests/day`,
          `${formatNumber(users * requestsPerUser)} / 86,400 seconds = ${formatNumber(average, 1)} average req/s`,
          `${formatNumber(average, 1)} average req/s x ${formatNumber(peakMultiplier, 1)} peak factor = ${formatNumber(peak, 1)} peak req/s`,
        ],
      };
    },
  },
  {
    id: "daily-storage",
    category: "Storage",
    title: "Daily event storage",
    prompt: "Estimate how much new storage an event pipeline writes each day.",
    answerUnit: "GB / day",
    fields: [
      { key: "eventsPerSecond", label: "Events per second", value: 5000, min: 10, step: 100 },
      { key: "bytesPerEvent", label: "Bytes per event", value: 800, min: 100, step: 100 },
      { key: "replicas", label: "Stored copies", value: 3, min: 1, step: 1 },
    ],
    calculate: ({ eventsPerSecond, bytesPerEvent, replicas }) => {
      const bytesPerDay = eventsPerSecond * bytesPerEvent * 86400 * replicas;
      const gigabytes = bytesPerDay / 1e9;
      return {
        answer: gigabytes,
        steps: [
          `${formatNumber(eventsPerSecond)} events/s x ${formatNumber(bytesPerEvent)} bytes = ${formatNumber(eventsPerSecond * bytesPerEvent)} bytes/s`,
          `${formatNumber(eventsPerSecond * bytesPerEvent)} bytes/s x 86,400 seconds = ${formatNumber(eventsPerSecond * bytesPerEvent * 86400)} bytes/day`,
          `${formatNumber(eventsPerSecond * bytesPerEvent * 86400)} x ${formatNumber(replicas)} copies = ${formatNumber(gigabytes, 1)} GB/day`,
        ],
      };
    },
  },
  {
    id: "egress-bandwidth",
    category: "Bandwidth",
    title: "API egress bandwidth",
    prompt: "Estimate the outbound network bandwidth for a busy API.",
    answerUnit: "Gbps",
    fields: [
      { key: "requestsPerSecond", label: "Requests per second", value: 100000, min: 1000, step: 1000 },
      { key: "responseKb", label: "Response size", value: 20, min: 1, step: 1 },
      { key: "headroom", label: "Headroom factor", value: 1.25, min: 1, step: 0.05 },
    ],
    calculate: ({ requestsPerSecond, responseKb, headroom }) => {
      const gigabitsPerSecond = (requestsPerSecond * responseKb * 1000 * 8 * headroom) / 1e9;
      return {
        answer: gigabitsPerSecond,
        steps: [
          `${formatNumber(requestsPerSecond)} requests/s x ${formatNumber(responseKb)} KB = ${formatNumber(requestsPerSecond * responseKb)} KB/s`,
          `${formatNumber(requestsPerSecond * responseKb)} KB/s x 8 bits = ${formatNumber(requestsPerSecond * responseKb * 8)} Kbits/s`,
          `Convert to Gbps and add ${formatNumber((headroom - 1) * 100, 0)}% headroom = ${formatNumber(gigabitsPerSecond, 2)} Gbps`,
        ],
      };
    },
  },
];

export function formatNumber(value, decimals = 0) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
}
