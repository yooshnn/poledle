import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Copies the spoiler-free result; falls back to a selectable text box without clipboard access.
export function ShareButton({ text }: { text: string }) {
  const [message, setMessage] = useState("");
  const [showFallback, setShowFallback] = useState(false);

  async function share() {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("결과를 복사했어요. 정답 번호와 위치는 포함되지 않아요.");
    } catch {
      setShowFallback(true);
      setMessage("공유 결과를 직접 복사해 주세요.");
    }
  }

  return (
    <>
      <Button variant="primary" className="mt-4" onClick={() => void share()}>
        결과 공유하기
        <ArrowUpRight aria-hidden="true" />
      </Button>
      {message && (
        <p role="status" className="mt-[9px] text-[11px] text-[#5e725e]">
          {message}
        </p>
      )}
      {showFallback && (
        <textarea
          readOnly
          value={text}
          aria-label="복사할 공유 결과"
          onFocus={(event) => event.target.select()}
          className="mt-3 h-[145px] w-full border border-[#cbd7c4] p-2.5"
        />
      )}
    </>
  );
}
