import { useState } from "react";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";

const getSeverityStyle = (severity) => {
    switch(severity) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };
const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
export default function ThreatCard({ threat, handleUpdateStatus, loading }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div key={threat.id} className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="flex items-center px-6 py-4">
        <div className={`h-16 w-2 rounded-full ${getSeverityStyle(threat.severity)} mr-4`} />
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{threat.title}</h3>
            <div className="flex items-center gap-3">
              {threat.status === 'active' ? (
                <button
                  onClick={() => handleUpdateStatus(threat.id, 'resolved')}
                  className="px-3 py-1 rounded-full text-xs bg-red-900 text-red-300 hover:bg-red-800"
                  disabled={loading}
                >
                  {threat.status}
                </button>
              ) : (
                <button
                  onClick={() => handleUpdateStatus(threat.id, 'active')}
                  className="px-3 py-1 rounded-full text-xs bg-green-900 text-green-300 hover:bg-green-800"
                  disabled={loading}
                >
                  {threat.status}
                </button>
              )}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-gray-400 hover:text-white"
              >
                {showDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
          </div>

          <p className="text-gray-400 mt-1">{threat.description}</p>
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <Clock size={14} className="mr-1" />
            <span>{formatTime(threat.detected_at)}</span>
          </div>

          {showDetails && (
            <div className="mt-3 border-t border-gray-700 pt-3 text-sm text-gray-400 space-y-1">
              <div><strong>Log Type:</strong> {threat.log_type}</div>
              <div><strong>Log ID:</strong> {threat.log_id}</div>
              <div><strong>Risk Score:</strong> {threat.risk_score}</div>
              <div><strong>Escalated:</strong> {threat.escalated ? 'Yes' : 'No'}</div>
              {threat.resolved_by && <div><strong>Resolved By:</strong> {threat.resolved_by}</div>}
              {threat.resolved_at && <div><strong>Resolved At:</strong> {formatTime(threat.resolved_at)}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
