import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from './App';

describe('App Smoke Test', () => {
  it('renders application title', () => {
    render(<App />);
    expect(screen.getByText('Sổ Đăng Ký Lịch Nghỉ')).toBeInTheDocument();
  });
});
