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

/* Generate string of 4 random alphanumeric characters for the Food Sample code 
helper function */
const generateRandomString = () => {
  let text = "";
  let str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let i = 0; i < 4; i++) {
    text += str.charAt(Math.floor(Math.random() * str.length));
  }
  return text;
};

module.exports = {
  formatDate,
  formatMilitaryToStandardTime,
  generateRandomString
};
