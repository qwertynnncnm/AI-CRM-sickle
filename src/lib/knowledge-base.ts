import { prisma } from "@/lib/prisma"

export type KnowledgeReference = {
  id: number
  question: string
  answer: string
  citationCount: number
}

const stopWords = new Set([
  "客户",
  "销售",
  "沟通",
  "问题",
  "我们",
  "你们",
  "这个",
  "那个",
  "需要",
  "可以",
  "已经",
  "the",
  "and",
  "for",
  "with",
])

function tokenize(value: string) {
  const normalized = value.slice(0, 500).toLocaleLowerCase()
  const tokens = new Set<string>()

  for (const word of normalized.match(/[a-z0-9][a-z0-9_-]{1,}/g) ?? []) {
    if (!stopWords.has(word)) tokens.add(word)
  }

  for (const sequence of normalized.match(/[\u3400-\u9fff]{2,}/g) ?? []) {
    if (sequence.length <= 6 && !stopWords.has(sequence)) tokens.add(sequence)
    for (let index = 0; index < sequence.length - 1; index += 1) {
      const bigram = sequence.slice(index, index + 2)
      if (!stopWords.has(bigram)) tokens.add(bigram)
    }
    for (let index = 0; index < sequence.length - 2; index += 1) {
      const trigram = sequence.slice(index, index + 3)
      if (!stopWords.has(trigram)) tokens.add(trigram)
    }
  }

  return [...tokens]
    .sort((left, right) => right.length - left.length)
    .slice(0, 12)
}

function scoreKnowledgeEntry(entry: KnowledgeReference, tokens: string[]) {
  const question = entry.question.toLocaleLowerCase()
  const answer = entry.answer.toLocaleLowerCase()
  let score = 0

  for (const token of tokens) {
    if (question.includes(token)) score += token.length >= 3 ? 7 : 4
    if (answer.includes(token)) score += token.length >= 3 ? 3 : 1
  }

  return score
}

export async function retrieveKnowledgeReferences(query: string, limit = 5) {
  const tokens = tokenize(query)
  if (tokens.length === 0) return []

  const entries = await prisma.knowledgeBase.findMany({
    where: {
      OR: tokens.flatMap((token) => [
        { question: { contains: token } },
        { answer: { contains: token } },
      ]),
    },
    orderBy: [{ citationCount: "desc" }, { createdAt: "desc" }],
    take: 50,
    select: {
      id: true,
      question: true,
      answer: true,
      citationCount: true,
    },
  })

  const rankedEntries = entries
    .map((entry) => ({ entry, score: scoreKnowledgeEntry(entry, tokens) }))
    .sort(
      (left, right) =>
        right.score - left.score ||
        right.entry.citationCount - left.entry.citationCount ||
        right.entry.id - left.entry.id
    )

  return rankedEntries
    .slice(0, Math.max(0, Math.min(limit, 10)))
    .map(({ entry }) => entry)
}

export function formatKnowledgeReferences(references: KnowledgeReference[]) {
  if (references.length === 0) {
    return "未检索到与本次沟通直接相关的标准话术，请仅依据客户事实回答。"
  }

  return references
    .map(
      (reference, index) => `【知识库参考 ${index + 1}｜编号 ${reference.id}】
常见问题：${reference.question}
标准话术：${reference.answer}`
    )
    .join("\n\n")
}

export async function recordKnowledgeCitations(references: KnowledgeReference[]) {
  const ids = [...new Set(references.map((reference) => reference.id))]
  if (ids.length === 0) return

  await prisma.knowledgeBase.updateMany({
    where: { id: { in: ids } },
    data: { citationCount: { increment: 1 } },
  })
}
