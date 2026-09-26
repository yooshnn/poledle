import { useState, type ReactNode } from "react";
import { HelpDialog } from "@/components/dialogs/help-dialog";
import { ModesDialog } from "@/components/dialogs/modes-dialog";
import { SettingsDialog } from "@/components/dialogs/settings-dialog";
import { Header, type HeaderStat } from "@/components/header/header";

type Panel = "help" | "settings" | "modes" | null;

// Header and the dialogs it opens, shared by every page.
export function PageShell({
  mode,
  stat,
  children,
}: {
  mode: string;
  stat: HeaderStat | null;
  children: ReactNode;
}) {
  const [panel, setPanel] = useState<Panel>(null);
  const closePanel = () => setPanel(null);

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
      <SettingsDialog open={panel === "settings"} onClose={closePanel} />
      <ModesDialog open={panel === "modes"} onClose={closePanel} />
    </>
  );
}
