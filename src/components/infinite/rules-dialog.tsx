import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { INFINITE_TITLE } from "@/domain/infinite";

export function RulesDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent title={`${INFINITE_TITLE} 규칙`}>
        <DialogTitle>{INFINITE_TITLE} 규칙</DialogTitle>
        <div className="text-[13px] leading-[1.9] text-body">
          <p className="mb-4">난이도를 골라 문제를 연달아 풀어요. 맞힌 문제 수가 점수예요.</p>
          <ol className="list-decimal space-y-2 pl-[22px]">
            <li>
              난이도마다 맞혀야 하는 칸의 크기가 달라요. Easy는 2 km, Normal은 500 m, Expert와 Super
              Expert는 50 m예요. Super Expert에서는 지도 단서와 방향이 나오지 않아요.
            </li>
            <li>시간은 3분으로 시작하고, 한 판 동안 계속 이어져요.</li>
            <li>
              문제마다 번호의 앞 두 자리가 같은 칸을 처음 고르면 30초, 다음 두 자리가 같은 칸을 처음
              고르면 30초가 늘어요.
            </li>
            <li>
              문제를 맞히면 30초에 남은 기회 하나당 30초가 더 늘어요. 첫 번째에 맞히면 앞의
              보너스까지 모두 4분을 받아요.
            </li>
            <li>시간은 최대 10분까지 늘어나요.</li>
            <li>문제를 맞힌 뒤 다음 문제로 넘어가기 전까지는 시간이 멈춰요.</li>
            <li>시간이 다 되거나 한 문제를 6번 모두 틀리면 끝나요.</li>
            <li>
              중단하면 시간이 멈추고, 같은 난이도를 다시 고르면 이어져요. 포기해도 그때까지 맞힌
              문제 수는 기록돼요.
            </li>
          </ol>
        </div>
        <DialogClose render={<Button variant="primary" className="mt-5 justify-center" />}>
          닫기
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
