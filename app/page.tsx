import { chatGPTSignOutPath, requireChatGPTUser } from "./chatgpt-auth";
import { ExploreClient } from "./explore-client";
import { catalogTaxa } from "@/lib/objective-catalog";
import { betaAreas } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await requireChatGPTUser("/");

  return (
    <ExploreClient
      areas={betaAreas}
      taxa={catalogTaxa}
      user={{ displayName: user.displayName, signOutPath: chatGPTSignOutPath("/") }}
    />
  );
}
