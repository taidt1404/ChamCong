import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import StatsOverview from './StatsOverview';

describe('StatsOverview component', () => {
  it('renders positive balance (dương công) correctly', () => {
    const data = {
      quota: 4.0,
      usedDays: 2.5,
      balance: 1.5,
      status: 'positive',
      morningCount: 1,
      afternoonCount: 0,
      fullCount: 2
    };

    render(<StatsOverview balanceData={data} />);
    expect(screen.getByText('4.0 ngày')).toBeInTheDocument();
    expect(screen.getByText('2.5 ngày')).toBeInTheDocument();
    expect(screen.getByText('+1.5 CÔNG')).toBeInTheDocument();
    expect(screen.getByText(/Dương công/i)).toBeInTheDocument();
  });

  it('renders negative balance (âm công) correctly', () => {
    const data = {
      quota: 4.0,
      usedDays: 5.0,
      balance: -1.0,
      status: 'negative',
      morningCount: 0,
      afternoonCount: 0,
      fullCount: 5
    };

    render(<StatsOverview balanceData={data} />);
    expect(screen.getByText('5.0 ngày')).toBeInTheDocument();
    expect(screen.getByText('-1.0 CÔNG')).toBeInTheDocument();
    expect(screen.getByText(/Âm công/i)).toBeInTheDocument();
  });
});
