import {
  CategoryScale,
  Chart,
  Filler,
  InteractionModeMap,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
  Title,
  Tooltip
} from 'chart.js'
import { Line } from 'react-chartjs-2'

Chart.register(TimeScale, CategoryScale, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, Filler)

const formatThousands = (value) => Intl.NumberFormat('en-US', {
  maximumSignificantDigits: 4,
  notation: 'compact'
}).format(value)

export function MockGraph () {
  // Define Chart.js default settings
  Chart.defaults.font.family = '"Inter", sans-serif'
  Chart.defaults.font.weight = '500'
  Chart.defaults.color = '#005397'
  Chart.defaults.scale.grid.color = 'rgb(241, 245, 249)'

  const data = {
    labels: [
      '12-01-2020', '01-01-2021', '02-01-2021',
      '03-01-2021', '04-01-2021', '05-01-2021',
      '06-01-2021', '07-01-2021', '08-01-2021',
      '09-01-2021', '10-01-2021', '11-01-2021',
      '12-01-2021', '01-01-2022', '02-01-2022',
      '03-01-2022', '04-01-2022', '05-01-2022',
      '06-01-2022', '07-01-2022', '08-01-2022',
      '09-01-2022', '10-01-2022', '11-01-2022',
      '12-01-2022', '01-01-2023'
    ],
    datasets: [
      // Indigo line
      {
        label: 'Current',
        data: [
          5000, 8700, 7500, 12000, 11000, 9500, 10500,
          10000, 15000, 9000, 10000, 7000, 22000, 7200,
          9800, 9000, 10000, 8000, 15000, 12000, 11000,
          13000, 11000, 15000, 17000, 18000
        ],
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        borderColor: '#005397',
        borderWidth: 2,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: '#005397'
      },
      // Gray line
      {
        label: 'Previous',
        data: [
          8000, 5000, 6500, 5000, 6500, 12000, 8000,
          9000, 8000, 8000, 12500, 10000, 10000, 12000,
          11000, 16000, 12000, 10000, 10000, 14000, 9000,
          10000, 15000, 12500, 14000, 11000
        ],
        borderColor: 'rgb(203, 213, 225)',
        fill: false,
        borderWidth: 2,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: 'rgb(203, 213, 225)'
      }
    ]
  }
  // @ts-ignore
  const options = {
    layout: {
      padding: 20
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false
        },
        ticks: {
          callback: (value) => formatThousands(value)
        }
      },
      x: {
        // type: 'time',
        // time: {
        //   parser: 'MM-DD-YYYY',
        //   unit: 'month',
        //   displayFormats: {
        //     month: 'MMM YY'
        //   }
        // },
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          autoSkipPadding: 48,
          maxRotation: 0
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          title: () => null, // Disable tooltip title
          label: (context) => formatThousands(context.parsed.y)
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'nearest' as keyof InteractionModeMap
    },
    maintainAspectRatio: false
  }

  return <>
    <h2 className="mx-auto mt-8 max-w-6xl px-4 text-lg font-medium leading-6 text-gray-900 sm:px-6 lg:px-8">
      Monthly User Growth
    </h2>
    <div className="flex-grow mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <Line data={data}
        // @ts-ignore
            options={options}
            height={400} />
    </div>
  </>
}
