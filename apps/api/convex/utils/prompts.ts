export const rolePrompt = (interest: string, accomplishment: string) => `
<directions>
You are generating a very short, highly unique "Role" (a personal brand name) for a user to be displayed in a waiting room. This role must be 2-3 specific words that uniquely capture a key aspect of their intellectual focus or style, derived directly from their listed interests and accomplishments. Avoid generic terms entirely.
You are provided with the user's key interests and significant accomplishments.
Generate only the Role.
</directions>

<guardrails>
Do not repeat anything by scratch.
The output must be only the Role, as a single phrase.
The Role must be 2-3 words long.
The Role must be highly unique and specifically derived from the provided interests and accomplishments.
The words must be descriptive of their intellectual focus or style.
Do not include personal data like journal names or specific project titles.
</guardrails>

<example>
user:
- Interests: Building Voice AI applications for healthcare
- Accomplishments: Published paper on cognitive science in Nature Journal

response:
Cognitive Voice Architect

<user>
- Interests: ${interest}
- Accomplishments: ${accomplishment}
</user>
`;

export const taglinePrompt = (interest: string, accomplishment: string) => `
<directions>
You are generating an impactful, aspirational "Tagline" for a user to be displayed in a waiting room. This tagline should be a single, dynamic sentence that captures the user's cutting-edge drive and potential by highlighting a key, significant aspect of their accomplishments and dynamically connecting it to their innovative interests. Make it exciting, forward-looking, and uniquely tailored to the user's specific background as provided.
You are provided with the user's key interests and significant accomplishments.
Generate only the Tagline.
</directions>

<guardrails>
Do not repeat anything by scratch.
The output must be only the Tagline, as a single sentence.
The Tagline must be a complete sentence.
The Tagline should be impactful, aspirational, engaging, and forward-looking.
**The Tagline must identify and prominently feature a key, significant, and specific aspect of the user's accomplishments (e.g., "leading groundbreaking research," "pioneering a new technology," "driving significant outcomes in X area," "published expert in Y field") and connect it to their interests.**
The Tagline should dynamically connect the highlighted accomplishment aspect to the user's cutting-edge drive and interests.
Avoid mentioning specific journals, project titles, or other sensitive and identifiable personal data. Use descriptive phrases that capture the *type* or *significance* of the accomplishment.
</guardrails>

<example>
user:
- Interests: Building Voice AI applications for healthcare
- Accomplishments: Published paper on cognitive science in Nature Journal (implies leading research in a specific field)

response:
Published researcher in cognitive science aiming to push the frontier of health AI with innovative Voice applications.

<user>
- Interests: ${interest}
- Accomplishments: ${accomplishment}
</user>
`;

// // NOT USED AT THE MOMENT
// export const firstQuestionPrompt = (
//   interest: string,
//   accomplishment: string
// ) => `
// <directions>
// Your goal is to initiate a "smart conversation" by thoughtfully acknowledging the applicant's background and smoothly transitioning to their current interests.
// You are provided with the applicant's key interests and significant accomplishments.
// Craft a short opening that begins with a brief, professional acknowledgment of a notable accomplishment, phrased in a way that conveys genuine, understated respect for its significance. This acknowledgment should subtly connect or transition to a concise, open-ended question designed to explore the applicant's interests and initiate dialogue about their passions, making the entire opening feel like a natural, intellectually linked thought, suitable for an interview context. Maintain a friendly, insightful, and genuinely curious tone that is appropriate for a professional interview setting.
// </directions>

// <guardrails>
// Do not repeat anything by scratch.
// The opening must be a single, short response combining an accomplishment acknowledgment and a question.
// The acknowledgment should be brief, specific to an accomplishment, convey genuine, *understated* respect for its significance (higher EQ), and be professionally phrased. Avoid hyperbole or overly dramatic language.
// The question should be concise, directly related to their stated interests, and invite an expansive response.
// Crucially, the acknowledgment and the question must be intellectually or thematically connected. The acknowledgment should naturally lead into or set the context for the question about their interests.
// Avoid generic phrases; tailor the language to sound insightful, personally engaged, appreciative in a professional manner, and highlight the connection between their past achievements and current interests, while balancing intellectual depth and professionalism.
// If no interests or accomplishments are provided, simply ask: "What are you passionate about?"
// </guardrails>

// <example>
// user:
// - Interests: Building Voice AI applications for healthcare
// - Accomplishments: Published paper on cognitive science in Nature Journal

// response:
// It's great to see your publication in Nature, that's quite an achievement. Given your focus on complex cognitive science, what aspects of building Voice AI applications for healthcare are currently capturing your intellectual curiosity?

// <user>
// - Interests: ${interest}
// - Accomplishments: ${accomplishment}
// </user>
// `;
