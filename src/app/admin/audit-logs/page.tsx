import { getAuditLogs } from '@/lib/firebase/admin';
import { formatDate } from '@/lib/utils';
import { ScrollText, ShieldAlert, User } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminAuditLogsPage() {
  const logs = await getAuditLogs();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border border-[#e6e2d8] shadow-xs">
        <h2 className="text-2xl font-black text-[#0a241b] flex items-center gap-2">
          <ScrollText className="w-6 h-6 text-[#155e42]" />
          Institutional Audit Trail
        </h2>
        <p className="text-xs text-[#526359] mt-1">
          Cryptographically recorded institutional audit log tracking every contribution creation, modification, deletion, configuration update, and roster import.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#e6e2d8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e6e2d8] text-[#526359] text-xs uppercase tracking-wider bg-[#fbfaf7]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Administrator</th>
                <th className="py-3 px-4">Target Class</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f1eb]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#fbfaf7] text-xs">
                  <td className="py-3 px-4 whitespace-nowrap text-[#526359]">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#0a241b]">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 font-mono text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#526359]">
                    {log.adminUserEmail}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#155e42]">
                    {log.classId || 'Global'}
                  </td>
                  <td className="py-3 px-4">
                    <details className="cursor-pointer">
                      <summary className="text-[11px] text-[#155e42] font-semibold hover:underline">
                        View Payload
                      </summary>
                      <pre className="mt-2 p-2 rounded-lg bg-gray-900 text-emerald-400 text-[10px] overflow-x-auto max-w-md">
                        {JSON.stringify(
                          { previous: log.previousValue, new: log.newValue },
                          null,
                          2
                        )}
                      </pre>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 && (
          <div className="py-12 text-center text-xs text-[#526359]">
            No administrative actions recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
