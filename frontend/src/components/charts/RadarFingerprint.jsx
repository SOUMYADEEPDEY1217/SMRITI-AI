import React, { useEffect, useRef } from 'react';
import ChartJS from '../../utils/chartConfig';

export default function RadarFingerprint({ domainData, title = "Cognitive Fingerprint Radar", height = 360 }) {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const labels = [
      'Visual Memory',
      'Auditory Recall',
      'Face Recognition',
      'Orientation',
      'Sequential Path',
      'Cultural Semantic',
      'Delayed Recall',
      'Pattern Matching'
    ];

    const dataValues = [
      domainData?.visualMemory ?? 80,
      domainData?.auditoryMemory ?? 75,
      domainData?.faceRecognition ?? 90,
      domainData?.temporalOrientation ?? 85,
      domainData?.sequentialMemory ?? 70,
      domainData?.semanticKnowledge ?? 88,
      domainData?.delayedRecall ?? 68,
      domainData?.patternMatching ?? 82
    ];

    const ctx = canvasRef.current.getContext('2d');
    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Cognitive Domain Score (%)',
            data: dataValues,
            backgroundColor: 'rgba(45, 106, 79, 0.25)',
            borderColor: '#2d6a4f',
            borderWidth: 3,
            pointBackgroundColor: '#1b4332',
            pointBorderColor: '#ffffff',
            pointHoverBackgroundColor: '#ffffff',
            pointHoverBorderColor: '#1b4332',
            pointRadius: 5,
            pointHoverRadius: 8
          },
          {
            label: 'Reference Healthy Baseline (70%)',
            data: [70, 70, 70, 70, 70, 70, 70, 70],
            borderColor: 'rgba(180, 83, 9, 0.5)',
            borderWidth: 1.5,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: {
              color: 'rgba(0, 0, 0, 0.12)'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.08)'
            },
            suggestedMin: 30,
            suggestedMax: 100,
            pointLabels: {
              font: {
                size: 13,
                weight: '700'
              },
              color: '#1e293b'
            },
            ticks: {
              backdropColor: 'transparent',
              stepSize: 20,
              font: {
                size: 11
              }
            }
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 16,
              font: {
                size: 13,
                weight: '600'
              },
              padding: 15
            }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `${context.dataset.label}: ${context.raw}%`;
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
  }, [domainData]);

  return (
    <div style={{ width: '100%', height: `${height}px`, position: 'relative' }}>
      <canvas ref={canvasRef} aria-label={title} role="img" />
    </div>
  );
}
