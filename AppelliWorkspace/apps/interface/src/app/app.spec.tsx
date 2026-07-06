import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import App from './app';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<BrowserRouter><App /></BrowserRouter>);
    expect(baseElement).toBeTruthy();
  });

  it('should show the login page at the root route', () => {
    const { getAllByText } = render(<BrowserRouter><App /></BrowserRouter>);
    expect(getAllByText(new RegExp('Accedi', 'gi')).length > 0).toBeTruthy();
  });
});
