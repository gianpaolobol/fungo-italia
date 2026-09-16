import { chatGPTSignOutPath, requireChatGPTUser } from "./chatgpt-auth";
import { ExploreClient } from "./explore-client";
import { betaAreas, betaTaxa } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await requireChatGPTUser("/");

  return (
    <ExploreClient
      areas={betaAreas}
      taxa={betaTaxa}
      user={{ displayName: user.displayName, signOutPath: chatGPTSignOutPath("/") }}
    />
  );
}

