export const getBangkokDate = (dateInput = new Date()) => {
  if (!dateInput) return '';
  if (typeof dateInput === 'string' && dateInput.includes(' ') && !dateInput.includes('T')) {
    return dateInput.split(' ')[0];
  }
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  const options = { timeZone: 'Asia/Bangkok', year: 'numeric', month: 'numeric', day: 'numeric' };
  const formatter = new Intl.DateTimeFormat('en-GB', options);
  const parts = formatter.formatToParts(date);
  const day = parts.find(p => p.type === 'day').value.padStart(2, '0');
  const month = parts.find(p => p.type === 'month').value.padStart(2, '0');
  const year = parts.find(p => p.type === 'year').value;
  return `${year}-${month}-${day}`;
};