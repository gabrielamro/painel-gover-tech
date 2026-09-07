import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Sprint } from '../../../domain/sprint/model';
import { systemColor } from '../../../domain/sprint/queries';
import { FactorySystemsDeliveryChart, type SystemSprintMetric } from '../../factory/components/FactorySystemsDeliveryChart';

type SystemRow = { name: string; count: number };
type WeekRow = { label: string; safe: number; risk: number; items: Sprint[] };
type Props = {
  systems: SystemRow[];
  systemDelivery: SystemSprintMetric[];
  weeks: WeekRow[];
  previousLabel: string;
  currentLabel: string;
  onSystemsNext: () => void;
  hasMoreSystems: boolean;
  onDrill: (title: string, items: Sprint[]) => void;
  deliveredBySystem: (name: string) => Sprint[];
};

export function ManagementCharts({ systems, systemDelivery, weeks, previousLabel, currentLabel, onSystemsNext, hasMoreSystems, onDrill, deliveredBySystem }: Props) {
  return (
    <Box className="management-charts">
      <Card component="section" elevation={0} variant="outlined" className="management-chart-card">
        <CardContent>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="subtitle2">Melhorias entregues por sistema</Typography>
              <Typography variant="caption" color="text.secondary">{previousLabel} • Aceites registrados</Typography>
            </Box>
            <Button size="small" disabled={!hasMoreSystems} onClick={onSystemsNext}>Mais sistemas</Button>
          </Stack>
          <Box className="management-chart-canvas">
            {systems.length ? (
              <ResponsiveContainer>
                <BarChart data={systems} layout="vertical" margin={{ top: 4, right: 30, bottom: 0, left: 4 }} onClick={(event) => {
                  const payload = (event as unknown as { activePayload?: Array<{ payload?: SystemRow }> }).activePayload?.[0]?.payload;
                  if (payload) onDrill(`Entregas • ${payload.name}`, deliveredBySystem(payload.name));
                }}>
                  <CartesianGrid horizontal={false} stroke="#edf1f5" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={76} interval={0} tick={{ fontSize: 10, fill: '#102a43' }} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={14}>
                    {systems.map(item => <Cell key={item.name} fill={systemColor(item.name)} />)}
                    <LabelList dataKey="count" position="right" fontSize={10} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="caption" color="text.secondary">Sem aceites registrados neste período.</Typography>
            )}
          </Box>
        </CardContent>
      </Card>
      <Card component="section" elevation={0} variant="outlined" className="management-chart-card">
        <CardContent>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="subtitle2">Previsão de entregas por semana</Typography>
              <Typography variant="caption" color="text.secondary">{currentLabel} • Compromissos atuais</Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Typography variant="caption" color="success.main">No prazo</Typography>
              <Typography variant="caption" color="warning.main">Em risco</Typography>
            </Stack>
          </Stack>
          <Box className="management-chart-canvas">
            <ResponsiveContainer>
              <BarChart data={weeks} margin={{ top: 18, right: 8, bottom: 0, left: -20 }} onClick={(event) => {
                const payload = (event as unknown as { activePayload?: Array<{ payload?: WeekRow }> }).activePayload?.[0]?.payload;
                if (payload) onDrill(`Previsão • dias ${payload.label}`, payload.items);
              }}>
                <CartesianGrid vertical={false} stroke="#edf1f5" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="safe" name="No prazo" stackId="forecast" fill="#16a34a" maxBarSize={34} />
                <Bar dataKey="risk" name="Em risco" stackId="forecast" fill="#d97706" maxBarSize={34}>
                  <LabelList dataKey={(row: WeekRow) => row.safe + row.risk} position="top" fontSize={10} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
      <Box className="management-chart-card management-systems-delivery">
        <FactorySystemsDeliveryChart metrics={systemDelivery} compact />
      </Box>
    </Box>
  );
}
