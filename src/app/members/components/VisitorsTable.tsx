import type { FitnessCenterVisitor } from "@/lib/api/fitnessCenterService";

interface VisitorsTableProps {
  visitors: FitnessCenterVisitor[];
  loading: boolean;
  error: string | null;
}

export function VisitorsTable({ visitors, loading, error }: VisitorsTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg
          className="animate-spin h-8 w-8 text-slate-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span className="ml-3 text-sm text-slate-500">Loading visitors...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (visitors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg
          className="h-12 w-12 text-slate-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
        <p className="mt-2 text-sm text-slate-500">No visitors found</p>
        <p className="text-xs text-slate-400">Visitors will appear here once registered</p>
      </div>
    );
  }

  return (
    <table className="min-w-full">
      <thead>
        <tr className="border-b border-slate-100 bg-slate-50/50">
          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Visitor
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Phone
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Gender
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Visit Date
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Registered
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {visitors.map((visitor) => {
          const fullName = `${visitor.first_name} ${visitor.last_name}`;
          const initials =
            `${visitor.first_name[0]}${visitor.last_name[0]}`.toUpperCase();
          const visitDate = new Date(visitor.visit_date).toLocaleDateString();
          const registeredDate = new Date(visitor.created_at).toLocaleDateString();

          return (
            <tr
              key={visitor.id}
              className="hover:bg-slate-50/50 transition-colors group"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium shadow-sm">
                    {initials}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      {fullName}
                    </div>
                    <div className="text-xs text-slate-400">
                      ID: {visitor.id}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-slate-700">
                  {visitor.phone_number}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 capitalize">
                  {visitor.gender}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-slate-600">{visitDate}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-slate-600">{registeredDate}</div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
