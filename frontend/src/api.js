// ─────────────────────────────────────────────
//  Mock API  –  no backend required
//  Drop this file at  src/api.js
// ─────────────────────────────────────────────

const MOCK_LESSON = `
Photosynthesis is the process by which green plants, algae, and some bacteria convert light energy — usually from the Sun — into chemical energy stored as glucose.

The overall equation for photosynthesis is:
6CO₂  +  6H₂O  +  light energy  →  C₆H₁₂O₆  +  6O₂

This reaction takes place mainly in the chloroplasts, which contain a green pigment called chlorophyll. Chlorophyll absorbs red and blue wavelengths of light most efficiently and reflects green light, which is why plants appear green.

Photosynthesis happens in two main stages:

1. Light-dependent reactions (in the thylakoid membranes)
   - Light is absorbed by chlorophyll.
   - Water molecules are split, releasing oxygen as a by-product.
   - ATP and NADPH (energy carriers) are produced.

2. Light-independent reactions / Calvin Cycle (in the stroma)
   - CO₂ from the air is "fixed" using the ATP and NADPH produced above.
   - Glucose is synthesised through a series of enzyme-controlled steps.

Key factors that affect the rate of photosynthesis:
- Light intensity
- Carbon dioxide concentration
- Temperature
- Water availability

Understanding photosynthesis is fundamental to agriculture, ecology, and even the study of climate change, because plants act as carbon sinks that remove CO₂ from the atmosphere.
`.trim();

// ── helpers ────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Pick a canned reply that best matches the last user message.
 * Falls back to a generic explanation if nothing matches.
 */
function pickReply(messages, lessonText, highlightedText) {
  const lastUser = [...messages]
    .reverse()
    .find((m) => m.role === "user");

  const q = (lastUser?.content || "").toLowerCase();

  // ── Highlight / confusion ───────────────────────────────────────────────
  if (highlightedText) {
    return buildHighlightReply(highlightedText);
  }

  // ── Summarise context ───────────────────────────────────────────────────
  if (q.includes("summarize") || q.includes("summarise") || q.includes("summary")) {
    return `Summary

Here are the key ideas from the lesson:

- Photosynthesis converts light energy into chemical energy (glucose).
- The equation is: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂.
- It happens inside chloroplasts, using chlorophyll to capture light.
- Stage 1 (light-dependent): splits water, produces ATP & NADPH, releases O₂.
- Stage 2 (Calvin Cycle): uses ATP & NADPH to fix CO₂ and build glucose.
- Rate is affected by light, CO₂, temperature, and water.

In one line

Plants eat sunlight and breathe out oxygen — that's photosynthesis in a nutshell.

Quick tips for what to ask next:
- "Can you explain the Calvin Cycle step by step?"
- "Why does temperature affect photosynthesis?"`;
  }

  // ── Calvin / light-independent ──────────────────────────────────────────
  if (q.includes("calvin") || q.includes("light-independent") || q.includes("stroma")) {
    return `Key idea

The Calvin Cycle is the second stage of photosynthesis. It happens in the stroma (the fluid inside the chloroplast).

Step by step

1. Carbon fixation – CO₂ from the air attaches to a 5-carbon molecule called RuBP.
2. Reduction – ATP and NADPH (made in stage 1) are used to turn the result into G3P, a simple sugar.
3. Regeneration – Most G3P is recycled to remake RuBP so the cycle can continue; the rest is used to build glucose.

Extra rules

The cycle needs 3 turns to produce one G3P molecule, and 6 turns to produce one glucose.`;
  }

  // ── Chlorophyll / colour ────────────────────────────────────────────────
  if (q.includes("chlorophyll") || q.includes("green") || q.includes("colour") || q.includes("color")) {
    return `Key idea

Chlorophyll is the pigment that gives plants their green colour and drives photosynthesis.

- It absorbs red and blue light most efficiently.
- It reflects green light — that's why we see plants as green.
- It sits in the thylakoid membranes inside chloroplasts.
- When light hits chlorophyll, electrons get energised and start the light-dependent reactions.`;
  }

  // ── Light-dependent ─────────────────────────────────────────────────────
  if (q.includes("light-dependent") || q.includes("thylakoid") || q.includes("atp") || q.includes("nadph")) {
    return `Key idea

The light-dependent reactions are the first stage of photosynthesis. They happen in the thylakoid membranes.

Step by step

1. Chlorophyll absorbs sunlight.
2. Water (H₂O) is split — this releases oxygen (O₂) as a by-product, which exits through the leaf.
3. The energy from light is used to make ATP and NADPH.
4. These two molecules act as "energy currency" and are passed on to the Calvin Cycle.`;
  }

  // ── Rate / factors ──────────────────────────────────────────────────────
  if (
    q.includes("rate") ||
    q.includes("factor") ||
    q.includes("temperature") ||
    q.includes("light intensity") ||
    q.includes("co2")
  ) {
    return `Key idea

Four main factors control how fast photosynthesis happens:

- Light intensity – more light means more energy, so the rate rises (up to a limit).
- CO₂ concentration – CO₂ is a raw material; more of it speeds up the Calvin Cycle.
- Temperature – enzymes work faster as temperature rises, but denature above ~40 °C.
- Water availability – water is split in stage 1; without it, the whole process stops.

Extra rules

If any one factor is in short supply it becomes the limiting factor — it caps the rate even if all other factors are ideal.`;
  }

  // ── Equation ───────────────────────────────────────────────────────────
  if (q.includes("equation") || q.includes("formula") || q.includes("6co")) {
    return `Key idea

The overall equation for photosynthesis is:

6CO₂  +  6H₂O  +  light energy  →  C₆H₁₂O₆  +  6O₂

Breaking it down:

- 6CO₂ — six carbon dioxide molecules (from the air)
- 6H₂O — six water molecules (absorbed through roots)
- light energy — captured by chlorophyll
- C₆H₁₂O₆ — one glucose molecule (stored chemical energy)
- 6O₂ — six oxygen molecules released as a by-product`;
  }

  // ── Oxygen ─────────────────────────────────────────────────────────────
  if (q.includes("oxygen") || q.includes("o₂") || q.includes("o2")) {
    return `Key idea

Oxygen is a by-product of the light-dependent reactions. Here's how it's produced:

- During stage 1, water molecules are split by light energy — this is called photolysis.
- The splitting releases hydrogen ions and electrons (used to make ATP & NADPH) and oxygen atoms.
- Two oxygen atoms combine to form O₂, which diffuses out of the leaf through tiny pores called stomata.

In one line

The oxygen we breathe is essentially waste from plants splitting water!`;
  }

  // ── What / how / explain (generic) ─────────────────────────────────────
  if (
    q.includes("what is") ||
    q.includes("what are") ||
    q.includes("how does") ||
    q.includes("explain") ||
    q.includes("tell me")
  ) {
    return buildGenericReply(lessonText);
  }

  // ── Fallback ────────────────────────────────────────────────────────────
  return `That's a great question! Based on the lesson, here's what I can tell you:

Photosynthesis is a two-stage process — light-dependent reactions and the Calvin Cycle — that converts sunlight, water, and CO₂ into glucose and oxygen.

If you'd like a deeper dive into any specific part, try asking something like:
- "Explain the Calvin Cycle"
- "Why are plants green?"
- "What factors affect the rate of photosynthesis?"`;
}

function buildHighlightReply(highlighted) {
  const h = highlighted.toLowerCase();

  if (h.includes("chloroplast") || h.includes("chlorophyll")) {
    return `Key idea

Chloroplasts are the organelles where photosynthesis happens. Think of them as tiny solar panels inside plant cells.

- They contain chlorophyll, the green pigment that traps light energy.
- They have two compartments: the thylakoids (where stage 1 occurs) and the stroma (where the Calvin Cycle runs).

In one line

Chloroplasts = the kitchen where plants cook their food using sunlight.`;
  }

  if (h.includes("atp") || h.includes("nadph")) {
    return `Key idea

ATP and NADPH are energy-carrying molecules produced during the light-dependent reactions.

- ATP (adenosine triphosphate) stores chemical energy in its bonds.
- NADPH carries high-energy electrons.
- Both are then consumed in the Calvin Cycle to build glucose from CO₂.

Think of them like rechargeable batteries: stage 1 charges them, stage 2 uses them.`;
  }

  if (h.includes("glucose") || h.includes("c₆h₁₂o₆")) {
    return `Key idea

Glucose (C₆H₁₂O₆) is the sugar produced by photosynthesis — it's the plant's food.

- It is made during the Calvin Cycle in the stroma.
- Plants use glucose for energy (via respiration) and as a building block for cellulose, starch, and other molecules.
- Any excess is converted to starch and stored.`;
  }

  // Generic highlight reply
  return `Key idea

You highlighted: "${highlighted.slice(0, 120)}${highlighted.length > 120 ? "…" : ""}"

Here's a simple breakdown:

- This is part of the photosynthesis process covered in the lesson.
- It connects to how plants capture energy and convert it into glucose.
- If this part seems confusing, try reading it alongside the overall equation: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂.

Feel free to ask a follow-up question about any specific word or phrase!`;
}

function buildGenericReply(lessonText) {
  return `Key idea

Photosynthesis is how plants make their own food using sunlight.

Step by step

1. The plant absorbs sunlight through chlorophyll in its leaves.
2. It takes in CO₂ from the air and water from the soil.
3. The light-dependent reactions split water and produce ATP & NADPH.
4. The Calvin Cycle uses those to turn CO₂ into glucose.
5. Oxygen is released as a waste product.

In one line

Sunlight + water + CO₂ → glucose + oxygen.

Extra rules

- This all happens inside chloroplasts.
- The rate depends on light, CO₂, temperature, and water.`;
}

// ── Public API surface ──────────────────────────────────────────────────────

/**
 * Fetch the lesson content.
 * Replace with a real fetch() call when your backend is ready.
 */
export async function fetchLesson() {
  await sleep(400); // simulate network latency
  return { lesson_text: MOCK_LESSON };
}

/**
 * Send a chat message and receive an assistant reply.
 *
 * @param {Object} params
 * @param {string}   params.lesson_text
 * @param {string}   [params.highlighted_text]
 * @param {string}   [params.highlight_context]
 * @param {Array}    params.messages  – array of {role, content}
 * @returns {Promise<{ assistant_message: { role: string, content: string } }>}
 */
export async function sendChatMessage({ lesson_text, highlighted_text, highlight_context, messages }) {
  // Simulate thinking time (800 ms – 1.6 s)
  await sleep(800 + Math.random() * 800);

  const content = pickReply(messages, lesson_text, highlighted_text);

  return {
    assistant_message: {
      role: "assistant",
      content
    }
  };
}
