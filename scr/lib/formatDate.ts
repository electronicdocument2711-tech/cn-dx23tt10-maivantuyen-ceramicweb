/**
 * Format date to readable string
 * @param date - Date object or date string
 * @param options - Intl.DateTimeFormat options
 */
function formatDate(
  date: Date | string, 
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string {
  const dateObject = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObject.getTime())) {
    return 'Invalid Date';
  }
  
  return new Intl.DateTimeFormat('en-US', options).format(dateObject);
}

export default formatDate;