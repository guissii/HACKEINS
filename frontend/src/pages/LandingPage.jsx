import { Link } from "react-router-dom";
import { useI18n } from "../i18n";
import SiteHeader from "../components/SiteHeader";

export default function LandingPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-white border-b border-slate-200">
          <img
            src="/hero.png"
            alt="ZiraIA marketing"
            className="w-full h-auto block"
          />
        </section>

        <section className="py-14 bg-white border-b border-slate-200">
          <div className="container-page grid grid-cols-12 gap-10 items-start">
            <div className="col-span-12 lg:col-span-7">
              <div className="chip">{t("landing.kicker")}</div>
              <h1 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900">
                {t("landing.title")}
              </h1>
              <p className="mt-5 text-lg text-slate-600 leading-relaxed">
                {t("landing.subtitle")}
              </p>
              <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Bullet>{t("landing.bullet1")}</Bullet>
                <Bullet>{t("landing.bullet2")}</Bullet>
                <Bullet>{t("landing.bullet3")}</Bullet>
                <Bullet>{t("landing.bullet4")}</Bullet>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/dashboard"
                  className="btn btn-primary"
                >
                  {t("landing.cta_primary")}
                </Link>
                <Link
                  to="/features"
                  className="btn btn-secondary"
                >
                  {t("landing.cta_secondary")}
                </Link>
              </div>
              <div className="mt-10 text-xs text-slate-500">
                {t("landing.trust_line")}
              </div>
            </div>
            <div className="col-span-12 lg:col-span-5">
              <div className="card p-6">
                <div className="text-xs uppercase tracking-widest text-slate-500">
                  {t("landing.outcomes_title")}
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3">
                  <Metric label={t("landing.metric1_label")} value={t("landing.metric1_value")} />
                  <Metric label={t("landing.metric2_label")} value={t("landing.metric2_value")} />
                  <Metric label={t("landing.metric3_label")} value={t("landing.metric3_value")} />
                </div>
                <div className="mt-6 border-t border-slate-200 pt-4">
                  <div className="text-xs uppercase tracking-widest text-slate-500">
                    {t("landing.includes_title")}
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2">
                    <MiniLine>{t("landing.includes1")}</MiniLine>
                    <MiniLine>{t("landing.includes2")}</MiniLine>
                    <MiniLine>{t("landing.includes3")}</MiniLine>
                  </div>
                </div>
                <div className="mt-6 border-t border-slate-200 pt-4 text-sm text-slate-600">
                  {t("landing.outcomes_note")}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14">
          <div className="container-page">
            <div className="text-xs uppercase tracking-widest text-slate-500">
              {t("landing.how_kicker")}
            </div>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              {t("landing.how_title")}
            </h2>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <StepCard title={t("landing.step1_title")} body={t("landing.step1_body")} />
              <StepCard title={t("landing.step2_title")} body={t("landing.step2_body")} />
              <StepCard title={t("landing.step3_title")} body={t("landing.step3_body")} />
            </div>
          </div>
        </section>

        <section className="py-14 bg-white border-y border-slate-200">
          <div className="container-page">
            <div className="text-xs uppercase tracking-widest text-slate-500">
              {t("landing.core_kicker")}
            </div>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              {t("landing.core_title")}
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed max-w-3xl">
              {t("landing.core_subtitle")}
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FeatureCard title={t("landing.core1_title")} body={t("landing.core1_body")} />
              <FeatureCard title={t("landing.core2_title")} body={t("landing.core2_body")} />
              <FeatureCard title={t("landing.core3_title")} body={t("landing.core3_body")} />
              <FeatureCard title={t("landing.core4_title")} body={t("landing.core4_body")} />
              <FeatureCard title={t("landing.core5_title")} body={t("landing.core5_body")} />
              <FeatureCard title={t("landing.core6_title")} body={t("landing.core6_body")} />
            </div>
          </div>
        </section>

        <section className="pb-16 pt-14">
          <div className="container-page">
            <div className="text-xs uppercase tracking-widest text-slate-500">
              {t("landing.principles_kicker")}
            </div>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              {t("landing.principles_title")}
            </h2>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <FeatureCard title={t("landing.card1_title")} body={t("landing.card1_body")} />
              <FeatureCard title={t("landing.card2_title")} body={t("landing.card2_body")} />
              <FeatureCard title={t("landing.card3_title")} body={t("landing.card3_body")} />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-slate-200 bg-white">
        <div className="container-page flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="text-sm text-slate-600">{t("footer.note")}</div>
          <div className="sm:ms-auto text-sm text-slate-600">
            <Link className="hover:text-slate-900" to="/contact">
              {t("footer.contact")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="border border-slate-200 bg-slate-50 p-4">
      <div className="text-xs uppercase tracking-widest text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{value}</div>
    </div>
  );
}

function FeatureCard({ title, body }) {
  return (
    <div className="card p-6">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-2 text-sm text-slate-600 leading-relaxed">{body}</div>
    </div>
  );
}

function StepCard({ title, body }) {
  return (
    <div className="card p-6">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-2 text-sm text-slate-600 leading-relaxed">{body}</div>
    </div>
  );
}

function Bullet({ children }) {
  return (
    <div className="flex items-start gap-3 border border-slate-200 bg-slate-50 px-4 py-3">
      <span className="mt-1 w-2 h-2 bg-ziraia-green shrink-0" />
      <div className="text-sm text-slate-700 leading-relaxed">{children}</div>
    </div>
  );
}

function MiniLine({ children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1.5 w-1.5 h-1.5 bg-slate-400 shrink-0" />
      <div className="text-sm text-slate-700 leading-relaxed">{children}</div>
    </div>
  );
}
