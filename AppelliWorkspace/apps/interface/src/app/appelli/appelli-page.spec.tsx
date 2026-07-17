import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import AppelliPage from './appelli-page';

describe('AppelliPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <MemoryRouter>
        <AppelliPage />
      </MemoryRouter>,
    );
    expect(baseElement).toBeTruthy();
  });
});
