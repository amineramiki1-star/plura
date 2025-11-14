import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

interface FocusContextType {
  focusedId: string | null;
  focus: (id: string) => void;
  trapFocus: (container: HTMLElement) => void;
  releaseFocus: () => void;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

const findBestCandidate = (
  currentRect: DOMRect,
  candidates: Element[],
  direction: 'up' | 'down' | 'left' | 'right'
) => {
  let bestCandidate: Element | null = null;
  let minDistance = Infinity;

  const currentCenter = {
    x: currentRect.left + currentRect.width / 2,
    y: currentRect.top + currentRect.height / 2,
  };

  for (const candidate of candidates) {
    const candidateRect = candidate.getBoundingClientRect();
    const candidateCenter = {
      x: candidateRect.left + candidateRect.width / 2,
      y: candidateRect.top + candidateRect.height / 2,
    };

    const dx = candidateCenter.x - currentCenter.x;
    const dy = candidateCenter.y - currentCenter.y;

    // Check if the candidate is in the correct general direction.
    let isViable = false;
    switch (direction) {
      case 'up':
        if (dy < 0) isViable = true;
        break;
      case 'down':
        if (dy > 0) isViable = true;
        break;
      case 'left':
        if (dx < 0) isViable = true;
        break;
      case 'right':
        if (dx > 0) isViable = true;
        break;
    }

    if (!isViable) continue;
    
    // Use a weighted distance to prioritize alignment.
    // This heavily penalizes movement perpendicular to the desired direction.
    const distance = (direction === 'left' || direction === 'right') 
      ? Math.abs(dx) + Math.abs(dy) * 3
      : Math.abs(dy) + Math.abs(dx) * 3;

    if (distance < minDistance) {
      minDistance = distance;
      bestCandidate = candidate;
    }
  }

  return bestCandidate;
};


export const FocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [focusedId, setFocusedId] = useState<string | null>('welcome-enter-button');
  const [active, setActive] = useState(true);
  const [focusTrap, setFocusTrap] = useState<HTMLElement | null>(null);
  const [lastFocusedIdBeforeTrap, setLastFocusedIdBeforeTrap] = useState<string | null>(null);

  // Create a ref to hold the latest state values for our stable callbacks.
  const stateRef = useRef({ focusedId, lastFocusedIdBeforeTrap });
  useEffect(() => {
    stateRef.current = { focusedId, lastFocusedIdBeforeTrap };
  }, [focusedId, lastFocusedIdBeforeTrap]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!active) return;
    
    const validKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'];
    if (!validKeys.includes(e.key)) return;
    
    e.preventDefault();
    e.stopPropagation();

    if (e.key === 'Enter') {
      if (focusedId) {
        // FIX: Replaced querySelector generic with type casting to resolve "Untyped function calls" error.
        const target = document.querySelector(`[data-focus-id="${focusedId}"]`) as HTMLElement | null;
        target?.click();
      }
      return;
    }

    const scope = focusTrap || document;
    // FIX: Replaced querySelector generic with type casting to resolve "Untyped function calls" error.
    const current = scope.querySelector(`[data-focus-id="${focusedId}"]`) as HTMLElement | null;
    // FIX: Replaced querySelectorAll generic with type casting to ensure proper typing for focusable elements.
    const allFocusables = Array.from(scope.querySelectorAll('[data-focusable="true"]:not([aria-hidden="true"])')) as HTMLElement[];
    
    const visibleFocusables = allFocusables.filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    });

    if (!current || visibleFocusables.length === 0) {
      if(visibleFocusables.length > 0) {
        const firstFocusableId = visibleFocusables[0].getAttribute('data-focus-id');
        if (firstFocusableId) setFocusedId(firstFocusableId);
      }
      return;
    }

    const direction = e.key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right';
    
    const currentRect = current.getBoundingClientRect();
    const candidates = visibleFocusables.filter(el => el !== current);

    const nextFocusable = findBestCandidate(currentRect, candidates, direction);

    if (nextFocusable) {
      const nextId = nextFocusable.getAttribute('data-focus-id');
      if (nextId) setFocusedId(nextId);
    }

  }, [focusedId, active, focusTrap]);
  
  // A global listener to disable focus nav when inputs are focused.
  useEffect(() => {
      const handleFocusIn = (e: FocusEvent) => {
          if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
              setActive(false);
          }
      };
      const handleFocusOut = (e: FocusEvent) => {
          if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
              setActive(true);
          }
      };
      document.body.addEventListener('focusin', handleFocusIn);
      document.body.addEventListener('focusout', handleFocusOut);
      return () => {
          document.body.removeEventListener('focusin', handleFocusIn);
          document.body.removeEventListener('focusout', handleFocusOut);
      };
  }, []);
  
  // Effect to scroll the currently focused item into view.
  useEffect(() => {
    if (focusedId) {
      const targetElement = document.querySelector<HTMLElement>(`[data-focus-id="${focusedId}"]`);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      }
    }
  }, [focusedId]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const focus = (id: string) => setFocusedId(id);

  const trapFocus = useCallback((container: HTMLElement) => {
    setLastFocusedIdBeforeTrap(stateRef.current.focusedId);
    setFocusTrap(container);

    const closeButton = container.querySelector<HTMLElement>('[data-focus-id*="detail-close-"]');
    if (closeButton) {
      const closeButtonId = closeButton.getAttribute('data-focus-id');
      if (closeButtonId) {
        setFocusedId(closeButtonId);
        return;
      }
    }
    
    const firstFocusable = container.querySelector<HTMLElement>('[data-focusable="true"]:not([aria-hidden="true"])');
    const firstId = firstFocusable?.getAttribute('data-focus-id');
    if (firstId) {
      setFocusedId(firstId);
    }
  }, []);

  const releaseFocus = useCallback(() => {
    setFocusTrap(null);
    if (stateRef.current.lastFocusedIdBeforeTrap) {
      setFocusedId(stateRef.current.lastFocusedIdBeforeTrap);
      setLastFocusedIdBeforeTrap(null);
    }
  }, []);

  return (
    <FocusContext.Provider value={{ focusedId, focus, trapFocus, releaseFocus }}>
      {children}
    </FocusContext.Provider>
  );
};

export const useFocus = () => {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
};

interface UseFocusableProps {
  id: string;
  isCircle?: boolean;
}

export const useFocusable = ({ id, isCircle = false }: UseFocusableProps) => {
  const { focusedId, focus } = useFocus();
  const isFocused = focusedId === id;

  const focusableProps = {
    'data-focusable': 'true',
    'data-focus-id': id,
    onClick: () => focus(id),
    className: `focusable ${isFocused ? `is-focused ${isCircle ? 'focusable-circle' : ''}` : ''}`,
  };

  return { isFocused, focusableProps };
};