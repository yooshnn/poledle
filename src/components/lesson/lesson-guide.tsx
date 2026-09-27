import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SQUARE_LETTER_ROWS } from "@/domain/constants";
import { Link } from "@/lib/router";
import { DIGIT_COLORS } from "./digit-colors";
import { PoleCode } from "./pole-code";
import { RegionTables } from "./region-table";
import { Table } from "./table";

// The lesson text: how a pole number is built and how to narrow it down to a place, then the
// table of Street View regions to memorise.
export function LessonGuide() {
  return (
    <article className="min-h-0 overflow-y-auto bg-paper">
      <div className="mx-auto grid max-w-[640px] gap-11 px-5 py-8 text-[13px] leading-[1.9] text-body md:px-9 md:py-10">
        <header className="grid gap-2">
          <Eyebrow>LESSON</Eyebrow>
          <h1 className="text-[26px] leading-[1.3] font-semibold tracking-[-1px] text-ink-strong">
            번호 읽는 법
          </h1>
          <p>
            전봇대 표찰의 전산화번호만 보고 위치를 짐작하는 법을 익혀요. 지도를 움직이면 위와 왼쪽
            눈금자에 번호가 나오고, 가운데 배지에 지금 위치의 번호가 떠요. 글을 읽으면서 지도에서
            직접 확인해 보세요.
          </p>
        </header>

        <Section number={1} title="번호 해부">
          <p>
            <PoleCode code="0311Z961" />은 자리마다 뜻이 있어요. 지도의 배지도 같은 색으로 칠해져요.
          </p>
          <Table
            head={["자리", "예", "뜻"]}
            rows={[
              [
                <Part key="x" part="x" text="1–2" />,
                <Code key="c" color="x" text="03" />,
                "2 km 블록 X (동쪽으로 커짐)",
              ],
              [
                <Part key="y" part="y" text="3–4" />,
                <Code key="c" color="y" text="11" />,
                "2 km 블록 Y (북쪽으로 커짐)",
              ],
              [
                <Part key="l" part="letter" text="5" />,
                <Code key="c" color="letter" text="Z" />,
                "블록 안 500 m 칸 (4×4 알파벳)",
              ],
              [
                <Part key="c" part="cell" text="6–7" />,
                <Code key="c" color="cell" text="96" />,
                "500 m 칸 안 50 m 칸 (X, Y)",
              ],
              [
                <Part key="p" part="pole" text="8" />,
                <Code key="c" color="pole" text="1" />,
                "같은 50 m 칸 안 전주 순번 (위치와 무관)",
              ],
            ]}
          />
          <Callout>앞 4자리가 동네, 5번째가 블록 안 위치, 6·7번째가 골목, 8번째는 무시.</Callout>
          <p className="text-[12px] text-muted">
            5번째 자리가 숫자(1–4)인 번호는 100 m 체계예요. 이 강의와 게임에서는 다루지 않아요.
          </p>
        </Section>

        <Section number={2} title="X·Y 기준선">
          <p>
            <Strong color="x">X</Strong>는 2 km마다 1씩 동쪽으로 커져요. 경도 1°가 약 45블록이에요.
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              경도 <b>128°E</b>를 기준으로 서쪽은 <b>중부원점</b>, 동쪽은 <b>동부원점</b>을 써요.
              지도의 점선이 그 경계예요.
            </li>
            <li>
              중부원점은 <b>127.0°E</b>가 X <Code color="x" text="00" />
              이에요. 서쪽으로 가면 99, 98…로 내려가요. 서울 도심은 99~00, 인천은 80대 후반, 목포는
              70대 초반이에요.
            </li>
            <li>
              동부원점은 <b>129.0°E</b>가 X <Code color="x" text="00" />
              이에요. 대구는 80대, 부산은 00 전후, 울산·포항은 10대예요.
            </li>
            <li>
              128°E에서 X가 약 45에서 약 55로 건너뛰어요. 45~55 사이 X는 태안·신안 같은 서해 끝을
              빼면 거의 나오지 않아요.
            </li>
          </ul>
          <p>
            <Strong color="y">Y</Strong>는 2 km마다 1씩 북쪽으로 커져요. 위도 1°가 약 55블록이고,
            200 km(위도 약 1.8°)마다 <Code color="y" text="00" />이 돌아와서 <b>00 선이 세 개</b>
            있어요.
          </p>
          <Table
            head={["Y 00 선", "지나는 곳", "주변 도시의 Y"]}
            rows={[
              ["37.1°N", "오산·용인 남부", "서울 도심 26, 춘천 43, 속초 60"],
              ["35.3°N", "담양·곡성 ~ 양산", "대전 58, 전주 29, 대구 28, 울산 14"],
              ["33.5°N", "제주시 해안", "제주시 00, 서귀포 86, 광주 93, 부산 94"],
            ]}
          />
          <p>
            그래서 Y 90대는 &ldquo;00 선 바로 남쪽&rdquo;이에요. 경기 남부, 광주·부산, 서귀포 중
            하나로 보면 돼요.
          </p>
          <Callout>10블록 = 20 km, 50블록 = 100 km.</Callout>
          <p className="text-[12px] text-muted">
            지도를 전국이 보이게 줄여서 굵은 00 선 다섯 개(X 둘, Y 셋)를 확인해 보세요.
          </p>
        </Section>

        <Section number={3} title="200 km마다 반복된다">
          <p>
            블록 번호가 두 자리라서 100블록(200 km)마다 같은 번호가 되풀이돼요. 그래서{" "}
            <b>한 번호에 후보가 여러 곳</b> 있고, 게임도 그 후보를 전부 정답으로 인정해요.
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <b>Y 반복</b>: 같은 경도에서 200 km 위아래가 같은 번호예요. <PoleCode code="0529" />는
              서울 동북부(중랑·구리)이면서 전주예요.
            </li>
            <li>
              <b>원점 반복</b>: 중부원점과 동부원점이 같은 숫자를 써요. <PoleCode code="0529" />를
              동부원점으로 읽으면 경주 서부(건천 부근)예요.
            </li>
          </ul>
          <p>
            그래서 <PoleCode code="0529" />의 후보는 세 곳이에요. 대도시 아파트, 호남 평야, 경북
            산지 같은 풍경으로 골라요.
          </p>
          <Callout>&ldquo;서울 번호 = 전주 번호&rdquo; 한 쌍만 기억해도 반복이 잡혀요.</Callout>
          <p>
            자주 헷갈리는 쌍: 서울 ↔ 전주, 서울 ↔ 강릉·경주, 대전 ↔ 철원·포천 북부 ↔ 고흥, 광주 ↔
            부산, 창원 ↔ 제주시.
          </p>
        </Section>

        <Section number={4} title="블록 안 위치">
          <p>
            2 km 블록은 <Strong color="letter">500 m 칸 16개</Strong>로 나뉘고, 칸마다 알파벳이
            붙어요.
          </p>
          <LetterGrid />
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <b>4분면마다 알파벳 2×2가 읽는 순서대로</b> 들어 있어요. 위 절반은 A–H, 아래 절반은
              P–Z예요.
            </li>
            <li>
              <Code color="letter" text="A" />는 북서쪽 끝, <Code color="letter" text="Z" />는
              남동쪽 끝, <Code color="letter" text="D" /> <Code color="letter" text="G" />{" "}
              <Code color="letter" text="Q" /> <Code color="letter" text="W" />는 가운데 네
              칸이에요.
            </li>
          </ul>
          <p>
            500 m 칸은 다시 <Strong color="cell">10×10</Strong>으로 나뉘어요. 6번째 자리는 서→동
            (0–9), 7번째 자리는 남→북(0–9)이고 원점은 남서쪽 모서리예요.{" "}
            <Code color="cell" text="96" />
            이면 동쪽 끝, 북쪽에서 네 번째 줄쯤이에요.
          </p>
          <p className="text-[12px] text-muted">
            지도를 15단계 이상 확대하면 눈금자에 알파벳이, 18단계 이상이면 0–9 자리가 나와요.
          </p>
        </Section>

        <Section number={5} title="추론 순서">
          <ol className="list-decimal space-y-1.5 pl-5">
            <li>
              <b>Y로 위도 띠를 잡는다.</b> 00 선 세 개 중 어디에 가까운지 봐요.
            </li>
            <li>
              <b>X로 경도와 원점을 잡는다.</b> 00 근처면 127°E나 129°E예요.
            </li>
            <li>
              <b>후보 2~3곳을 떠올리고 풍경으로 고른다.</b>
            </li>
            <li>
              <b>알파벳으로 500 m</b>, <b>두 자리로 50 m</b>를 찍는다.
            </li>
          </ol>
          <div className="grid gap-3">
            <Example code="0529H">
              Y 29는 35.3°N 선에서 북쪽으로 약 60 km, 또는 37.1°N 선에서 북쪽으로 약 60 km예요. X
              05는 127°E나 129°E에서 동쪽으로 약 10 km예요. 후보는 서울 동북부, 전주, 경주 서부예요.
              H는 블록 안에서 동쪽 끝, 위에서 두 번째 줄이에요.
            </Example>
            <Example code="0392S">
              Y 92는 00 선 바로 남쪽이고, X 03은 127°E나 129°E 바로 동쪽이에요. 129°E 쪽이면
              부산(35.1°N), 127°E 쪽이면 평택(37.0°N)이에요. S는 블록 안에서 맨 아랫줄, 서쪽에서 두
              번째 칸이에요.
            </Example>
            <Example code="7700X">
              Y 00은 00 선 바로 위, X 77은 00에서 서쪽으로 약 45 km예요. 중부원점이면 제주시나 영광,
              동부원점이면 영월 남쪽이나 함안이에요.
            </Example>
          </div>
          <p>
            다 읽었다면{" "}
            <Link to="/infinite" className="font-semibold text-forest underline">
              어디까지 전봇들 챌린지
            </Link>
            에서 Easy(2 km 블록 맞히기)로 연습해 보세요.
          </p>
        </Section>

        <Section number={null} title="부록 · 지역 번호표">
          <RegionTables />
        </Section>
      </div>
    </article>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: number | null;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-3.5">
      <h2 className="flex items-baseline gap-2.5 text-[19px] leading-[1.35] font-semibold tracking-[-0.5px] text-ink-strong">
        {number !== null && (
          <span className="font-mono text-[13px] font-bold text-faint">
            {String(number).padStart(2, "0")}
          </span>
        )}
        {title}
      </h2>
      {children}
    </section>
  );
}

type Part = keyof typeof DIGIT_COLORS;

function Code({ color, text }: { color: Part; text: string }) {
  return (
    <code
      className="rounded bg-card px-1 py-px font-mono text-[0.95em] font-bold tracking-[1px] ring-1 ring-line-soft"
      style={{ color: DIGIT_COLORS[color] }}
    >
      {text}
    </code>
  );
}

function Strong({ color, children }: { color: Part; children: ReactNode }) {
  return (
    <b className="font-bold" style={{ color: DIGIT_COLORS[color] }}>
      {children}
    </b>
  );
}

function Part({ part, text }: { part: Part; text: string }) {
  return (
    <span className="font-mono font-bold" style={{ color: DIGIT_COLORS[part] }}>
      {text}
    </span>
  );
}

function Callout({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border-l-[3px] border-forest bg-forest-soft px-3.5 py-2 font-semibold text-ink">
      {children}
    </p>
  );
}

function LetterGrid() {
  return (
    <div
      aria-label="500 m 칸 알파벳 배치. 위에서부터 ABEF, CDGH, PQWX, RSYZ"
      role="img"
      className="grid w-fit grid-cols-4 overflow-hidden rounded-md border-2 border-[#3b669066] font-mono text-[15px] font-bold"
      style={{ color: DIGIT_COLORS.letter }}
    >
      {SQUARE_LETTER_ROWS.flatMap((row, rowIndex) =>
        [...row].map((letter, column) => (
          <span
            key={letter}
            className={[
              "grid size-10 place-items-center bg-card",
              column === 1 ? "border-r-2 border-[#3b669066]" : "border-r border-line-soft",
              rowIndex === 1 ? "border-b-2 border-b-[#3b669066]" : "border-b border-line-soft",
            ].join(" ")}
          >
            {letter}
          </span>
        )),
      )}
    </div>
  );
}

function Example({ code, children }: { code: string; children: ReactNode }) {
  return (
    <div className="grid justify-items-start gap-1 rounded-md border border-line-soft bg-card px-3.5 py-2.5">
      <PoleCode code={code} />
      <p className="text-[12px] leading-[1.8]">{children}</p>
    </div>
  );
}
