import { Switch as BaseSwitch } from "@base-ui/react/switch";

// Pill toggle built on the Base UI switch.
export function Switch({
  checked,
  onCheckedChange,
  ...aria
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  "aria-describedby"?: string;
}) {
  return (
    <BaseSwitch.Root
      checked={checked}
      onCheckedChange={(next) => onCheckedChange(next)}
      className="h-[25px] w-[42px] flex-none rounded-full bg-[#c9d0c4] p-[3px] transition-colors data-checked:bg-[#3d7455]"
      {...aria}
    >
      <BaseSwitch.Thumb className="block size-[19px] rounded-full bg-white shadow-[0_1px_3px_#1b332a30] transition-[translate] data-checked:translate-x-[17px]" />
    </BaseSwitch.Root>
  );
}
