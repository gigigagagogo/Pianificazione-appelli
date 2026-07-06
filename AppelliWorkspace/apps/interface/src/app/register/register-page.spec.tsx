import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import RegisterPage from './register-page';

describe('RegisterPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
    expect(baseElement).toBeTruthy();
  });
});
