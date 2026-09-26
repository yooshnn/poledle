import { startAmbienceController } from "./ambience";
import { unlockAudioOnGesture } from "./engine";

export { guessEffect, playEffect, type Effect } from "./effects";

export function initSound() {
  unlockAudioOnGesture();
  startAmbienceController();
}
