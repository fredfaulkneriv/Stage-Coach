export interface PacerScript {
  id: string
  title: string
  type: 'storytelling' | 'persuasive' | 'technical' | 'conversational' | 'news_anchor'
  typeLabel: string
  typeEmoji: string
  text: string
  wordCount: number
}

export const PACER_SCRIPTS: PacerScript[] = [
  {
    id: 'last_expedition',
    title: 'The Last Expedition',
    type: 'storytelling',
    typeLabel: 'Storytelling',
    typeEmoji: '📖',
    wordCount: 155,
    text: `When Ernest Shackleton's ship Endurance became trapped in Antarctic ice in 1915, he faced an impossible choice. Twenty-seven men. One thousand miles of frozen ocean. No radio contact with the outside world. He could panic. He could give up. Instead, he gathered his crew and made a promise: every single man would make it home alive. For eighteen months, they survived on penguin meat and melted ice. When the ship finally sank, Shackleton loaded his men into three small lifeboats and sailed to the most remote island on earth. Then, with five volunteers, he crossed eight hundred miles of the world's most dangerous ocean in a twenty-two-foot boat. He reached help. He went back. He kept his promise. All twenty-seven men survived. Leadership is not about having the right answer. It is about refusing to abandon the people depending on you.`,
  },
  {
    id: 'two_minute_rule',
    title: 'The Two-Minute Rule',
    type: 'persuasive',
    typeLabel: 'Persuasive',
    typeEmoji: '🎯',
    wordCount: 153,
    text: `Most of us carry a mental backlog that never seems to shrink. Tasks pile up. Emails accumulate. Requests sit unanswered for days. The problem is not that we are lazy. The problem is that we are making the same decision over and over without acting on it. There is a simple solution called the two-minute rule. If a task takes less than two minutes to complete, do it right now. Do not schedule it. Do not add it to a list. Just do it. Reply to the email. Make the call. Sign the form. The cognitive load of tracking an unfinished task costs more energy than the task itself. Your brain is not a storage system. It is a processing system. Stop filing things away for later. The two-minute rule will not solve everything. But it will immediately reduce your daily friction by more than you expect.`,
  },
  {
    id: 'how_ai_works',
    title: 'How AI Actually Works',
    type: 'technical',
    typeLabel: 'Technical',
    typeEmoji: '💻',
    wordCount: 158,
    text: `Artificial intelligence sounds mysterious, but the core idea is surprisingly simple. You show a system millions of examples. The system finds patterns. Then it uses those patterns to make predictions about new examples it has never seen before. That is it. When you train an image recognition model, you feed it ten million photos labeled cat or not cat. The model adjusts its internal parameters until it can distinguish a cat with ninety-five percent accuracy. When you train a language model, you feed it billions of sentences from the internet. The model learns which words tend to follow which other words, in which contexts. The result feels like understanding. It is not. It is extremely sophisticated pattern matching at enormous scale. This distinction matters. AI does not reason from principles. It does not generalize the way humans do. Understanding the difference helps you predict when AI will work brilliantly and when it will fail completely.`,
  },
  {
    id: 'sleep_superpower',
    title: 'Sleep Is Your Superpower',
    type: 'conversational',
    typeLabel: 'Conversational',
    typeEmoji: '💬',
    wordCount: 163,
    text: `I used to think sleeping less was something to be proud of. Five hours a night felt efficient. Productive. Like I was getting more done than everyone else. I was wrong. Sleep is not rest. It is maintenance. While you sleep, your brain flushes out toxic proteins that accumulate during the day. Your memories consolidate from short-term into long-term storage. Your immune system deploys repair crews throughout your body. Skimp on sleep and none of that happens properly. The science is brutally clear. After seventeen hours without sleep, your cognitive performance is equivalent to a blood alcohol level of zero point zero five. After twenty-four hours, it matches being legally drunk. You are not being productive when you cut sleep. You are borrowing performance from tomorrow and paying interest. Start treating eight hours as a non-negotiable. Your work will get better. Your decisions will improve. And you will stop feeling like you are always running slightly behind.`,
  },
  {
    id: 'the_headlines',
    title: 'The Headlines',
    type: 'news_anchor',
    typeLabel: 'News Anchor',
    typeEmoji: '📺',
    wordCount: 164,
    text: `Good evening. Here are tonight's top stories. In technology, researchers announced a breakthrough in battery storage that could extend electric vehicle range by forty percent. The technology uses a new compound that retains stability through thousands of charge cycles. In business news, global markets closed mixed today as investors weighed stronger-than-expected employment data against continued uncertainty about interest rate policy. The Dow Jones gained one-point-two percent while the Nasdaq fell slightly in late trading. In local news, city officials approved a transit plan that will add twelve miles of dedicated bus lanes over the next three years. Supporters say the project will reduce commute times by up to twenty minutes on the city's most congested corridors. And finally, marine biologists documented what may be the largest gathering of blue whales ever recorded. More than fifty individuals observed feeding together in a single bay. For continued updates, stay with us throughout the evening. Good night.`,
  },
]

export function getDurationAtWpm(script: PacerScript, wpm: number): number {
  return Math.ceil((script.wordCount / wpm) * 60)
}

export function formatDurationFromSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s === 0 ? `${m} min` : `${m}:${s.toString().padStart(2, '0')}`
}
