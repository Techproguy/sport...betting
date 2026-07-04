'use client';

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { formatCompact } from '@/lib/utils';

const GRID = '#1f1f1f';
const AXIS = '#6B6B6B';

const tooltipStyle = {
  contentStyle: {
    background: '#151515',
    border: '1px solid #2A2A2A',
    borderRadius: 10,
    fontSize: 12,
    color: '#fff',
  },
  labelStyle: { color: '#A0A0A0', marginBottom: 4 },
  cursor: { fill: 'rgba(255,255,255,0.04)' },
};

export function AreaTrend({
  data,
  x,
  y,
  color = '#00D66F',
  height = 240,
  format,
}: {
  data: any[];
  x: string;
  y: string;
  color?: string;
  height?: number;
  format?: (v: number) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ left: -12, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${y}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey={x} stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => (format ? format(v) : formatCompact(v))} />
        <Tooltip {...tooltipStyle} formatter={(v: number) => (format ? format(v) : formatCompact(v))} />
        <Area type="monotone" dataKey={y} stroke={color} strokeWidth={2.5} fill={`url(#grad-${y})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MultiArea({ data, height = 260 }: { data: any[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ left: -12, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00D66F" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#00D66F" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="day" stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatCompact(v)} />
        <Tooltip {...tooltipStyle} formatter={(v: number) => formatCompact(v)} />
        <Area type="monotone" dataKey="deposits" stroke="#00D66F" strokeWidth={2} fill="url(#g1)" />
        <Area type="monotone" dataKey="withdrawals" stroke="#3B82F6" strokeWidth={2} fill="url(#g2)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function Bars({
  data,
  x,
  y,
  color = '#00D66F',
  height = 240,
  format,
}: {
  data: any[];
  x: string;
  y: string;
  color?: string;
  height?: number;
  format?: (v: number) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ left: -12, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey={x} stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => (format ? format(v) : formatCompact(v))} />
        <Tooltip {...tooltipStyle} formatter={(v: number) => (format ? format(v) : formatCompact(v))} />
        <Bar dataKey={y} radius={[6, 6, 0, 0]} fill={color} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Lines({ data, height = 240 }: { data: any[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ left: -12, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="month" stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatCompact(v)} />
        <Tooltip {...tooltipStyle} formatter={(v: number) => formatCompact(v)} />
        <Line type="monotone" dataKey="ggr" stroke="#00D66F" strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey="revenue" stroke="#FFC107" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function Donut({ data, height = 240 }: { data: { name: string; value: number; color: string }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="88%" paddingAngle={3} stroke="none">
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} formatter={(v: number) => formatCompact(v)} />
      </PieChart>
    </ResponsiveContainer>
  );
}
