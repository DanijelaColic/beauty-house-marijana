export default function BookingWidget() {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-6 border border-border">
      <h3 className="text-xl font-semibold mb-4 text-textPrimary">Rezervirajte termin</h3>
      <p className="text-textSecondary mb-6">
        Kliknite na gumb ispod za rezervaciju termina kroz naš novi booking sustav.
      </p>
      <div className="text-center">
        <a 
          href="/rezervacije" 
          className="btn-primary inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          Rezerviraj termin
        </a>
      </div>
      <div className="mt-4 text-center">
        <p className="text-xs text-textSecondary">
          Brzo, sigurno i jednostavno rezerviranje
        </p>
      </div>
    </div>
  );
}
