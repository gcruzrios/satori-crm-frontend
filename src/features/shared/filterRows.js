/**
 * Client-side fallback text filter. Several list endpoints in the current API
 * (2.0.0) don't accept a `q` param, so we still send it (future-proof) and also
 * narrow the returned page here over the given fields.
 *
 * @param {any[]} rows
 * @param {string} term
 * @param {(row:any) => (string|null|undefined)[]} pick
 */
export function filterRows(rows, term, pick) {
  const q = (term ?? '').trim().toLowerCase();
  if (!q || !rows) return rows ?? [];
  return rows.filter((row) =>
    pick(row)
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q)),
  );
}
