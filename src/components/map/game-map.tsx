import { useMemo } from "react";
import { cellKey } from "@/domain/cell";
import type { DailyGame } from "@/game/use-daily-game";
import { NaverMap } from "@/map/naver-map";
import { CellMarker, CellPolygon } from "@/map/overlays";
import { AnswerLayer } from "./answer-layer";
import { GridHints } from "./grid-hints";
import { GuessMarker, type FocusRequest } from "./guess-marker";
import { MapStatus } from "./map-status";
import { SelectionLayer } from "./selection-layer";
import { useNaverMaps } from "./use-naver-maps";
import { ZoomControls } from "./zoom-controls";

const FRAME = "absolute inset-0 bg-map";
const SELECTED_STYLE = { color: "#d0793c", weight: 3, fillOpacity: 0.3 };
const SELECTION_PIN =
  '<div class="box-border grid size-7 place-items-center rounded-full border-[3px] border-white bg-[#d0793c] shadow-[0_0_0_2px_#9b5029,0_2px_8px_#26382d80]"><span class="size-1.5 rounded-full bg-white"></span></div>';

// Whole-country map: pick cells, see past guesses and hints, and the answers once finished.
export function GameMap({
  game,
  hardMode,
  focusRequest,
}: {
  game: DailyGame;
  hardMode: boolean;
  focusRequest: FocusRequest | null;
}) {
  const status = useNaverMaps();
  const done = game.status !== "playing";
  const guessCells = useMemo(() => game.guesses.map((guess) => guess.cell), [game.guesses]);

  if (status !== "ready") return <MapStatus status={status} className={FRAME} />;

  return (
    <NaverMap
      label="한국 지도. 방향키로 이동, 더하기 키로 확대, Enter로 중심 위치 선택."
      options={{ center: new naver.maps.LatLng(36.15, 127.8), zoom: 7, keyboardShortcuts: true }}
      className={FRAME}
    >
      <ZoomControls />
      <SelectionLayer onSelect={game.select} disabled={done} />
      <GridHints guesses={guessCells} hidden={hardMode || done} />
      {game.guesses.map((guess, index) => (
        <GuessMarker
          key={cellKey(guess.cell)}
          guess={guess}
          index={index}
          code={game.puzzle.code}
          hardMode={hardMode}
          focusRequest={focusRequest}
        />
      ))}
      {game.selected && !done && (
        <>
          <CellPolygon cell={game.selected} style={SELECTED_STYLE} />
          <CellMarker cell={game.selected} html={SELECTION_PIN} size={28} zIndex={200} />
        </>
      )}
      {done && <AnswerLayer cells={game.revealedAnswers} />}
    </NaverMap>
  );
}
