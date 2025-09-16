<script setup lang="ts">
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import dayjs from 'dayjs';
import * as R from 'ramda';
import { Bar, Line, Pie } from 'vue-chartjs';

import type { Questionnaire, QuestionResponse } from '~/interfaces/usage-analytics';

const { data: session } = useAuth();

const { t } = useI18n();
const OPACITY_DECIMAL = 0.5;

const colorPalette = [
    '70d6ff',
    'ff70a6',
    'ff9770',
    'ffd670',
    'e9ff70',
    'a8ed80',
    '80edce',
    '80bded',
    'c280ed',
    'ff9F9F',
];
const colorPaletteRadio = ['5bb86e', 'E9FF70', '989898', 'FF9770', 'fc3232'].reverse();

const route = useRoute();
const assetId = computed(() => route.query.assetId);

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
            ticks: {
                precision: 0,
            },
        },
    },
    interaction: {
        mode: 'index',
        intersect: false,
        axis: 'x',
    },
    plugins: {
        tooltip: {
            callbacks: {
                label: function (context: any) {
                    let label = context.dataset.label || '';

                    if (label) {
                        label += ': ';
                    }
                    label += context.formattedValue + ' responses';
                    return label;
                },
            },
        },
    },
};

const lineChartRefs = ref<any[]>([]);

const setLineChartRef = (el: any, index: number) => {
    if (el) {
        lineChartRefs.value[index] = el;
    }
};

const zoomInLineChart = (index: number) => {
    // Access the specific chart instance from the array of refs
    const chartInstance = lineChartRefs.value[index]?.chart;
    if (chartInstance) {
        chartInstance.zoom(1.1); // Zoom in by 10%
    }
};

const zoomOutLineChart = (index: number) => {
    const chartInstance = lineChartRefs.value[index]?.chart;
    if (chartInstance) {
        chartInstance.zoom(0.9); // Zoom out by 10%
    }
};

const resetLineChartZoom = (index: number) => {
    const chartInstance = lineChartRefs.value[index]?.chart;
    if (chartInstance) {
        chartInstance.resetZoom();
    }
};

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    ArcElement,
    zoomPlugin,
);

const {
    data: questionnaire,
    status: questionnaireStatus,
    error: questionnaireError,
} = await useAsyncData<Questionnaire>(`fetchQuestionnaire-asset-${assetId.value}`, () =>
    $fetch(`/api/usage-analytics/${assetId.value}`),
);

const isAuthorized = computed(() => {
    return session.value?.sub === questionnaire.value?.creatorId;
});

const { data, status, error } = useFetch<QuestionResponse[]>(`/api/usage-analytics/get-answers`, {
    query: {
        assetId: assetId.value,
    },
});

const filteredData = computed(() =>
    data.value ? data.value?.filter((response: QuestionResponse) => response.questionType !== 'Text') : [],
);

const computedChartData = computed(() =>
    filteredData.value
        ? filteredData.value.map((response: QuestionResponse) => {
              const labels = response.options;
              const label = response.questionTitle;
              const allTimeData: number[] = [];
              const chartType = response.questionType === 'Checkbox' ? 'bar' : 'pie';

              //All time data
              labels?.forEach((label: string) => {
                  allTimeData.push(
                      response.responses.reduce((acc: number, curr: { response: string; date: string }) => {
                          if (curr.response === label) {
                              acc += 1;
                          }
                          return acc;
                      }, 0),
                  );
              });

              //Timeline data
              const groupByDate = R.groupBy((response: { response: string; date: string }) => {
                  const day = dayjs(response.date).format('DD/MM/YY');
                  return day;
              });
              const groupedByDate = groupByDate(response.responses);

              const dates = Object.keys(groupedByDate);
              const datasetsByLabel: Record<string, number[]> = {};

              labels?.forEach((label: string) => {
                  const datasetData: number[] = [];
                  dates.forEach((date: string) => {
                      const responses = groupedByDate[date] as { response: string; date: string }[];
                      datasetData.push(
                          responses.reduce((acc: number, curr: { response: string; date: string }) => {
                              if (curr.response === label) {
                                  acc += 1;
                              }
                              return acc;
                          }, 0),
                      );
                  });
                  datasetsByLabel[label] = datasetData;
              });

              const datasetsForTimeline = Object.keys(datasetsByLabel).map((lineLabel: string, index: number) => {
                  const color =
                      chartType === 'bar'
                          ? `#${colorPalette[index % colorPalette.length]}`
                          : `#${colorPaletteRadio[index % colorPalette.length]}`;
                  return {
                      label: lineLabel,
                      data: datasetsByLabel[lineLabel],
                      backgroundColor: hexToRgba(color, OPACITY_DECIMAL),
                      borderColor: color,
                  };
              });

              return {
                  label,
                  allTime: {
                      chartType,
                      label,
                      labels,
                      datasets: [
                          {
                              data: allTimeData,
                              borderWidth: 3,
                              backgroundColor: allTimeData.map((_, index) =>
                                  chartType === 'bar'
                                      ? hexToRgba(colorPalette[index % colorPalette.length], OPACITY_DECIMAL)
                                      : hexToRgba(colorPaletteRadio[index % colorPalette.length], OPACITY_DECIMAL),
                              ),
                              borderColor: allTimeData.map((_, index) =>
                                  chartType === 'bar'
                                      ? `#${colorPalette[index % colorPalette.length]}`
                                      : `#${colorPaletteRadio[index % colorPalette.length]}`,
                              ),
                          },
                      ],
                  },
                  timeLine: {
                      chartType: 'line',
                      label,
                      labels: dates,
                      datasets: datasetsForTimeline,
                  },
              };
          })
        : [],
);
</script>

<template>
    <div class="items-center justify-center w-full px-8 mx-auto max-w-7xl">
        <PageContainer>
            <UProgress
                v-if="status === 'pending' || questionnaireStatus === 'pending'"
                animation="carousel"
                color="primary"
            />
            <ErrorCard v-else-if="!isAuthorized" :error-msg="$t('data.usage.notAuthorized')" />
            <ErrorCard
                v-else-if="error || questionnaireError || !data || data.length === 0"
                :error-msg="error?.statusMessage ?? t('data.usage.responsesNotFound')"
            />
            <div v-else class="w-full flex flex-col gap-4 text-gray-600">
                <SubHeading
                    :title="`${questionnaire?.title} : ${$t('data.usage.responsesFor')} ${assetId}` || ''"
                    :info="questionnaire?.description || ''"
                />
                <UCard v-for="(answer, index) in computedChartData" :key="answer" :ui="{ base: 'w-full' }">
                    <template #header>
                        <span class="font-semibold text-lg">{{ $t('data.usage.question') }}: {{ answer.label }}</span>
                    </template>
                    <div class="flex items-start flex-wrap gap-2 xl:gap-8 xl:flex-nowrap">
                        <!-- All time-->
                        <div class="w-full xl:w-[calc(50%-1rem)] h-[300px] xl:h-[350px]">
                            <span
                                class="flex justify-center w-full"
                                :class="answer.allTime.chartType === 'bar' ? 'mb-[32px]' : 'mb-[20px]'"
                                >{{ $t('data.usage.overallResponses') }}</span
                            >
                            <div v-if="answer.allTime.chartType === 'pie'">
                                <Pie
                                    :data="answer.allTime"
                                    :options="{
                                        ...chartOptions,
                                        scales: { x: { display: false }, y: { display: false } },
                                    }"
                                />
                            </div>
                            <div v-else>
                                <Bar
                                    class="w-full h-full"
                                    :data="answer.allTime"
                                    :options="{
                                        ...chartOptions,
                                        plugins: {
                                            ...chartOptions.plugins,
                                            title: {
                                                display: false,
                                            },
                                            legend: {
                                                display: false,
                                            },
                                        },
                                    }"
                                />
                            </div>
                        </div>
                        <!-- Timeline-->
                        <div class="w-full xl:w-[calc(50%-1rem)] h-[300px] pb-6 mt-12 xl:mt-0 xl:pb-0 pr-10 relative">
                            <span class="flex justify-center w-full mb-4">{{ $t('data.usage.timeline') }}</span>
                            <div class="flex gap-2 flex-col absolute top-[calc(50%-0.5rem)] right-0">
                                <UButton
                                    size="xs"
                                    variant="soft"
                                    icon="i-heroicons-magnifying-glass-plus"
                                    @click="zoomInLineChart(index)"
                                >
                                </UButton>
                                <UButton
                                    size="xs"
                                    variant="soft"
                                    icon="i-heroicons-magnifying-glass-minus"
                                    @click="zoomOutLineChart(index)"
                                >
                                </UButton>
                                <UButton
                                    size="xs"
                                    variant="soft"
                                    icon="i-heroicons-arrow-path"
                                    @click="resetLineChartZoom(index)"
                                >
                                </UButton>
                            </div>
                            <Line
                                :ref="(el) => setLineChartRef(el, index)"
                                class="w-full"
                                :data="answer.timeLine"
                                :options="{
                                    ...chartOptions,
                                    plugins: {
                                        ...chartOptions.plugins,
                                        zoom: {
                                            zoom: {
                                                wheel: {
                                                    enabled: true,
                                                },
                                                pinch: {
                                                    enabled: true,
                                                },
                                                mode: 'x',
                                            },
                                            pan: {
                                                enabled: true,
                                                mode: 'x',
                                            },
                                        },
                                    },
                                }"
                            />
                        </div>
                    </div>
                </UCard>
            </div>
        </PageContainer>
    </div>
</template>
