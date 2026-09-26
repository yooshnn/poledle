import { cn } from "@/lib/utils";
import type { NaverMapsStatus } from "./use-naver-maps";

const MESSAGES: Record<Exclude<NaverMapsStatus, "ready">, string> = {
  loading: "지도 불러오는 중…",
  failed: "지도를 불러오지 못했습니다. 새로고침해 주세요.",
  unauthorized: "지도 인증에 실패했습니다. 잠시 후 다시 시도해 주세요.",
};

// Placeholder shown in a map's frame until the SDK is ready.
export function MapStatus({
  status,
  className,
}: {
  status: Exclude<NaverMapsStatus, "ready">;
  className?: string;
}) {
  return (
    <div role="status" className={cn("grid place-items-center text-xs text-[#6f7c6c]", className)}>
      {MESSAGES[status]}
    </div>
  );
}
