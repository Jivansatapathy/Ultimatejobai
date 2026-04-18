import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export function MetricCard({
  title,
  value,
  helper,
  icon,
}: {
  title: string;
  value: string | number;
  helper: string;
  icon: ReactNode;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden rounded-3xl border-border/70 bg-card/90 shadow-sm">
        <CardContent className="relative p-6">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-orange-400 to-amber-300" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">{helper}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">{icon}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
