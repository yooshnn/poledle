import type { ReactNode } from "react";

// A plain, static table for the lesson text. Wide tables scroll inside their own box.
export function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-[12px] leading-[1.6]">
        <thead>
          <tr className="border-b border-line text-[11px] text-muted">
            {head.map((label) => (
              <th key={label} scope="col" className="px-2 py-1.5 font-semibold whitespace-nowrap">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, row) => (
            // Rows are static content, fixed for the page's lifetime.
            // oxlint-disable-next-line react/no-array-index-key
            <tr key={row} className="border-b border-line-soft">
              {cells.map((cell, column) => (
                // oxlint-disable-next-line react/no-array-index-key
                <td key={column} className="px-2 py-1.5 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
