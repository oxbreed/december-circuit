export function AdminSearchForm({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form action="/admin" method="get" className="min-w-0">
      <input type="hidden" name="section" value="search" />
      <label className="block min-w-0">
        <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">
          Search the panel
        </span>
        <input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder="Events, places, submissions"
          className="ledger-input min-w-[14rem]"
        />
      </label>
    </form>
  );
}
