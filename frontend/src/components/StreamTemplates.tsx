import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Briefcase, Home, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface Template {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  duration: number;
  unit: 'seconds' | 'minutes' | 'hours' | 'days';
  description: string;
  color: string;
}

const templates: Record<string, Template> = {
  hourly: {
    name: 'Hourly Rate',
    icon: Zap,
    duration: 1,
    unit: 'hours',
    description: 'Perfect for freelance work',
    color: 'from-cyan-500 to-blue-500',
  },
  daily: {
    name: 'Daily Wage',
    icon: Calendar,
    duration: 1,
    unit: 'days',
    description: 'Daily payment streams',
    color: 'from-green-500 to-emerald-500',
  },
  weekly: {
    name: 'Weekly Salary',
    icon: Briefcase,
    duration: 7,
    unit: 'days',
    description: 'Standard weekly payments',
    color: 'from-purple-500 to-pink-500',
  },
  monthly: {
    name: 'Monthly Rent',
    icon: Home,
    duration: 30,
    unit: 'days',
    description: 'Monthly recurring payments',
    color: 'from-orange-500 to-red-500',
  },
  vesting: {
    name: 'Token Vesting',
    icon: TrendingUp,
    duration: 365,
    unit: 'days',
    description: 'Long-term vesting schedule',
    color: 'from-indigo-500 to-violet-500',
  },
};

interface StreamTemplatesProps {
  onSelect: (duration: number, unit: 'seconds' | 'minutes' | 'hours' | 'days') => void;
}

const StreamTemplates = ({ onSelect }: StreamTemplatesProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Quick Templates</h3>
        <p className="text-sm text-muted-foreground">
          Start with a pre-configured stream duration
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(templates).map(([key, template], index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className="glass-card p-4 cursor-pointer hover:glow-cyan transition-all group"
              onClick={() => onSelect(template.duration, template.unit)}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${template.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <template.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">{template.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {template.duration} {template.unit}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{template.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-primary/30 hover:bg-primary/10"
                >
                  Use Template
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StreamTemplates;
