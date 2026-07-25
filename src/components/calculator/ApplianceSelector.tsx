import React from 'react';
import { applianceDataset } from '../../data/datasets/energy/appliances';
import { Thermometer, Plus, Trash2, Star } from 'lucide-react';

export interface ApplianceUsage {
  id: string;
  applianceId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  dailyHours: number;
}

interface ApplianceSelectorProps {
  appliances: ApplianceUsage[];
  onChange: (appliances: ApplianceUsage[]) => void;
}

export const ApplianceSelector: React.FC<ApplianceSelectorProps> = ({ appliances, onChange }) => {
  const categories = applianceDataset.appliances;
  const categoryEntries = Object.entries(categories);

  const addAppliance = (applianceId: string) => {
    const cat = categories[applianceId];
    if (!cat) return;
    const newEntry: ApplianceUsage = {
      id: `app_${Date.now()}`,
      applianceId,
      stars: 3,
      dailyHours: cat.defaultDailyHours
    };
    onChange([...appliances, newEntry]);
  };

  const removeAppliance = (id: string) => {
    onChange(appliances.filter(a => a.id !== id));
  };

  const updateAppliance = (id: string, updates: Partial<ApplianceUsage>) => {
    onChange(appliances.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  // Determine which appliance types haven't been added yet
  const addedTypes = new Set(appliances.map(a => a.applianceId));
  const availableToAdd = categoryEntries.filter(([key]) => !addedTypes.has(key));

  return (
    <div className="space-y-4 bg-gray-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl">
      <div className="flex items-center gap-3 pb-4 border-b border-white/10">
        <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400">
          <Thermometer className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Appliances</h3>
          <p className="text-xs text-gray-400">BEE Star Rating adjusts energy consumption and emission accuracy.</p>
        </div>
      </div>

      {/* Added appliances */}
      {appliances.map((app) => (
        <MemoizedApplianceRow
          key={app.id}
          app={app}
          categories={categories}
          updateAppliance={updateAppliance}
          removeAppliance={removeAppliance}
        />
      ))}

      {/* Add appliance buttons */}
      {availableToAdd.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">Add Appliance</p>
          <div className="grid grid-cols-2 gap-2">
            {availableToAdd.map(([key, cat]) => (
              <button
                key={key}
                type="button"
                onClick={() => addAppliance(key)}
                className="flex items-center gap-2 p-3 border border-dashed border-gray-700 hover:border-amber-500/50 rounded-xl text-xs text-gray-400 hover:text-amber-400 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MemoizedApplianceRow = React.memo(({
  app, categories, updateAppliance, removeAppliance
}: {
  app: ApplianceUsage,
  categories: any,
  updateAppliance: (id: string, updates: Partial<ApplianceUsage>) => void,
  removeAppliance: (id: string) => void
}) => {
  const cat = categories[app.applianceId];
  if (!cat) return null;
  const rating = cat.starRatings[app.stars];

  return (
    <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 space-y-3 group">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">{cat.name}</span>
        <button
          type="button"
          onClick={() => removeAppliance(app.id)}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          aria-label="Remove appliance"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Star Rating */}
        <div>
          <label className="block text-[11px] font-medium text-gray-400 mb-1">BEE Star Rating</label>
          <div className="flex gap-1">
            {([1, 2, 3, 4, 5] as const).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => updateAppliance(app.id, { stars: s })}
                className={`p-1.5 rounded-lg transition-all ${
                  s <= app.stars
                    ? 'text-amber-400 bg-amber-500/10'
                    : 'text-gray-600 hover:text-gray-400'
                }`}
                aria-label={`${s} star${s > 1 ? 's' : ''}`}
              >
                <Star className="w-4 h-4" fill={s <= app.stars ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
        </div>

        {/* Daily Hours */}
        <div>
          <label className="block text-[11px] font-medium text-gray-400 mb-1">Daily Usage (hours)</label>
          <input
            type="number"
            min={0.5}
            max={24}
            step={0.5}
            value={app.dailyHours}
            onChange={(e) => updateAppliance(app.id, { dailyHours: Math.max(0.5, parseFloat(e.target.value) || cat.defaultDailyHours) })}
            className="w-full bg-gray-900/80 border border-gray-600 focus:border-amber-500 rounded-lg px-3 py-2 text-white text-sm outline-none transition-all"
          />
        </div>
      </div>

      {/* Info pill */}
      {rating && (
        <div className="flex items-center justify-between bg-gray-900/50 rounded-lg px-3 py-2 text-xs">
          <span className="text-gray-400">
            {rating.powerDrawWatts}W · {rating.isInverter ? 'Inverter' : 'Non-Inverter'} · {app.stars}★
          </span>
          <span className="text-amber-400 font-medium">
            ~{Math.round((rating.powerDrawWatts * app.dailyHours / 1000) * 365 * 0.716)} kg CO₂/yr
          </span>
        </div>
      )}
    </div>
  );
});
