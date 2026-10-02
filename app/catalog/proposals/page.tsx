import { requireChatGPTUser } from "@/app/chatgpt-auth";
import {ProposalHistory} from "./proposal-history";
export const dynamic="force-dynamic";
export default async function ProposalsPage(){await requireChatGPTUser("/catalog/proposals");return <ProposalHistory/>;}
