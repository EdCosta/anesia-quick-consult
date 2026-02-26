import { useState } from "react";
import { Calculator, Pill, Activity, Weight, Stethoscope, ChevronDown } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import ETTCalculator from "@/components/anesia/ETTCalculator";

const CALCULATORS = [
  {
    id: "dose",
    icon: Pill,
    label: { fr: "Calculateur de doses", pt: "Calculador de doses", en: "Dose calculator" },
    available: true,
  },
  {
    id: "ett",
    icon: Stethoscope,
    label: {
      fr: "Calculateur ETT / Intubation",
      pt: "Calculadora ETT / Intubação",
      en: "ETT / Intubation Calculator",
    },
    available: true,
  },
  {
    id: "mallampati",
    icon: Activity,
    label: { fr: "Score de Mallampati", pt: "Score de Mallampati", en: "Mallampati score" },
    available: false,
  },
  { id: "bmi", icon: Weight, label: { fr: "IMC", pt: "IMC", en: "BMI" }, available: false },
];

export default function Calculateurs() {
  const { t, resolveStr } = useLang();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Calculator className="h-6 w-6 text-accent" />
          {t("calculateurs")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t("calculateurs_desc")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CALCULATORS.map((calc) => (
          <div key={calc.id}>
            <div
              onClick={() => calc.available && setExpanded(expanded === calc.id ? null : calc.id)}
              className={`rounded-xl border bg-card p-5 clinical-shadow transition-shadow ${
                calc.available ? "hover:clinical-shadow-md cursor-pointer border-l-4 border-l-accent" : "opacity-70"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-lg bg-accent/10 p-2">
                  <calc.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground flex-1">{resolveStr(calc.label)}</h3>
                {calc.available && (
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${expanded === calc.id ? "rotate-180" : ""}`}
                  />
                )}
              </div>
              <Badge variant={calc.available ? "default" : "secondary"} className="text-xs">
                {calc.available ? t("available") : t("coming_soon")}
              </Badge>
            </div>
            {expanded === calc.id && calc.id === "ett" && (
              <div className="mt-3 rounded-xl border bg-card p-5 clinical-shadow">
                <ETTCalculator />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
