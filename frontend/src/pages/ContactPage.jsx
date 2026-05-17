import SiteHeader from "../components/SiteHeader";
import { useI18n } from "../i18n";

export default function ContactPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />
      <main className="flex-1 py-12">
        <div className="container-page max-w-3xl">
          <div className="text-xs uppercase tracking-widest text-slate-500">
            {t("contact.kicker")}
          </div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            {t("contact.title")}
          </h1>
          <p className="mt-4 text-slate-600 leading-relaxed">
            {t("contact.subtitle")}
          </p>

          <div className="mt-8 card p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={t("contact.field_name")} placeholder={t("contact.ph_name")} />
              <Field label={t("contact.field_org")} placeholder={t("contact.ph_org")} />
              <div className="sm:col-span-2">
                <Field label={t("contact.field_email")} placeholder={t("contact.ph_email")} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs uppercase tracking-widest text-slate-500">
                  {t("contact.field_msg")}
                </label>
                <textarea
                  className="mt-2 w-full border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-slate-500 min-h-32"
                  placeholder={t("contact.ph_msg")}
                />
              </div>
            </div>
            <button className="mt-5 btn btn-primary">
              {t("contact.submit")}
            </button>
            <div className="mt-4 text-xs text-slate-500">
              {t("contact.note")}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, placeholder }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-slate-500">{label}</label>
      <input
        className="mt-2 w-full border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-slate-500"
        placeholder={placeholder}
      />
    </div>
  );
}
