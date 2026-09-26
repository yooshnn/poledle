import { useState, type ReactNode } from "react";
import { HelpDialog } from "@/components/dialogs/help-dialog";
import { ModesDialog } from "@/components/dialogs/modes-dialog";
import { SettingsDialog } from "@/components/dialogs/settings-dialog";
import { Header, type HeaderStat } from "@/components/header/header";
import { useHardMode } from "@/game/use-hard-mode";

type Panel = "help" | "settings" | "modes" | null;

// Header and the dialogs it opens, shared by every page.
export function PageShell({
  mode,
  stat,
  children,
}: {
  mode: string;
  stat: HeaderStat;
  children: ReactNode;
}) {
  const [panel, setPanel] = useState<Panel>(null);
  const closePanel = () => setPanel(null);
  const [hardMode, setHardMode] = useHardMode();

  return (
    <>
      <Header
        mode={mode}
        stat={stat}
        onOpenHelp={() => setPanel("help")}
        onOpenSettings={() => setPanel("settings")}
        onOpenModes={() => setPanel("modes")}
      />
      {children}
      <HelpDialog open={panel === "help"} onClose={closePanel} />
      <SettingsDialog
        open={panel === "settings"}
        onClose={closePanel}
        hardMode={hardMode}
        onHardModeChange={setHardMode}
      />
      <ModesDialog open={panel === "modes"} onClose={closePanel} />
    </>
  );
}
