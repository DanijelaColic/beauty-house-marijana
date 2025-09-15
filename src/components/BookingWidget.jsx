const ZOY_URL = import.meta.env.PUBLIC_ZOYYA_WIDGET_URL;

export default function BookingWidget() {
  if (!ZOY_URL) {
    return (
      <div className="card p-6">
        <p className="text-sm text-slate-600">
          <strong>Postavi PUBLIC_ZOYYA_WIDGET_URL</strong> u <code>.env</code> kako bi se prikazao widget.
        </p>
      </div>
    );
  }
  return (
    <div className="w-full card p-0 overflow-hidden">
      <iframe
        src={ZOY_URL}
        title="Zoyya — Rezervacije"
        className="w-full min-h-[720px]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allow="payment"
      />
    </div>
  );
}
