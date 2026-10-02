import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { CatalogUpdatesClient } from "./updates-client";
export const dynamic="force-dynamic";
export default async function CatalogUpdatesPage(){await requireChatGPTUser("/catalog/updates");return <CatalogUpdatesClient/>;}
