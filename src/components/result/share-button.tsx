import { useState } from "react";
import { ArrowUpRight, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { xPostUrl } from "@/domain/share";

const LINK =
  "inline-flex min-h-11 items-center gap-1.5 px-1 text-xs font-semibold text-[#55635b] transition-colors hover:text-forest md:text-[13px] [&_svg]:size-4";

// The two ways to share a spoiler-free result: a post on X with the text filled in, or the
// clipboard (falling back to a selectable text box when clipboard access is denied).
// As "buttons" they are the main actions; as "links" a quieter row under other actions.
export function ShareButtons({
  text,
  variant = "buttons",
}: {
  text: string;
  variant?: "buttons" | "links";
}) {
  const [message, setMessage] = useState("");
  const [showFallback, setShowFallback] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("결과를 복사했어요.");
    } catch {
      setShowFallback(true);
      setMessage("공유 결과를 직접 복사해 주세요.");
    }
  }

  const xUrl = xPostUrl(text);

  return (
    <>
      {variant === "links" ? (
        <div className="mt-1 flex justify-end gap-3">
          <a href={xUrl} target="_blank" rel="noreferrer" className={LINK}>
            X에 공유하기
            <ArrowUpRight aria-hidden="true" />
          </a>
          <button type="button" onClick={() => void copy()} className={LINK}>
            결과 복사하기
            <Copy aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {/* A link rather than window.open, so popup blockers leave it alone. */}
          <a
            href={xUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-md bg-forest px-[15px] py-3 text-xs font-semibold text-white transition-colors hover:bg-forest-dark md:px-[18px] md:py-3.5 [&_svg]:size-4"
          >
            X에 공유하기
            <ArrowUpRight aria-hidden="true" />
          </a>
          <Button
            variant="primary"
            onClick={() => void copy()}
            className="border border-forest bg-card text-forest hover:bg-forest-soft"
          >
            결과 복사하기
            <Copy aria-hidden="true" />
          </Button>
        </div>
      )}
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
