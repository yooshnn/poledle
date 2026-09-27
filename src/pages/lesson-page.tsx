import { SplitLayout } from "@/components/layout/split-layout";
import { LessonGuide } from "@/components/lesson/lesson-guide";
import { RulerMap } from "@/components/lesson/ruler-map";
import { PageShell } from "./page-shell";

const TABS = { left: "지도", right: "문서" };

// How to read a pole number: a map with grid rulers on the left, the guide on the right.
export function LessonPage() {
  return (
    <PageShell mode="LESSON" stat={null}>
      <SplitLayout
        left={<RulerMap />}
        right={<LessonGuide />}
        separatorLabel="지도 크기 조절"
        mobileTabs={TABS}
        defaultSplit={55}
      />
    </PageShell>
  );
}
