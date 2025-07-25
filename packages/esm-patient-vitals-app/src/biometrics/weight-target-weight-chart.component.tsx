import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, ScaleTypes } from '@carbon/charts-react';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import { type PatientVitalsAndBiometrics } from '../common';
import styles from './biometrics-chart.scss';

interface WeightTargetWeightChartProps {
  conceptUnits: Map<string, string>;
  config: ConfigObject;
  patientBiometrics: Array<PatientVitalsAndBiometrics>;
}

const WeightTargetWeightChart: React.FC<WeightTargetWeightChartProps> = ({
  patientBiometrics,
  conceptUnits,
  config,
}) => {
  const { t } = useTranslation();
  const weightUnit = conceptUnits.get(config.concepts.weightUuid) ?? '';

  const chartData = useMemo(() => {
    return patientBiometrics
      .filter((biometrics) => biometrics.weight || biometrics.targetWeight)
      .slice(0, 10)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .flatMap((biometrics) => {
        const dateKey = formatDate(parseDate(biometrics.date), { year: true });
        const data: any[] = [];
        if (biometrics.weight !== undefined) {
          data.push({
            group: t('weight', 'Weight'),
            key: dateKey,
            value: biometrics.weight,
            date: biometrics.date,
          });
        }
        if (biometrics.targetWeight !== undefined) {
          data.push({
            group: t('targetWeight', 'Target Weight'),
            key: dateKey,
            value: biometrics.targetWeight,
            date: biometrics.date,
          });
        }
        return data;
      });
  }, [patientBiometrics, t]);

  const chartOptions = useMemo(() => {
    return {
      title: `${t('weight', 'Weight')} & ${t('targetWeight', 'Target Weight')} (${weightUnit})`,
      axes: {
        bottom: {
          title: t('date', 'Date'),
          mapsTo: 'date',
          scaleType: ScaleTypes.TIME,
        },
        left: {
          mapsTo: 'value',
          title: `${t('weight', 'Weight')} (${weightUnit})`,
          scaleType: ScaleTypes.LINEAR,
          includeZero: false,
        },
      },
      legend: {
        enabled: true,
      },
      color: {
        scale: {
          [t('weight', 'Weight')]: '#6929c4',
          [t('targetWeight', 'Target Weight')]: '#1192e8',
        },
      },
      tooltip: {
        customHTML: ([{ value, group, key }]) =>
          `<div class="cds--tooltip cds--tooltip--shown" style="min-width: max-content; font-weight:600">${value} - ${String(
            group,
          ).toUpperCase()}<span style="color: #c6c6c6; font-size: 1rem; font-weight:600">${key}</span></div>`,
      },
      toolbar: {
        enabled: true,
        numberOfIcons: 4,
        controls: [
          { type: 'Zoom in' },
          { type: 'Zoom out' },
          { type: 'Reset zoom' },
          { type: 'Export as CSV' },
          { type: 'Export as PNG' },
          { type: 'Make fullscreen' },
        ],
      },
      zoomBar: {
        top: {
          enabled: true,
        },
      },
      height: '400px',
    };
  }, [t, weightUnit]);

  return (
    <div className={styles.biometricChartContainer}>
      <LineChart data={chartData} options={chartOptions} />
    </div>
  );
};

export default WeightTargetWeightChart;
