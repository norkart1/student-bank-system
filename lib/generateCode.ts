export function generateStudentCode(fullName: string): string {
  const initials = fullName
    .split(' ')
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
  
  const randomNumbers = Math.floor(1000 + Math.random() * 8000).toString();
  
  return `${initials}-${randomNumbers}`;
}
