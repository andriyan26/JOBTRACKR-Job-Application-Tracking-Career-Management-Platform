import React, { useState, useMemo } from 'react';
import { BarChart2, Calendar, TrendingUp } from 'lucide-react';
import { useJob } from '../../context/JobContext';
import { parseDate, getDaysDifference } from '../../services/dateUtils';

export default function OverviewChart() {
  const { applications } = useJob();
  const [period, setPeriod] = useState('30D'); // '7D' | '30D' | '3M' | '6M' | '1Y'

  const periods = [
    { id: '7D', label: 'Last 7 Days' },
    { id: '30D', label: 'Last 30 Days' },
    { id: '3M', label: 'Last 3 Months' },
    { id: '6M', label: 'Last 6 Months' },
    { id: '1Y', label: 'This Year' }
  ];

  // Group applications into chart buckets
  const chartData = useMemo(() => {
    let daysCount = 30;
    let formatType = 'day';

    if (period === '7D') {
      daysCount = 7;
      formatType = 'day';
    } else if (period === '30D') {
      daysCount = 30;
      formatType = 'bucket-3d';
    } else if (period === '3M') {
      daysCount = 90;
      formatType = 'week';
    } else if (period === '6M') {
      daysCount = 180;
      formatType = 'month';
    } else if (period === '1Y') {
      daysCount = 365;
      formatType = 'month';
    }

    if (formatType === 'day' && period === '7D') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const result = [];
      const now = new Date();

      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const dayLabel = days[d.getDay()];

        const count = applications.filter((app) => app.application_date === dateStr).length;
        result.push({ label: dayLabel, date: dateStr, count });
      }
      return result;
    }

    if (formatType === 'bucket-3d') {
      // 6 buckets of 5 days each
      const buckets = [
        { label: 'Wk 1', count: 0 },
        { label: 'Wk 2', count: 0 },
        { label: 'Wk 3', count: 0 },
        { label: 'Wk 4', count: 0 },
        { label: 'Wk 5', count: 0 },
        { label: 'Current', count: 0 }
      ];

      applications.forEach((app) => {
        const diff = getDaysDifference(app.application_date);
        if (diff >= 0 && diff < 30) {
          const index = Math.min(Math.floor(diff / 5), 5);
          buckets[5 - index].count += 1;
        }
      });
      return buckets;
    }

    // Default monthly buckets
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const result = [];

    const numMonths = period === '3M' ? 3 : period === '6M' ? 6 : 8;
    for (let i = numMonths - 1; i >= 0; i--) {
      const mIdx = (currentMonth - i + 12) % 12;
      const label = months[mIdx];
      const count = applications.filter((app) => {
        const d = parseDate(app.application_date);
        return d && d.getMonth() === mIdx;
      }).length;
      result.push({ label, count });
    }

    return result;
  }, [applications, period]);

  const maxCount = Math.max(...chartData.map((d) => d.count), 1);
  const totalInPeriod = chartData.reduce((acc, d) => acc + d.count, 0);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Applications Over Time</h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <strong>{totalInPeriod} applications</strong> logged in selected period
          </span>
        </div>

        <div className="chart-filters">
          {periods.map((p) => (
            <button
              key={p.id}
              className={`chart-filter-btn ${period === p.id ? 'active' : ''}`}
              onClick={() => setPeriod(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-svg-container">
        {chartData.map((bar, i) => {
          const heightPercent = Math.max((bar.count / maxCount) * 85, 6);

          return (
            <div key={i} className="chart-bar-col">
              <div
                className="chart-bar-rect"
                style={{ height: `${heightPercent}%` }}
                title={`${bar.label}: ${bar.count} applications`}
              >
                {bar.count > 0 && (
                  <span className="chart-bar-tooltip">{bar.count}</span>
                )}
              </div>
              <span className="chart-bar-label">{bar.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
