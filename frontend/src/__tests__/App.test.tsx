import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

describe('App Component', () => {
  test('renders main navigation', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  test('contains analytics route', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    const analyticsLink = screen.getByText(/analytics/i);
    expect(analyticsLink).toBeInTheDocument();
  });
});