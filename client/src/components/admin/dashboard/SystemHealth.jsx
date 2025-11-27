import React from 'react';
import { Server, Activity, Database } from 'lucide-react';
import ChartCard from '@/components/ui/ChartCard';

export default function SystemHealth({ data }) {
  const { api, database } = data || {
    api: { status: "Unknown", uptime: 0 },
    database: { status: "Unknown", latency: 0 }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    if (days > 0) return `${days}d ${hours}h`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  return (
    <ChartCard
      title="System Health"
      icon={Activity}
      className="h-full"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                    <Server className="h-4 w-4 text-green-600" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-900">API Server</p>
                    <p className="text-xs text-gray-500">Uptime: {formatUptime(api.uptime)}</p>
                </div>
            </div>
            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                {api.status}
            </span>
        </div>

        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                    <Database className="h-4 w-4 text-green-600" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-900">Database</p>
                    <p className="text-xs text-gray-500">Latency: {database.latency}ms</p>
                </div>
            </div>
            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                {database.status}
            </span>
        </div>
      </div>
    </ChartCard>
  );
}
