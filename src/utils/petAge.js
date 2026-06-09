export function formatPetAge(birthDate) {
  if (!birthDate) return "-";

  const birthday = new Date(birthDate);

  if (Number.isNaN(birthday.getTime())) return "-";

  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > birthday.getMonth() ||
    (today.getMonth() === birthday.getMonth() &&
      today.getDate() >= birthday.getDate());

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  return `${Math.max(0, age)}세`;
}
