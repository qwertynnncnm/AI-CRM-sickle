"use client"

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react"
import { LoaderCircle, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import {
  createKnowledgeEntry,
  deleteKnowledgeEntry,
  type KnowledgeFormState,
  updateKnowledgeEntry,
} from "@/app/knowledge-base/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type KnowledgeEntry = {
  id: number
  question: string
  answer: string
}

const initialState: KnowledgeFormState = { success: false, message: "" }

function KnowledgeForm({
  entry,
  onSuccess,
}: {
  entry?: KnowledgeEntry
  onSuccess: () => void
}) {
  const action = entry
    ? updateKnowledgeEntry.bind(null, entry.id)
    : createKnowledgeEntry
  const [state, formAction, pending] = useActionState(action, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!state.success) return
    formRef.current?.reset()
    toast.success(state.message)
    onSuccess()
  }, [onSuccess, state.message, state.success])

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <div>
        <Label htmlFor={`question-${entry?.id ?? "new"}`}>客户常见问题</Label>
        <Textarea
          id={`question-${entry?.id ?? "new"}`}
          name="question"
          defaultValue={entry?.question}
          placeholder="例如：你们的实施周期需要多久？"
          rows={3}
          required
          maxLength={500}
          aria-invalid={Boolean(state.fieldErrors?.question)}
          className="mt-2 resize-y"
        />
        {state.fieldErrors?.question && (
          <p className="mt-1.5 text-xs text-red-600">{state.fieldErrors.question}</p>
        )}
      </div>

      <div>
        <Label htmlFor={`answer-${entry?.id ?? "new"}`}>标准话术</Label>
        <Textarea
          id={`answer-${entry?.id ?? "new"}`}
          name="answer"
          defaultValue={entry?.answer}
          placeholder="填写销售可直接参考的专业回答、关键事实与边界条件。"
          rows={8}
          required
          maxLength={10_000}
          aria-invalid={Boolean(state.fieldErrors?.answer)}
          className="mt-2 resize-y"
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
              event.preventDefault()
              event.currentTarget.form?.requestSubmit()
            }
          }}
        />
        {state.fieldErrors?.answer && (
          <p className="mt-1.5 text-xs text-red-600">{state.fieldErrors.answer}</p>
        )}
      </div>

      {state.message && !state.success && (
        <p role="alert" className="rounded-xl bg-[#fff0f0] px-3 py-2 text-sm text-[#b42318]">
          {state.message}
        </p>
      )}

      <DialogFooter>
        <Button type="submit" size="lg" disabled={pending}>
          {pending && <LoaderCircle className="animate-spin" aria-hidden="true" />}
          {pending ? "正在保存" : entry ? "保存修改" : "创建知识"}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function NewKnowledgeDialog() {
  const [open, setOpen] = useState(false)
  const closeDialog = useCallback(() => setOpen(false), [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="lg" />}>
        <Plus aria-hidden="true" />
        新增知识
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>新增标准话术</DialogTitle>
          <DialogDescription>
            录入客户常见问题与经过确认的标准回答，AI 会在相关沟通中自动检索引用。
          </DialogDescription>
        </DialogHeader>
        <KnowledgeForm onSuccess={closeDialog} />
      </DialogContent>
    </Dialog>
  )
}

export function KnowledgeEntryActions({ entry }: { entry: KnowledgeEntry }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const closeEdit = useCallback(() => setEditOpen(false), [])
  const [deletePending, startDeleteTransition] = useTransition()
  const [deleteError, setDeleteError] = useState("")
  const handleDelete = useCallback(
    (formData: FormData) => {
      startDeleteTransition(async () => {
        const result = await deleteKnowledgeEntry(entry.id, initialState, formData)
        if (result.success) {
          toast.success(result.message)
          setDeleteOpen(false)
          setDeleteError("")
        } else {
          setDeleteError(result.message)
        }
      })
    },
    [entry.id]
  )

  return (
    <div className="flex items-center justify-end gap-1">
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogTrigger
          render={
            <Button variant="ghost" size="icon" aria-label={`编辑问题：${entry.question}`} />
          }
        >
          <Pencil aria-hidden="true" />
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑标准话术</DialogTitle>
            <DialogDescription>修改后将立即用于后续 AI 检索。</DialogDescription>
          </DialogHeader>
          <KnowledgeForm entry={entry} onSuccess={closeEdit} />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="text-[#b42318] hover:bg-[#fff0f0] hover:text-[#b42318]"
              aria-label={`删除问题：${entry.question}`}
            />
          }
        >
          <Trash2 aria-hidden="true" />
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>删除知识条目？</DialogTitle>
            <DialogDescription>
              删除后，AI 将不再检索这条标准话术。历史引用次数也会一并移除。
            </DialogDescription>
          </DialogHeader>
          <p className="rounded-xl bg-[#f5f5f7] px-3 py-3 text-sm leading-6 text-[#424245]">
            {entry.question}
          </p>
          {deleteError && (
            <p role="alert" className="text-sm text-[#b42318]">{deleteError}</p>
          )}
          <DialogFooter>
            <form action={handleDelete}>
              <Button type="submit" variant="destructive" disabled={deletePending}>
                {deletePending && <LoaderCircle className="animate-spin" aria-hidden="true" />}
                {deletePending ? "正在删除" : "确认删除"}
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
