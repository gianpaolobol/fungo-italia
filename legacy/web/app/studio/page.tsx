import Link from "next/link";
import { requireChatGPTUser } from "../chatgpt-auth";
import { objectiveRecords } from "@/lib/objective-catalog";
import { LearningWorkspace } from "@/components/learning-workspace";
export const dynamic = "force-dynamic";
export default async function StudioPage() {
  const user = await requireChatGPTUser("/studio");
  return <main className="mx-auto min-h-screen max-w-4xl space-y-6 p-4 text-[#14261a] sm:p-6">
    <Link href="/" className="inline-flex min-h-11 items-center underline">← Torna a Fungo Italia</Link>
    <h1 className="text-3xl font-bold">Il tuo percorso di studio</h1>
    <p>Organizza studio e ripasso degli obiettivi documentati. L’avanzamento registra attività personali, non una competenza certificata né un’autorizzazione al consumo.</p>
    <LearningWorkspace key={user.userId} userId={user.userId} objectives={objectiveRecords} />
  </main>;
}
