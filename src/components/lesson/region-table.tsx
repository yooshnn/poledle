import { useMemo, type ReactNode } from "react";
import type { Origin } from "@/domain/projection";
import { regionCodes, type RegionCodes } from "@/lesson/region-codes";
import { REGIONS, type Region } from "@/lesson/regions";
import { DIGIT_COLORS } from "./digit-colors";
import { Table } from "./table";

const ORIGIN_NAMES: Record<Origin, string> = { middle: "중부", east: "동부" };

type Row = { region: Region; codes: RegionCodes };

// Static tables to memorise: the key places first, every Street View region folded below.
export function RegionTables() {
  // Sampling every region takes a moment, so it runs once per page.
  const rows = useMemo<Row[]>(
    () => REGIONS.map((region) => ({ region, codes: regionCodes(region) })),
    [],
  );

  return (
    <div className="grid gap-5">
      <p>
        GeoGuessr가 쓰는 Google 스트리트뷰의 한국 지원 지역이다. 원점, X·Y 블록 범위, 지역 가운데의
        앞 4자리를 적었다.
      </p>
      <div className="grid gap-2">
        <h3 className="text-[14px] font-semibold text-ink">주요 암기 지역</h3>
        <Table
          head={["지역", "원점", "X", "Y", "대표"]}
          rows={rows
            .filter(({ region }) => region.key)
            .map(({ region, codes }) => codeRow([region.name], codes))}
        />
      </div>
      <details className="group grid gap-2">
        <summary className="cursor-pointer text-[14px] font-semibold text-ink">
          전체 보기 <span className="font-normal text-muted">({rows.length}곳)</span>
        </summary>
        <div className="mt-2">
          <Table
            head={["시·도", "지역", "원점", "X", "Y", "대표", "비고"]}
            rows={rows.map(({ region, codes }, index) =>
              codeRow(
                [
                  <span key="province" className="whitespace-nowrap">
                    {rows[index - 1]?.region.province === region.province ? "" : region.province}
                  </span>,
                  region.name,
                ],
                codes,
                [region.note ?? ""],
              ),
            )}
          />
        </div>
      </details>
      <p className="text-[11px] text-muted">
        범위는 시·군을 대략 감싼 사각형으로 계산했다. 경계 근처에서는 한두 블록 차이가 날 수 있다.
        128°E에 걸친 지역은 원점마다 따로 적었다.
      </p>
    </div>
  );
}

// A table row: the given leading cells, the region's zone and ranges, then any trailing cells.
function codeRow(
  before: ReactNode[],
  { ranges, representative }: RegionCodes,
  after: ReactNode[] = [],
): ReactNode[] {
  const lines = (pick: (range: RegionCodes["ranges"][number]) => string, color?: string) => (
    <span className="grid font-mono whitespace-nowrap" style={color ? { color } : undefined}>
      {ranges.map((range) => (
        <span key={range.origin}>{pick(range)}</span>
      ))}
    </span>
  );
  return [
    ...before,
    lines((range) => ORIGIN_NAMES[range.origin]),
    lines((range) => range.x, DIGIT_COLORS.x),
    lines((range) => range.y, DIGIT_COLORS.y),
    <span key="representative" className="font-mono font-bold text-ink">
      {representative}
    </span>,
    ...after,
  ];
}
