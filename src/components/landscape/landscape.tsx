import { useEffect, useRef, useState } from "react";

// Decorative 3D scene of a utility pole showing today's number. It never hints at the answer.
// Three.js is loaded lazily and skipped on mobile, where the pane is hidden.
export function Landscape({ code }: { code: string }) {
  const host = useRef<HTMLElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mobile = matchMedia("(max-width: 760px)");
    let generation = 0;
    let unmount: (() => void) | undefined;

    const update = () => {
      const current = ++generation;
      unmount?.();
      unmount = undefined;
      if (mobile.matches) return;
      import("@/scene/landscape")
        .then(({ mountLandscape }) => {
          if (current !== generation || !host.current) return;
          unmount = mountLandscape(host.current, code);
          setFailed(false);
        })
        .catch(() => {
          if (current === generation) setFailed(true);
        });
    };

    update();
    mobile.addEventListener("change", update);
    return () => {
      generation++;
      mobile.removeEventListener("change", update);
      unmount?.();
    };
  }, [code]);

  return (
    <section
      ref={host}
      aria-label="정답 위치와 무관한 전봇대 풍경"
      className="relative h-full overflow-hidden bg-linear-to-b from-[#c9d9d5] to-[#a6b38e] [&_canvas]:absolute [&_canvas]:inset-0 [&_canvas]:size-full"
    >
      {/* Shown only when WebGL is unavailable. */}
      {failed && (
        <div className="absolute top-[45%] left-[40%] border-[5px] bg-[#f2efdf] p-3 font-mono text-[32px] text-[#244659]">
          {code.slice(0, 4)}
          <br />
          {code.slice(4)}
        </div>
      )}
    </section>
  );
}
