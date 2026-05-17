// A professional, data-driven crop suitability engine based on agronomic metrics.
// This is used to recommend crops based on soil and weather parameters.

const CROP_DATABASE = [
  // Cereals & Grains
  { id: "wheat", name: { en: "Wheat", ar: "القمح" }, phRange: [6.0, 7.5], tempRange: [10, 25], waterNeeds: "medium", salinityTolerance: "high", desc: { en: "High salinity tolerance • Staple", ar: "مقاوم للملوحة • محصول أساسي" } },
  { id: "barley", name: { en: "Barley", ar: "الشعير" }, phRange: [6.0, 8.0], tempRange: [12, 28], waterNeeds: "low", salinityTolerance: "very_high", desc: { en: "Excellent drought resistance", ar: "مقاومة ممتازة للجفاف" } },
  { id: "corn", name: { en: "Maize (Corn)", ar: "الذرة" }, phRange: [5.8, 7.0], tempRange: [20, 30], waterNeeds: "high", salinityTolerance: "low", desc: { en: "High yield • Sensitive to drought", ar: "عائد مرتفع • حساس للجفاف" } },
  
  // Vegetables
  { id: "carrots", name: { en: "Carrots", ar: "الجزر" }, phRange: [5.5, 6.8], tempRange: [15, 25], waterNeeds: "low", salinityTolerance: "moderate", desc: { en: "Requires loose, well-drained soil", ar: "يحتاج تربة خفيفة التصريف" } },
  { id: "onions", name: { en: "Yellow Onions", ar: "البصل الأصفر" }, phRange: [6.0, 7.0], tempRange: [13, 28], waterNeeds: "low", salinityTolerance: "moderate", desc: { en: "Good for rotation • Low water", ar: "جيد للدورة الزراعية • ماء قليل" } },
  { id: "potatoes", name: { en: "Potatoes", ar: "البطاطس" }, phRange: [5.0, 6.5], tempRange: [15, 20], waterNeeds: "high", salinityTolerance: "low", desc: { en: "Prefers acidic soil • High yield", ar: "يفضل التربة الحمضية • عائد عالي" } },
  { id: "tomatoes", name: { en: "Tomatoes", ar: "الطماطم" }, phRange: [6.0, 6.8], tempRange: [20, 30], waterNeeds: "high", salinityTolerance: "moderate", desc: { en: "High ROI • Sensitive to frost", ar: "عائد مادي عالي • حساس للصقيع" } },
  { id: "peppers", name: { en: "Bell Peppers", ar: "الفلفل" }, phRange: [6.0, 6.8], tempRange: [21, 32], waterNeeds: "high", salinityTolerance: "low", desc: { en: "Heat loving • High market value", ar: "محب للحرارة • قيمة سوقية عالية" } },
  
  // Legumes
  { id: "chickpeas", name: { en: "Chickpeas", ar: "الحمص" }, phRange: [6.0, 8.0], tempRange: [15, 25], waterNeeds: "low", salinityTolerance: "low", desc: { en: "Fixes nitrogen • Rainfed friendly", ar: "يثبت النيتروجين • زراعة بورية" } },
  { id: "alfalfa", name: { en: "Alfalfa", ar: "الفصة" }, phRange: [6.5, 7.5], tempRange: [15, 35], waterNeeds: "very_high", salinityTolerance: "high", desc: { en: "Perennial forage • Deep roots", ar: "علف معمر • جذور عميقة" } },

  // Trees & Perennials
  { id: "citrus", name: { en: "Citrus", ar: "الحوامض" }, phRange: [5.5, 6.5], tempRange: [20, 35], waterNeeds: "high", salinityTolerance: "low", desc: { en: "Long-term investment • Export", ar: "استثمار طويل • تصدير" } },
  { id: "olives", name: { en: "Olives", ar: "الزيتون" }, phRange: [6.5, 8.5], tempRange: [15, 40], waterNeeds: "low", salinityTolerance: "high", desc: { en: "Highly adaptable • Drought resistant", ar: "متأقلم جداً • مقاوم للجفاف" } },
  { id: "argan", name: { en: "Argan", ar: "الأركان" }, phRange: [7.0, 8.5], tempRange: [18, 45], waterNeeds: "very_low", salinityTolerance: "high", desc: { en: "Endemic to Morocco • Premium oil", ar: "خاص بالمغرب • زيت ممتاز" } },
  { id: "date_palm", name: { en: "Date Palm", ar: "نخيل التمر" }, phRange: [6.5, 8.5], tempRange: [25, 45], waterNeeds: "high", salinityTolerance: "very_high", desc: { en: "Extreme heat & salinity tolerance", ar: "يتحمل الحرارة والملوحة الشديدة" } }
];

/**
 * Calculates agronomic suitability score (0-100) for a given farm context.
 */
export function getAdvancedCropSuitability(farm, analysis) {
  if (!farm || !analysis) return [];

  // Extract environmental metrics (with realistic defaults if missing)
  const currentTemp = analysis.weather?.temp_max_c ?? 25;
  const soilMoisture = analysis.satellite?.soil_moisture_pct ?? 40;
  // Assume a default pH of 6.8 if not provided by satellite mock
  const soilPH = analysis.satellite?.ph_level ?? 6.8; 
  // Assume a default salinity of 2.0 dS/m
  const salinityLevel = analysis.satellite?.salinity_ds_m ?? 2.0; 
  
  return CROP_DATABASE.map(crop => {
    let score = 100;
    
    // 1. Temperature Suitability (Penalty for being outside ideal range)
    if (currentTemp > crop.tempRange[1]) {
      score -= (currentTemp - crop.tempRange[1]) * 3;
    } else if (currentTemp < crop.tempRange[0]) {
      score -= (crop.tempRange[0] - currentTemp) * 3;
    }

    // 2. Soil pH Compatibility
    if (soilPH > crop.phRange[1]) {
      score -= (soilPH - crop.phRange[1]) * 15; // pH is logarithmic, penalties are high
    } else if (soilPH < crop.phRange[0]) {
      score -= (crop.phRange[0] - soilPH) * 15;
    }

    // 3. Water Requirements vs Availability
    if (crop.waterNeeds === "very_high" && soilMoisture < 35) score -= 25;
    if (crop.waterNeeds === "high" && soilMoisture < 25) score -= 20;
    if (crop.waterNeeds === "low" && soilMoisture > 50) score -= 10; // Root rot risk
    if (crop.waterNeeds === "very_low" && soilMoisture > 40) score -= 15;
    
    // 4. Salinity Tolerance penalty
    if (salinityLevel > 3.0 && crop.salinityTolerance === "low") score -= 30;
    if (salinityLevel > 5.0 && crop.salinityTolerance === "moderate") score -= 20;

    // 5. Crop Rotation Logic: Heavily penalize planting the exact same crop
    if (farm.crop && farm.crop.toLowerCase().includes(crop.id)) {
      score -= 40; // Force rotation
    }

    // Ensure bounds
    score = Math.max(10, Math.min(99, Math.round(score)));
    
    return { ...crop, score };
  })
  .sort((a, b) => b.score - a.score)
  .slice(0, 7); // Return top 7 professional choices
}
