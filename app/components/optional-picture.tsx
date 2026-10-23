export function OptionalPictureField() {
  return (
    <label className="col-span-2 block min-w-0">
      <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">
        Picture, optional
      </span>
      <input
        name="picture"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="block w-full min-w-0 text-sm text-ink"
      />
    </label>
  );
}
