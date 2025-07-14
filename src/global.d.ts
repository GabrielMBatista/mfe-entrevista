// global.d.ts (ou src/global.d.ts)
import * as React from 'react';
import type { JSX as StencilJSX } from '@gabrielmbatista/ui-library-stencil/dist/types/components';

declare global {
  namespace JSX {
    // Mapeia todos os seus componentes, adicionando children tipado
    type FixChildren<T> = {
      [K in keyof T]: T[K] & { children?: React.ReactNode };
    };
    interface IntrinsicElements extends FixChildren<StencilJSX.IntrinsicElements> {
      'ui-navbar': WithSlot<StencilJSX.IntrinsicElements['ui-navbar']>;
      // fallback para outros custom elements não tipados, se necessário
      [elemName: string]: React.ReactNode;
    }
  }
}
