import { Student, Admin, RecheckRequest } from '../types';

const STUDENTS_KEY = 'result_portal_students';
const ADMIN_KEY = 'result_portal_admin';
const RECHECK_KEY = 'result_portal_recheck_requests';

// Default admin credentials
const defaultAdmin: Admin = {
  email: 'raunakkumarjob@gmail.com',
  password: 'admin123'
};

export const initializeData = () => {
  // Initialize with empty students array
  if (!localStorage.getItem(STUDENTS_KEY)) {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(ADMIN_KEY)) {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(defaultAdmin));
  }
  if (!localStorage.getItem(RECHECK_KEY)) {
    localStorage.setItem(RECHECK_KEY, JSON.stringify([]));
  }
};

export const getStudents = (): Student[] => {
  const data = localStorage.getItem(STUDENTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveStudents = (students: Student[]) => {
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
};

export const getAdmin = (): Admin => {
  const data = localStorage.getItem(ADMIN_KEY);
  return data ? JSON.parse(data) : defaultAdmin;
};

export const saveAdmin = (admin: Admin) => {
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
};

export const getRecheckRequests = (): RecheckRequest[] => {
  const data = localStorage.getItem(RECHECK_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveRecheckRequests = (requests: RecheckRequest[]) => {
  localStorage.setItem(RECHECK_KEY, JSON.stringify(requests));
};

export const addRecheckRequest = (request: Omit<RecheckRequest, 'id' | 'submittedAt' | 'status'>) => {
  const requests = getRecheckRequests();
  const newRequest: RecheckRequest = {
    ...request,
    id: Date.now(),
    submittedAt: new Date().toISOString(),
    status: 'pending'
  };
  requests.push(newRequest);
  saveRecheckRequests(requests);
  return newRequest;
};

export const findStudentByPhone = (phone: string): Student | null => {
  const students = getStudents();
  return students.find(student => student.phone === phone) || null;
};

export const addStudent = (student: Omit<Student, 'id'>) => {
  const students = getStudents();
  const newStudent = { ...student, id: Date.now() };
  students.push(newStudent);
  saveStudents(students);
  return newStudent;
};

export const updateStudent = (id: number, updatedStudent: Omit<Student, 'id'>) => {
  const students = getStudents();
  const index = students.findIndex(student => student.id === id);
  if (index !== -1) {
    students[index] = { ...updatedStudent, id };
    saveStudents(students);
    return students[index];
  }
  return null;
};

export const deleteStudent = (id: number) => {
  const students = getStudents();
  const filteredStudents = students.filter(student => student.id !== id);
  saveStudents(filteredStudents);
};

// Replace all existing data with new CSV data
export const replaceAllStudents = (newStudents: Omit<Student, 'id'>[]) => {
  const studentsWithIds = newStudents.map((student, index) => ({
    ...student,
    id: Date.now() + index
  }));
  saveStudents(studentsWithIds);
  return studentsWithIds;
};

export const generateCSV = (students: Student[]): string => {
  const headers = ['Name', 'Roll Number', 'Section', 'Phone', 'Email', 'Enrollment Number', 'Marks', 'Result', 'Percentage'];
  const rows = students.map(student => [
    student.name,
    student.roll_number,
    student.section,
    student.phone,
    student.email,
    student.enrollment_number,
    student.marks,
    student.result,
    student.percentage
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

export const parseCSV = (csvContent: string): Omit<Student, 'id'>[] => {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    return {
      name: values[headers.indexOf('name')] || '',
      roll_number: values[headers.indexOf('roll number') >= 0 ? headers.indexOf('roll number') : headers.indexOf('roll_number')] || '',
      section: values[headers.indexOf('section')] || '',
      phone: values[headers.indexOf('phone')] || '',
      email: values[headers.indexOf('email')] || '',
      enrollment_number: values[headers.indexOf('enrollment number') >= 0 ? headers.indexOf('enrollment number') : headers.indexOf('enrollment_number')] || '',
      marks: parseInt(values[headers.indexOf('marks')]) || 0,
      result: values[headers.indexOf('result')] || '',
      percentage: parseFloat(values[headers.indexOf('percentage')]) || 0
    };
  });
};

// OTP utilities
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (email: string, otp: string): Promise<boolean> => {
  // Simulate OTP sending - in real app, integrate with email service
  console.log(`OTP ${otp} sent to ${email}`);
  // For demo purposes, show OTP in alert
  alert(`Demo OTP for ${email}: ${otp}`);
  return true;
};

export const verifyOTP = (inputOTP: string): boolean => {
  const admin = getAdmin();
  if (!admin.otp || !admin.otpExpiry) return false;
  
  const now = Date.now();
  if (now > admin.otpExpiry) return false;
  
  return admin.otp === inputOTP;
};

export const setOTP = (otp: string) => {
  const admin = getAdmin();
  admin.otp = otp;
  admin.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
  saveAdmin(admin);
};