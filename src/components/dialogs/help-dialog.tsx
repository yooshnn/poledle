import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { INFINITE_TITLE } from "@/domain/infinite";
import { Link } from "@/lib/router";

export function HelpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent title="게임 방법">
        <DialogTitle>게임 방법</DialogTitle>
        <div className="text-[13px] leading-[1.9] text-body">
          <p className="mb-4">전주 전산화번호를 단서로 지도에서 전봇대의 위치를 찾아보세요.</p>
          <ol className="list-decimal space-y-2 pl-[22px]">
            <li>지도를 확대해 위치를 고른 뒤 제출하세요.</li>
            <li>
              틀릴 때마다 지도에 번호 단서가 더 나타납니다. 어려운 모드를 켜면 단서가 가려져요.
            </li>
            <li>
              상단의 X를 누르면 지난 추측을 다시 볼 수 있어요. 정답 방향과 같은 자리의 글자도
              보여줍니다.
            </li>
            <li>
              {INFINITE_TITLE}에서는 난이도를 골라 문제를 연달아 풀어요. 3분으로 시작하고, 번호의 앞
              두 자리나 다음 두 자리를 처음 맞히거나 문제를 맞히면 시간이 늘어나요(최대 10분).
              시간이 다 되거나 한 문제를 6번 모두 틀리면 끝나요. 중단하면 시간이 멈추고, 같은
              난이도를 다시 고르면 이어져요.
            </li>
            <li>
              번호 읽는 법이 궁금하다면{" "}
              <Link to="/lesson" onClick={onClose} className="font-semibold text-forest underline">
                Lesson
              </Link>
              에서 지도와 함께 익혀 보세요.
            </li>
          </ol>
        </div>
        <DialogClose render={<Button variant="primary" className="mt-5 justify-center" />}>
          게임으로 돌아가기
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
