import clsx from "clsx";

export default function Table({ columns = [], rows = [], emptyMessage = "No data." }) {
  return (
    <div className="overflow-hidden rounded-xl border border-navy-700 bg-navy-800/40">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="min-w-full divide-y divide-navy-700 text-left text-sm">
          <thead className="bg-navy-900/60">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={clsx(
                    "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-700/70">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-sm text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, rowIdx) => (
                <tr
                  key={row.id ?? rowIdx}
                  className="transition-colors hover:bg-navy-800/80"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={clsx(
                        "px-4 py-3 text-slate-200",
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center",
                      )}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
