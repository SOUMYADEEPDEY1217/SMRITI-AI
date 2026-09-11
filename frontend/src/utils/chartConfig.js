// Chart.js Registration and Global Configuration
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  RadarController,
  LineController,
  BarController
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  RadarController,
  LineController,
  BarController
);

// High legibility font defaults for elderly-friendly visualization
ChartJS.defaults.font.family = "'Outfit', 'Plus Jakarta Sans', sans-serif";
ChartJS.defaults.font.size = 14;
ChartJS.defaults.color = '#2d3748';

export default ChartJS;
