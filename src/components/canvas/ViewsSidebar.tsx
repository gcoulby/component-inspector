export function ViewsSidebar() {
  return (
    <aside className="flex w-40 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex items-center justify-between px-2 py-2 text-xs font-medium text-muted-foreground">
        Views
      </div>
      <div className="flex flex-1 items-center justify-center px-2 text-center text-xs text-muted-foreground">
        No views yet
      </div>
    </aside>
  )
}
