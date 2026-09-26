/// <reference types="navermaps" />
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NaverMapLink } from "@/components/map/naver-map-link";
import { regionCorner } from "@/domain/cell";
import { CODE_DIGITS, type Precision } from "@/domain/constants";
import { locationCode } from "@/domain/pole-number";
import type { GuessFeedback } from "@/game/puzzle-game";
import { cn } from "@/lib/utils";
import { cellLatLng, detach, safely, useNaverMap } from "@/map/naver-map";
import { CellPolygon } from "@/map/overlays";
import { useAddress } from "@/map/use-address";
import { ZOOM } from "./zoom";

export type FocusRequest = { index: number; version: number };

// Attempt slots ask the map to show a guess. Bumping the version re-focuses the same guess
// when its slot is clicked again.
export function useGuessFocus(): [FocusRequest | null, (index: number) => void] {
  const [request, setRequest] = useState<FocusRequest | null>(null);
  const focus = useCallback(
    (index: number) => setRequest((previous) => ({ index, version: (previous?.version ?? 0) + 1 })),
    [],
  );
  return [request, focus];
}

const PIN_CLASS =
  "box-border grid size-[30px] place-items-center rounded-full border-2 text-xs leading-none font-bold";
const MISS_PIN = `${PIN_CLASS} border-[#354b3d] bg-card text-[#354b3d] shadow-[0_0_0_2px_#fffdf0,0_3px_8px_#26382d80]`;
const HIT_PIN = `${PIN_CLASS} border-white bg-[#327761] text-white shadow-[0_0_0_2px_#23624d,0_3px_8px_#26382d80]`;

// A numbered pin for a past guess. Clicking it (or its attempt slot) opens a card with the
// guess's location code, matching characters and the direction to the nearest answer.
export function GuessMarker({
  guess,
  index,
  code,
  precision,
  showHints,
  focusRequest,
}: {
  guess: GuessFeedback;
  index: number;
  code: string;
  precision: Precision;
  showHints: boolean;
  focusRequest: FocusRequest | null;
}) {
  const map = useNaverMap();
  const [cardHost] = useState(() => document.createElement("div"));
  const popup = useRef<{ marker: naver.maps.Marker; info: naver.maps.InfoWindow } | null>(null);
  const { cell, correct, direction } = guess;
  const { origin, x, y } = cell;

  useEffect(() => {
    const { Event } = naver.maps;
    const marker = new naver.maps.Marker({
      map,
      position: cellLatLng({ origin, x, y }),
      title: `추측 ${index + 1}`,
      zIndex: 100 + index,
      icon: {
        content: `<div class="${correct ? HIT_PIN : MISS_PIN}">${index + 1}</div>`,
        size: new naver.maps.Size(30, 30),
        anchor: new naver.maps.Point(15, 15),
      },
    });
    const info = new naver.maps.InfoWindow({
      content: cardHost,
      backgroundColor: "transparent",
      borderWidth: 0,
      disableAnchor: true,
      pixelOffset: new naver.maps.Point(0, -8),
    });
    popup.current = { marker, info };

    const listeners = [
      Event.addListener(marker, "click", () =>
        info.getMap() ? info.close() : info.open(map, marker),
      ),
      Event.addListener(map, "click", () => info.close()),
    ];
    return () => {
      safely(() => Event.removeListener(listeners));
      safely(() => info.close());
      detach(marker);
      popup.current = null;
    };
  }, [map, origin, x, y, index, correct, cardHost]);

  // Attempt slots ask the map to show a specific guess.
  useEffect(() => {
    if (focusRequest?.index !== index || !popup.current) return;
    map.setCenter(cellLatLng({ origin, x, y }));
    map.setZoom(ZOOM[precision].focus, false);
    popup.current.info.open(map, popup.current.marker);
  }, [focusRequest, index, map, origin, x, y, precision]);

  // As much of the guessed cell's location code as the puzzle asks for, marking characters
  // shared with the answer.
  const guessedCode = locationCode(cell).slice(0, CODE_DIGITS[precision]);
  const characters = [...guessedCode].map((char, position) => ({
    id: `${position}`,
    char,
    matches: showHints && char === code[position],
  }));
  const address = useAddress(cell);

  return (
    <>
      <CellPolygon
        cell={regionCorner(cell, precision)}
        size={precision}
        style={{ color: correct ? "#277661" : "#787a73", weight: 2, fillOpacity: 0.12 }}
      />
      {createPortal(
        <div className="mb-3.5 w-max max-w-[250px] min-w-[190px] rounded-xl border border-[#dfe5d8] bg-card px-[15px] pt-[13px] pb-3.5 font-sans text-[#33463b] shadow-[0_8px_24px_#293a302b]">
          <div className="flex items-center justify-between text-[11px] text-[#778579]">
            <span>추측 {index + 1}</span>
            <span
              className={cn(
                "rounded-full px-[7px] py-[3px] text-[10px]",
                correct ? "bg-[#e4efe4] text-[#387155]" : "bg-[#f1e9de] text-[#986641]",
              )}
            >
              {correct ? "정답" : "오답"}
            </span>
          </div>
          <strong className="mt-2 mb-[9px] block font-mono text-lg leading-[1.2] font-semibold tracking-[1.5px] text-[#34483d]">
            {characters.map(({ id, char, matches }) => (
              <span key={id} className={cn(matches && "bg-[#e2ede4] text-[#28765c]")}>
                {char}
              </span>
            ))}
            <small className="text-[13px] text-[#a5ada1]">?</small>
          </strong>
          <div className="border-t border-[#e8ebe2] pt-2 text-[11px] leading-normal break-words text-[#68776a]">
            {address ?? "주소 조회 중…"}
          </div>
          {showHints && direction && (
            <div className="mt-2 text-[10px] text-[#778579]">
              정답은 여기서 <b className="text-xs font-semibold text-[#4a6753]">{direction}쪽</b>
            </div>
          )}
          <NaverMapLink cell={cell} className="mt-2.5 text-[11px]" />
        </div>,
        cardHost,
      )}
    </>
  );
}
