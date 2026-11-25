/** Slowly drifting pastel colour behind the page, so the glass panels have something to blur and bend. */
export function ColorWash() {
  return (
    <div aria-hidden="true" className="color-wash pointer-events-none absolute inset-0 -z-20 overflow-hidden">
      <i /><i /><i /><i />
    </div>
  );
}
