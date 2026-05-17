import { Link } from "react-router-dom";
import { useI18n } from "../i18n";
import SiteHeader from "../components/SiteHeader";

export default function FeaturesPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />
      <main className="flex-1 py-12">
        <div className="container-page">
          <div className="text-xs uppercase tracking-widest text-slate-500">
            {t("features.kicker")}
          </div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            {t("features.title")}
          </h1>
          <p className="mt-4 text-slate-600 leading-relaxed max-w-3xl">
            {t("features.subtitle")}
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Item title={t("features.item1_title")} body={t("features.item1_body")} />
            <Item title={t("features.item2_title")} body={t("features.item2_body")} />
            <Item title={t("features.item3_title")} body={t("features.item3_body")} />
            <Item title={t("features.item4_title")} body={t("features.item4_body")} />
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/dashboard"
              className="btn btn-primary"
            >
              {t("features.cta_primary")}
            </Link>
            <Link
              to="/contact"
              className="btn btn-secondary"
            >
              {t("features.cta_secondary")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function Item({ title, body }) {
  return (
    <div className="card p-6">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-2 text-sm text-slate-600 leading-relaxed">{body}</div>
    </div>
  );
}
