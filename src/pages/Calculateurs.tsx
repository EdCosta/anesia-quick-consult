import { useState } from "react";
import { Calculator, Pill, Stethoscope, Brain, Heart, Wind, Activity, ChevronDown } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import ETTCalculator from "@/components/anesia/ETTCalculator";
import DoseCalculator from "@/components/anesia/DoseCalculator";
import StopBangScore from "@/components/anesia/scores/StopBangScore";
import RCRIScore from "@/components/anesia/scores/RCRIScore";
import ApfelScore from "@/components/anesia/scores/ApfelScore";
import CapriniScore from "@/components/anesia/scores/CapriniScore";

const CALCULATORS = [
  { id: "dose", icon: Pill, label: "dose_calc_title", available: true },
  { id: "ett", icon: Stethoscope, label: "ett_calculator", available: true },
  { id: "stop_bang", icon: Brain, label: "stop_bang", available: true },
  { id: "rcri", icon: Heart, label: "rcri", available: true },
  { id: "apfel", icon: Wind, label: "apfel", available: true },
  { id: "caprini", icon: Activity, label: "caprini", available: true },
];

const COMPONENTS: Record<string, React.FC> = {
  dose: DoseCalculator,
  ett: ETTCalculator,
  stop_bang: StopBangScore,
  rcri: RCRIScore,
  apfel: ApfelScore,
  caprini: CapriniScore,
};

export default function Calculateurs() {
  const { t } = useLang();
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
        {CALCULATORS.map((calc) => {
          const Component = COMPONENTS[calc.id];
          return (
            <div key={calc.id}>
              <div
                onClick={() => setExpanded(expanded === calc.id ? null : calc.id)}
                className="rounded-xl border bg-card p-5 clinical-shadow transition-shadow hover:clinical-shadow-md cursor-pointer border-l-4 border-l-accent"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-lg bg-accent/10 p-2">
                    <calc.icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground flex-1">{t(calc.label)}</h3>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${expanded === calc.id ? "rotate-180" : ""}`}
                  />
                </div>
                <Badge variant="default" className="text-xs">
                  {t("available")}
                </Badge>
              </div>
              {expanded === calc.id && Component && (
                <div className="mt-3 rounded-xl border bg-card p-5 clinical-shadow">
                  <Component />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
