// Maps raw satellite/weather numbers to farmer-meaningful labels + one-line
// interpretations. Returns bilingual strings; the UI picks the active locale.
//
// Each interpreter returns:
//   { tier, label: {en, ar}, hint: {en, ar} }
//
// `tier` is one of: excellent | good | fair | poor | critical
// Used to color the metric (green / amber / red).

export function interpretNDVI(ndvi) {
  // NDVI = (NIR - Red) / (NIR + Red). Standard agricultural ranges:
  if (ndvi == null || isNaN(ndvi)) return null;
  if (ndvi < 0.15) {
    return {
      tier: "critical",
      label: { en: "Bare soil / dead", ar: "أرض جرداء / نباتات ميتة" },
      hint: {
        en: "Almost no live vegetation. Field looks bare from space.",
        ar: "تقريباً ما كاينش نبات حي. الأرض بانت خاوية من السماء.",
      },
    };
  }
  if (ndvi < 0.3) {
    return {
      tier: "poor",
      label: { en: "Sparse / stressed", ar: "ضعيف / مجهد" },
      hint: {
        en: "Crops are stressed or just emerging. Needs attention.",
        ar: "الزرع مجهد ولا غير دابا طالع. خصو نتيقظو ليه.",
      },
    };
  }
  if (ndvi < 0.5) {
    return {
      tier: "fair",
      label: { en: "Moderate growth", ar: "نمو متوسط" },
      hint: {
        en: "Vegetation is growing but not at full vigor yet.",
        ar: "الزرع كينمى ولكن مازال ما وصلش لقوتو الكاملة.",
      },
    };
  }
  if (ndvi < 0.7) {
    return {
      tier: "good",
      label: { en: "Healthy crop", ar: "زرع صحي" },
      hint: {
        en: "Vegetation looks healthy and active. Keep current practices.",
        ar: "الزرع باين مزيان ونشيط. كمل على هاد النهج.",
      },
    };
  }
  return {
    tier: "excellent",
    label: { en: "Dense & vigorous", ar: "كثيف وقوي" },
    hint: {
      en: "Peak vegetation — your field is thriving.",
      ar: "الزرع فأوجو — الحقل ديالك راه فأحسن حالة.",
    },
  };
}

export function interpretSoilMoisture(pct, cropThreshold) {
  if (pct == null || isNaN(pct)) return null;
  const t = cropThreshold ?? 30;
  if (pct < t * 0.5) {
    return {
      tier: "critical",
      label: { en: "Very dry — urgent", ar: "ناشفة بزاف — مستعجل" },
      hint: {
        en: `Soil is far below the ${t}% target for this crop. Irrigate now.`,
        ar: `التربة بعيدة بزاف على الهدف ديال ${t}% لهاد الزرع. سقي دابا.`,
      },
    };
  }
  if (pct < t) {
    return {
      tier: "poor",
      label: { en: "Below threshold", ar: "تحت العتبة" },
      hint: {
        en: `Below the ${t}% threshold — irrigation recommended today.`,
        ar: `تحت العتبة ديال ${t}% — السقي مستحسن اليوم.`,
      },
    };
  }
  if (pct < t + 10) {
    return {
      tier: "fair",
      label: { en: "Adequate", ar: "كافية" },
      hint: {
        en: "Soil moisture is OK. Monitor over the next 24-48h.",
        ar: "رطوبة التربة لاباس بيها. راقب الوضع فال24-48 ساعة الجاية.",
      },
    };
  }
  if (pct < t + 25) {
    return {
      tier: "good",
      label: { en: "Well watered", ar: "مسقية مزيان" },
      hint: {
        en: "Moisture is comfortably above threshold. No need to irrigate.",
        ar: "الرطوبة فوق العتبة بزاف. ما خاصكش تسقي.",
      },
    };
  }
  return {
    tier: "excellent",
    label: { en: "Saturated", ar: "مشبعة بالماء" },
    hint: {
      en: "Soil is very wet — watch for drainage and root rot.",
      ar: "التربة فيها ما بزاف — رد البال للتصريف وعفونة الجذور.",
    },
  };
}

export function interpretET0(mm) {
  // ET0 = reference evapotranspiration (mm/day) — how much water the
  // atmosphere is pulling out of an ideal crop today.
  if (mm == null || isNaN(mm)) return null;
  if (mm < 2) {
    return {
      tier: "good",
      label: { en: "Low demand", ar: "طلب ضعيف" },
      hint: {
        en: "Cool & calm conditions. Plants lose little water today.",
        ar: "الجو بارد وهادي. النباتات ما كتخسرش بزاف من الماء اليوم.",
      },
    };
  }
  if (mm < 4) {
    return {
      tier: "fair",
      label: { en: "Normal demand", ar: "طلب عادي" },
      hint: {
        en: "Typical conditions. Standard water needs.",
        ar: "ظروف عادية. حاجيات الماء عادية.",
      },
    };
  }
  if (mm < 6) {
    return {
      tier: "poor",
      label: { en: "High demand", ar: "طلب عالي" },
      hint: {
        en: "Hot or windy. Crops are losing water faster than usual.",
        ar: "السخانة ولا الريح. الزرع كيخسر الماء بزرويا.",
      },
    };
  }
  return {
    tier: "critical",
    label: { en: "Very high demand", ar: "طلب مرتفع جداً" },
    hint: {
      en: "Extreme evaporation. Irrigate generously or shade if possible.",
      ar: "تبخر قوي بزاف. سقي بزاف ولا حاول تظلل الزرع إلا قدرتي.",
    },
  };
}

export function interpretTemp(min, max) {
  if (min == null) return null;
  if (min < 4) {
    return {
      tier: "critical",
      label: { en: "Hard frost risk", ar: "خطر برد قوي" },
      hint: {
        en: "Below 4°C — serious frost damage possible. Protect sensitive crops.",
        ar: "تحت 4°C — خطر برد قوي. حمي الزرع الحساس.",
      },
    };
  }
  if (min < 8) {
    return {
      tier: "poor",
      label: { en: "Frost watch", ar: "تحذير من البرد" },
      hint: {
        en: "Light frost possible overnight. Watch tender crops.",
        ar: "ممكن يطيح شوية ديال البرد فالليل. رد البال للزرع الطري.",
      },
    };
  }
  if (max > 38) {
    return {
      tier: "poor",
      label: { en: "Heat stress", ar: "إجهاد حراري" },
      hint: {
        en: "High heat — crops may wilt. Consider extra irrigation.",
        ar: "السخانة عالية — الزرع يقدر يذبل. زيد فالسقي إلا قدرتي.",
      },
    };
  }
  return {
    tier: "good",
    label: { en: "Comfortable range", ar: "حرارة مناسبة" },
    hint: {
      en: "Temperatures are in a healthy range for growth.",
      ar: "الحرارة مزيانة للنمو ديال الزرع.",
    },
  };
}

export function interpretRain(prob24h, prob48h) {
  const near = Math.max(prob24h ?? 0, prob48h ?? 0);
  if (near >= 80) {
    return {
      tier: "good",
      label: { en: "Heavy rain coming", ar: "شتا قوية جاية" },
      hint: {
        en: "Save water — skip irrigation, the sky will do it.",
        ar: "وفر الماء — ما تسقيش، السما غادي تسقي عليك.",
      },
    };
  }
  if (near >= 60) {
    return {
      tier: "fair",
      label: { en: "Likely rain", ar: "شتا محتملة" },
      hint: {
        en: "Good chance of rain — consider waiting before you irrigate.",
        ar: "كاين احتمال ديال الشتا — تسنى شوية قبل ما تسقي.",
      },
    };
  }
  if (near >= 30) {
    return {
      tier: "fair",
      label: { en: "Some chance", ar: "احتمال متوسط" },
      hint: {
        en: "Light rain possible but not enough to skip irrigation.",
        ar: "ممكن شي شتا خفيفة، ولكن ما تكفيش باش ما تسقيش.",
      },
    };
  }
  return {
    tier: "poor",
    label: { en: "Dry forecast", ar: "توقعات ناشفة" },
    hint: {
      en: "No meaningful rain expected. You'll have to water your crop.",
      ar: "ما كاينش شتا متوقعة. خاصك تسقي الزرع ديالك.",
    },
  };
}

// Tailwind color map per tier — used by KPI cards
export const TIER_TONE = {
  excellent: "good",   // → bg-green-50 border-green-200
  good: "good",
  fair: "default",     // → bg-white
  poor: "warn",        // → bg-amber-50 border-amber-200
  critical: "bad",     // → bg-red-50 border-red-200
};
