// instructor.ts
export interface Instructor {
  id: number;
  name: string;
  email: string;
  car: string;
  status: 'online' | 'offline';
}
/*
export const instructor: Instructor[] = [
  { id: 1, name: "Horváth Géza", email: "geza@drivetime.hu", car: "Volkswagen Golf VII", status: 'online' },
  { id: 2, name: "Kovács Sándor", email: "sandor@drivetime.hu", car: "Ford Focus", status: 'online' },
  { id: 3, name: "Szabó László", email: "laszlo@drivetime.hu", car: "Toyota Corolla", status: 'offline' },
  { id: 4, name: "Tóth Bertalan", email: "berci@drivetime.hu", car: "Skoda Octavia", status: 'online'},
  { id: 5, name: "Kiss Béla", email: "bela@drivetime.hu", car: "Toyota Yaris", status: 'online'},
  { id: 6, name: "Pál Ádám", email: "adam@drivetime.hu", car: "Opel Corsa", status: 'offline'},
]; */

export async function getInstructors() {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3000/user/getinstructors', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) return [];
    return await response.json();
}