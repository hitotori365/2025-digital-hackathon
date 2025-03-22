export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const createProcessLock = () => {
  let isProcessing = false;
  return async (process: () => Promise<void>) => {
    if (isProcessing) return;
    isProcessing = true;
    try {
      await process();
    } finally {
      isProcessing = false;
    }
  };
}; 