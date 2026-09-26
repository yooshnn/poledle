import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";

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
          </ol>
        </div>
        <DialogClose render={<Button variant="primary" className="mt-5 justify-center" />}>
          게임으로 돌아가기
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
