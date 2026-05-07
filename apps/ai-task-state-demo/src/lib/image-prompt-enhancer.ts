import "server-only";

import type { TaskType } from "@/types/task";

type EnhanceImagePromptInput = {
  userPrompt: string;
  taskType: TaskType;
  sourceImageName?: string;
};

const CJK_TEXT_PATTERN = /[\u3400-\u9FFF\uF900-\uFAFF]/;

const SUBJECT_HINTS: Array<{
  pattern: RegExp;
  subject: string;
  constraints: string[];
}> = [
  {
    pattern: /苹果|apple|apples/i,
    subject: "fresh apples",
    constraints: [
      "The apples must be the clear main subject.",
      "Show multiple visible apples unless the user asks for a single apple.",
      "Do not replace apples with people, roads, or scenery.",
      "Do not add road or landscape backgrounds.",
    ],
  },
  {
    pattern: /甜果|水果|fruit|fruits/i,
    subject: "fresh fruit",
    constraints: [
      "The fruit must be the clear main subject.",
      "Do not replace the fruit with unrelated scenery.",
    ],
  },
  {
    pattern: /猫|cat|kitten/i,
    subject: "a cat",
    constraints: [
      "The cat must be the clear main subject.",
      "Do not add unrelated people unless explicitly requested.",
    ],
  },
  {
    pattern: /狗|dog|puppy/i,
    subject: "a dog",
    constraints: [
      "The dog must be the clear main subject.",
      "Do not add unrelated people unless explicitly requested.",
    ],
  },
  {
    pattern: /头像|avatar|profile/i,
    subject: "a profile avatar",
    constraints: [
      "Use a clean centered composition.",
      "Make it suitable as a profile picture.",
    ],
  },
  {
    pattern: /logo|标志|图标|icon/i,
    subject: "a logo or icon",
    constraints: [
      "Use a clean minimal composition.",
      "Avoid complex background details.",
      "Make it suitable for a product or app identity.",
    ],
  },
  {
    pattern: /房子|建筑|building|house|architecture/i,
    subject: "architecture",
    constraints: [
      "The building or architecture must be the clear main subject.",
      "Avoid unrelated people unless explicitly requested.",
    ],
  },
];

function normalizePrompt(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function detectSubjectHint(prompt: string) {
  return SUBJECT_HINTS.find((hint) => hint.pattern.test(prompt));
}

function hasExplicitStyle(prompt: string) {
  return /摄影|照片|真实|写实|photo|photorealistic|realistic|cinematic|anime|cartoon|illustration|oil painting|watercolor|3d|render/i.test(
    prompt,
  );
}

function hasExplicitPeople(prompt: string) {
  return /人|人物|男人|女人|男孩|女孩|person|people|man|woman|boy|girl|portrait/i.test(
    prompt,
  );
}

function hasExplicitScene(prompt: string) {
  return /路|道路|街道|城市|森林|山|海|风景|road|street|city|forest|mountain|sea|landscape/i.test(
    prompt,
  );
}

function hasExplicitComposition(prompt: string) {
  return /近景|特写|全景|俯拍|正面|居中|close-up|macro|wide shot|top-down|front view|centered/i.test(
    prompt,
  );
}

function buildNegativeConstraints(prompt: string) {
  const constraints: string[] = [
    "Do not add unrelated objects or scenes.",
    "Do not change the main subject.",
    "Avoid text, watermark, logo, signature, UI elements, or distorted typography.",
  ];

  if (!hasExplicitPeople(prompt)) {
    constraints.push("Do not add people, faces, hands, or human figures.");
  }

  if (!hasExplicitScene(prompt)) {
    constraints.push(
      "Do not add roads, streets, random buildings, or landscape backgrounds.",
    );
  }

  return constraints;
}

export function enhanceImagePrompt({
  userPrompt,
  taskType,
  sourceImageName,
}: EnhanceImagePromptInput) {
  const originalPrompt = normalizePrompt(userPrompt);

  if (!originalPrompt) {
    return [
      "Create a high-quality square image.",
      "Main subject: a simple elegant object centered in the frame.",
      "Style: photorealistic, clean composition, high detail, natural lighting.",
      "Composition: centered subject, uncluttered background, square aspect ratio.",
      "Negative constraints: no people, no roads, no random landscape, no text, no watermark.",
    ].join("\n");
  }

  const subjectHint = detectSubjectHint(originalPrompt);
  const isLikelyChinese = CJK_TEXT_PATTERN.test(originalPrompt);

  const lines: string[] = [];

  lines.push(
    "Create one high-quality square image based strictly on the user's request.",
  );
  lines.push(
    "Preserve the user's intent. Do not reinterpret the subject into an unrelated scene.",
  );

  if (taskType === "image-to-image") {
    lines.push(
      "This is an image-to-image task. Use the source image as visual reference when available, but follow the user's text request as the editing direction.",
    );

    if (sourceImageName) {
      lines.push(`Source image filename: ${sourceImageName}.`);
    }
  } else {
    lines.push("This is a text-to-image task.");
  }

  if (subjectHint) {
    lines.push(`Main subject: ${subjectHint.subject}.`);
    lines.push(...subjectHint.constraints);
  } else {
    lines.push(
      "Main subject: identify the main subject from the user's request and make it visually dominant.",
    );
  }

  lines.push(`User request: ${originalPrompt}`);

  if (isLikelyChinese) {
    lines.push(
      "The user request may be written in Chinese. Translate its meaning accurately into the visual result instead of treating it as decorative text.",
    );
  }

  if (!hasExplicitStyle(originalPrompt)) {
    lines.push(
      "Default style: photorealistic, natural colors, high detail, clean lighting, realistic materials.",
    );
  } else {
    lines.push("Respect the visual style explicitly requested by the user.");
  }

  if (!hasExplicitComposition(originalPrompt)) {
    lines.push(
      "Default composition: close-up or medium close-up, centered main subject, uncluttered background, square aspect ratio.",
    );
  } else {
    lines.push("Respect the composition explicitly requested by the user.");
  }

  lines.push(
    "Quality: sharp focus, coherent geometry, clean details, no obvious artifacts.",
  );

  const negativeConstraints = [
    ...(subjectHint?.constraints ?? []),
    ...buildNegativeConstraints(originalPrompt),
  ];

  lines.push(
    `Negative constraints: ${Array.from(new Set(negativeConstraints)).join(" ")}`,
  );

  return lines.join("\n");
}

