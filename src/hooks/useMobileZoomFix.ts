"use client";

import { useEffect } from 'react';

export function useMobileZoomFix() {
  useEffect(() => {
    // 🆕 Função para prevenir zoom no focus
    const preventZoomOnFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        // Adiciona atributos que previnem zoom
        target.setAttribute('style', 'font-size: 16px !important; max-height: none !important;');
        target.setAttribute('maxlength', '1000');
      }
    };

    // 🆕 Função para restaurar após blur
    const restoreAfterBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        setTimeout(() => {
          target.removeAttribute('style');
        }, 100);
      }
    };

    // 🆕 Adiciona event listeners
    document.addEventListener('focusin', preventZoomOnFocus);
    document.addEventListener('focusout', restoreAfterBlur);

    // 🆕 Meta tag para iOS - atualiza dinamicamente
    const updateViewportMeta = () => {
      let viewportMeta = document.querySelector('meta[name="viewport"]');
      
      if (!viewportMeta) {
        // Cria meta tag se não existir
        viewportMeta = document.createElement('meta');
        viewportMeta.setAttribute('name', 'viewport');
        document.head.appendChild(viewportMeta);
      }
      
      // Configurações para prevenir zoom
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        viewportMeta.setAttribute('content', 
          'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, shrink-to-fit=no'
        );
      } else {
        viewportMeta.setAttribute('content', 
          'width=device-width, initial-scale=1'
        );
      }
    };

    // Atualiza viewport
    updateViewportMeta();
    
    // 🆕 Também atualiza quando a orientação mudar
    window.addEventListener('orientationchange', updateViewportMeta);
    window.addEventListener('resize', updateViewportMeta);

    // 🆕 Função para detectar iOS
    const isIOS = () => {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    };

    // 🆕 Para iOS, adiciona styles específicos
    if (isIOS()) {
      const style = document.createElement('style');
      style.textContent = `
        input, textarea, select {
          font-size: 16px !important;
        }
        
        @media screen and (max-width: 767px) {
          input, textarea, select {
            font-size: 16px !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      // 🆕 Limpeza
      document.removeEventListener('focusin', preventZoomOnFocus);
      document.removeEventListener('focusout', restoreAfterBlur);
      window.removeEventListener('orientationchange', updateViewportMeta);
      window.removeEventListener('resize', updateViewportMeta);
      
      // Restaura viewport padrão
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1');
      }
    };
  }, []);
}

// 🆕 Hook alternativo mais simples (se o primeiro não funcionar)
export function useMobileZoomFixSimple() {
  useEffect(() => {
    // Método mais direto: apenas ajusta font-size em inputs
    const adjustInputFontSize = () => {
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach((input: Element) => {
        (input as HTMLElement).style.fontSize = '16px';
      });
    };

    // Aplica imediatamente
    adjustInputFontSize();
    
    // Aplica também quando o DOM mudar (para inputs dinâmicos)
    const observer = new MutationObserver(adjustInputFontSize);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });

    // 🆕 Previne comportamento padrão de zoom no iOS
    const preventZoom = (e: Event) => {
      e.preventDefault();
    };

    // Adiciona listeners para eventos de touch que podem causar zoom
    document.addEventListener('touchstart', preventZoom, { passive: false });
    document.addEventListener('touchmove', preventZoom, { passive: false });
    document.addEventListener('touchend', preventZoom, { passive: false });

    return () => {
      observer.disconnect();
      document.removeEventListener('touchstart', preventZoom);
      document.removeEventListener('touchmove', preventZoom);
      document.removeEventListener('touchend', preventZoom);
    };
  }, []);
}