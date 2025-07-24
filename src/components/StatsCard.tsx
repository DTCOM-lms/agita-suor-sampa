import { TrendingUp, Target, Award, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  trend: "up" | "down" | "neutral";
}

const StatsCard = ({ title, value, change, icon, trend }: StatsCardProps) => {
  const getTrendColor = () => {
    switch (trend) {
      case "up": return "text-success";
      case "down": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  return (
    <Card className="card-agita touch-manipulation">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 md:px-6 pt-3 md:pt-6">
        <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground truncate pr-2">
          {title}
        </CardTitle>
        <div className="p-1.5 md:p-2 rounded-lg bg-primary/10 flex-shrink-0">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
        <div className="text-xl md:text-2xl font-bold leading-none mb-1">{value}</div>
        <div className={`text-xs flex items-center gap-1 ${getTrendColor()}`}>
          <TrendingUp className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{change}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;