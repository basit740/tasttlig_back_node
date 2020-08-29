// Date formatting helper function
const formatDate = (event) => {
  const utcDate = new Date(event);
  const options = { month: "short", day: "2-digit", year: "numeric" };
  const standardDate = new Date(
    utcDate.getTime() + Math.abs(utcDate.getTimezoneOffset() * 60000)
  ).toLocaleDateString([], options);
  return standardDate;
};

// Format military to standard time helper function
const formatMilitaryToStandardTime = (event) => {
  const militaryHours = parseInt(event.substring(0, 2));
  const standardHours = ((militaryHours + 11) % 12) + 1;
  const amPm = militaryHours > 11 ? "PM" : "AM";
  const minutes = event.substring(2, 5);
  const standardTime = `${standardHours}${minutes} ${amPm}`;
  return standardTime;
};

module.exports = {
  formatDate,
  formatMilitaryToStandardTime
};
