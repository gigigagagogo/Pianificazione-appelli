import { render } from '@testing-library/react';

import AppelliPage from './appelli-page';

describe('AppelliPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AppelliPage />);
    expect(baseElement).toBeTruthy();
  });
});
