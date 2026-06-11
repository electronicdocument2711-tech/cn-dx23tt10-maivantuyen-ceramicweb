/**
 * Debounce function to limit how often a function can fire
 * @param func - Function to debounce
 * @param wait - Delay in milliseconds
 */
function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default debounce;