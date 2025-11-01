import React from 'react';
import { VistaData, SystemStatus, VistaEvent } from '../types';
import { EyeIcon, ShieldCheckIcon, ClockIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, CubeIcon } from './icons';

interface StatusPanelProps {
  vistaData: VistaData;
  systemStatus: SystemStatus;
}

const getEventIcon = (event: string) => {
    switch (event) {
        case 'object_entered': return <ArrowDownTrayIcon className="w-4 h-4 text-green-400" />;
        case 'object_left': return <ArrowUpTrayIcon className="w-4 h-4 text-red-400" />;
        case 'object_stationary': return <ClockIcon className="w-4 h-4 text-yellow-400" />;
        default: return <CubeIcon className="w-4 h-4 text-slate-400" />;
    }
}

const VistaEventRow: React.FC<{ event: VistaEvent }> = ({ event }) => (
    <div className="flex items-center space-x-3 text-xs font-mono p-2 bg-slate-900/70 rounded">
        <div className="flex-shrink-0">
            {getEventIcon(event.event)}
        </div>
        <div className="flex-1">
            <p className="text-slate-200 capitalize">
                <span className="font-semibold">{event.class.replace(/_/g, ' ')}</span>
                <span className="text-slate-400 ml-1.5">[ID:{event.object_id}]</span>
            </p>
             <p className="text-slate-400">
                {event.event.replace(/_/g, ' ')} @ {event.location_zone}
            </p>
        </div>
        {event.duration && <span className="text-yellow-400">{event.duration}</span>}
    </div>
);

const VistaDataBlock: React.FC<{ data: VistaData }> = ({ data }) => {
    const statusColor = data.status === 'Event' ? 'text-orange-400' : 'text-cyan-400';
    const threatColor = data.scene_summary.threat_level === 'None' ? 'text-green-400' : data.scene_summary.threat_level === 'Low' ? 'text-yellow-400' : 'text-red-400';

    return (
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
            <div className="flex items-center mb-3 text-cyan-400">
                <EyeIcon className="w-5 h-5" />
                <h3 className="font-mono text-sm uppercase tracking-widest ml-2">Vista Stream</h3>
            </div>
            <div className="space-y-3 text-xs font-mono">
                <div className="flex justify-between items-baseline">
                    <span className="text-slate-400">Status:</span>
                    <span className={`${statusColor} font-bold`}>{data.status}</span>
                </div>
                <div className="flex justify-between items-baseline">
                    <span className="text-slate-400">Timestamp:</span>
                    <span className="text-slate-100">{data.timestamp}</span>
                </div>
                
                <div className="pt-2 mt-2 border-t border-slate-700/50">
                    <h4 className="text-slate-300 mb-2 font-semibold">Scene Summary</h4>
                    <div className="flex justify-between items-baseline">
                        <span className="text-slate-400">Objects Detected:</span>
                        <span className="text-slate-100">{data.scene_summary.objects_detected}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <span className="text-slate-400">Threat Level:</span>
                        <span className={threatColor}>{data.scene_summary.threat_level}</span>
                    </div>
                </div>

                {data.new_events && data.new_events.length > 0 && (
                    <div className="pt-2 mt-2 border-t border-slate-700/50">
                        <h4 className="text-slate-300 mb-2 font-semibold">New Events</h4>
                        <div className="space-y-2">
                           {data.new_events.map((event, index) => <VistaEventRow key={index} event={event} />)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


const SystemDataBlock: React.FC<{ data: SystemStatus }> = ({ data }) => (
    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
        <div className="flex items-center mb-3 text-cyan-400">
            <ShieldCheckIcon className="w-5 h-5" />
            <h3 className="font-mono text-sm uppercase tracking-widest ml-2">System Core</h3>
        </div>
        <div className="space-y-1.5 text-xs font-mono">
            {Object.entries(data).map(([key, value]) => (
                <div key={key} className="flex justify-between items-baseline">
                    <span className="text-slate-400 capitalize mr-2">{key.replace(/_/g, ' ')}:</span>
                    <span className="text-slate-100 text-right truncate">{String(value)}</span>
                </div>
            ))}
        </div>
    </div>
);


const StatusPanel: React.FC<StatusPanelProps> = ({ vistaData, systemStatus }) => {
  return (
    <div className="space-y-6 flex-1 overflow-y-auto pr-2 -mr-2">
      <VistaDataBlock data={vistaData} />
      <SystemDataBlock data={systemStatus} />
    </div>
  );
};

export default StatusPanel;