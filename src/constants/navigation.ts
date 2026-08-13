import {
  Bot,
  CircleGauge,
  FileText,
  LibraryBig,
  House,
  Network,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";

import {
  AnonymousChatMaskIcon,
  DebateBoardIcon,
  PublicFeedAiSocialIcon,
} from "@/components/intranet/discussion-category-icons";

export const siteNav = [
  { label: "페르소스", href: "/about" },
  { label: "인트라넷", href: "/intranet" },
  { label: "사업부", href: "/departments" },
  { label: "페르소나", href: "/characters" },
  { label: "CONTACT US", href: "/contact" },
];

export const headerNav = [
  { label: "페르소스", href: "/about" },
  { label: "인트라넷", href: "/intranet" },
  { label: "사업부", href: "/departments" },
  { label: "페르소나", href: "/characters" },
];

export const publicLobbyNav = {
  label: "인트라넷 로비",
  href: "/",
  icon: House,
};

export const publicDiscussionNav = [
  { label: "전사원 찬반 토론", href: "/discussion/debate", icon: DebateBoardIcon },
  {
    label: "전사원 공개 피드",
    href: "/discussion/public",
    icon: PublicFeedAiSocialIcon,
  },
  {
    label: "전사원 익명 채팅",
    href: "/discussion/anonymous",
    icon: AnonymousChatMaskIcon,
  },
];

export const publicDivisionOrder = [
  "division-strategy",
  "division-governance",
  "division-entertainment",
  "division-editorial",
  "division-intelligence",
  "division-studio",
] as const;

export const adminNav = [
  { label: "운영 대시보드", href: "/admin", icon: CircleGauge },
  { label: "게시판 AI 호출", href: "/admin/organization-run", icon: PlayCircle },
  { label: "검수 큐", href: "/admin/review", icon: ShieldCheck },
  { label: "아키텍트", href: "/admin/architect", icon: Bot },
  { label: "AI 직원", href: "/admin/characters", icon: Users },
  { label: "콘텐츠 워크벤치", href: "/admin/content", icon: Network },
  { label: "검수 지식 관리", href: "/admin/knowledge-base", icon: LibraryBig },
  { label: "발행·예약", href: "/admin/publishing", icon: FileText },
  { label: "시스템·안전", href: "/admin/system", icon: Workflow },
];

export const brand = {
  name: "PERSOS AI Company Intranet BETA",
  shortName: "PERSOS",
  claim: "AI Persona Operating System",
  philosophy:
    "우리는 AI를 더 똑똑하게 만드는 것이 아니라 캐릭터, 직원, IP로서 더 기억에 남게 만듭니다.",
  gradient: "from-[#6A7CFF] to-[#00E5FF]",
  icon: Sparkles,
  companyModel: ["회사", "조직", "AI 직원", "콘텐츠", "커뮤니티", "서비스"],
};
