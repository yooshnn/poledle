import { MapStatus } from "@/components/map/map-status";
import { useNaverMaps } from "@/components/map/use-naver-maps";
import { ZoomControls } from "@/components/map/zoom-controls";
import { NaverMap, useNaverMap } from "@/map/naver-map";
import { GridLines } from "./grid-lines";
import { LocationBadge } from "./location-badge";
import { RegionLabels } from "./region-labels";
import { useLiveMapView, useSettledMapView } from "./map-view";
import { Rulers, TIER_PX, tierCount } from "./rulers";

const FRAME = "absolute inset-0 bg-map";

// The lesson's one interactive piece: a map with the pole number grid drawn on it, rulers that
// read X along the top and Y down the left, and the code of the spot under the crosshair.
export function RulerMap() {
  const status = useNaverMaps();

  return (
    <section aria-label="번호 눈금자 지도" className="relative size-full min-h-0 overflow-hidden">
      {status === "ready" ? (
        <NaverMap
          label="번호 격자가 그려진 한국 지도. 방향키로 이동, 더하기와 빼기 키로 확대와 축소."
          options={{
            center: new naver.maps.LatLng(36.15, 127.8),
            zoom: 7,
            keyboardShortcuts: true,
          }}
          className={FRAME}
        >
          <GridLines />
          <RegionLabels />
          <Overlays />
        </NaverMap>
      ) : (
        <MapStatus status={status} className={FRAME} />
      )}
    </section>
  );
}

function Overlays() {
  const map = useNaverMap();
  const live = useLiveMapView(map);
  const settled = useSettledMapView(map);
  const rulerHeight = tierCount(live.zoom) * TIER_PX;

  return (
    <>
      <Rulers view={live} />
      <Crosshair />
      <LocationBadge live={live} settled={settled} />
      <ZoomControls className="transition-[top]" style={{ top: rulerHeight + 10 }} />
    </>
  );
}

function Crosshair() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 left-1/2 z-[1] size-7 -translate-1/2"
    >
      <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-ink shadow-[0_0_0_1px_#fffdf6]" />
      <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-ink shadow-[0_0_0_1px_#fffdf6]" />
    </div>
  );
}
