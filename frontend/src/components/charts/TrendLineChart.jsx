import React, { useEffect, useRef } from 'react';
import ChartJS from '../../utils/chartConfig';

export default function TrendLineChart({ sessions = [], height = 320 }) {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !sessions || sessions.length === 0) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const labels = sessions.map(s => {
      const parts = s.date.split('-');
      return `${parts[1]}/${parts[2]}`;
    });

    const scores = sessions.map(s => s.score);
    const responseTimes = sessions.map(s => s.responseTimeSec);

    const ctx = canvasRef.current.getContext('2d');
    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Accuracy / Score (%)',
            data: scores,
            borderColor: '#2d6a4f',
            backgroundColor: 'rgba(45, 106, 79, 0.1)',
            tension: 0.3,
            borderWidth: 3,
            pointRadius: 6,
            pointBackgroundColor: '#2d6a4f',
            fill: true,
            yAxisID: 'yScore'
          },
          {
            label: 'Reaction Time (Sec)',
            data: responseTimes,
            borderColor: '#b45309',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            tension: 0.2,
            borderWidth: 2.5,
            pointRadius: 5,
            pointBackgroundColor: '#b45309',
            yAxisID: 'yTime'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        scales: {
          yScore: {
            type: 'linear',
            display: true,
            position: 'left',
            min: 40,
            max: 100,
            title: {
              display: true,
              text: 'Score (%)',
              font: { weight: 'bold', size: 12 }
            }
          },
          yTime: {
            type: 'linear',
            display: true,
            position: 'right',
            min: 0,
            max: 12,
            title: {
              display: true,
              text: 'Response Time (s)',
              font: { weight: 'bold', size: 12 }
            },
            grid: {
              drawOnChartArea: false
            }
          },
          x: {
            title: {
              display: true,
              text: 'Session Date (MM/DD)',
              font: { weight: 'bold', size: 12 }
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 16,
              font: { size: 13, weight: '600' }
            }
          },
          tooltip: {
            callbacks: {
              afterBody: function (context) {
                const idx = context[0].dataIndex;
                const actName = sessions[idx]?.activityName || 'Activity';
                const diff = sessions[idx]?.difficulty || 'Medium';
                return `Activity: ${actName}\nLevel: ${diff}`;
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [sessions]);

  if (!sessions || sessions.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        No historical sessions recorded yet. Play an activity to see performance trends!
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: `${height}px`, position: 'relative' }}>
      <canvas ref={canvasRef} aria-label="Session Performance Over Time" role="img" />
    </div>
  );
}
