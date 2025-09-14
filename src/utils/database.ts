import { supabase } from '../lib/supabase';
import type { Student, AdminUser, RecheckRequest } from '../lib/supabase';

// Student operations
export const getStudents = async (): Promise<Student[]> => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching students:', error);
    return [];
  }
  
  return data || [];
};

export const findStudentByPhone = async (phone: string): Promise<Student | null> => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('phone', phone.trim())
    .single();
  
  if (error) {
    console.error('Error finding student:', error);
    return null;
  }
  
  return data;
};

export const addStudent = async (student: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student | null> => {
  const { data, error } = await supabase
    .from('students')
    .insert([student])
    .select()
    .single();
  
  if (error) {
    console.error('Error adding student:', error);
    return null;
  }
  
  return data;
};

export const updateStudent = async (id: string, student: Partial<Omit<Student, 'id' | 'created_at' | 'updated_at'>>): Promise<Student | null> => {
  const { data, error } = await supabase
    .from('students')
    .update(student)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating student:', error);
    return null;
  }
  
  return data;
};

export const deleteStudent = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting student:', error);
    return false;
  }
  
  return true;
};

export const replaceAllStudents = async (newStudents: Omit<Student, 'id' | 'created_at' | 'updated_at'>[]): Promise<Student[]> => {
  // First, delete all existing students
  const { error: deleteError } = await supabase
    .from('students')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
  
  if (deleteError) {
    console.error('Error deleting existing students:', deleteError);
    return [];
  }
  
  // Then insert new students
  const { data, error: insertError } = await supabase
    .from('students')
    .insert(newStudents)
    .select();
  
  if (insertError) {
    console.error('Error inserting new students:', insertError);
    return [];
  }
  
  return data || [];
};

// Admin operations
export const getAdmin = async (email: string): Promise<AdminUser | null> => {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) {
    console.error('Error fetching admin:', error);
    return null;
  }
  
  return data;
};

export const updateAdminOTP = async (email: string, otp: string, otpExpiry: string): Promise<boolean> => {
  const { error } = await supabase
    .from('admin_users')
    .update({ otp, otp_expiry: otpExpiry })
    .eq('email', email);
  
  if (error) {
    console.error('Error updating admin OTP:', error);
    return false;
  }
  
  return true;
};

export const verifyAdminOTP = async (email: string, inputOTP: string): Promise<boolean> => {
  const admin = await getAdmin(email);
  if (!admin || !admin.otp || !admin.otp_expiry) return false;
  
  const now = new Date();
  const expiry = new Date(admin.otp_expiry);
  
  if (now > expiry) return false;
  
  return admin.otp === inputOTP;
};

// Recheck request operations
export const getRecheckRequests = async (): Promise<RecheckRequest[]> => {
  const { data, error } = await supabase
    .from('recheck_requests')
    .select('*')
    .order('submitted_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching recheck requests:', error);
    return [];
  }
  
  return data || [];
};

export const addRecheckRequest = async (request: Omit<RecheckRequest, 'id' | 'submitted_at' | 'status'>): Promise<RecheckRequest | null> => {
  const { data, error } = await supabase
    .from('recheck_requests')
    .insert([{ ...request, status: 'pending' }])
    .select()
    .single();
  
  if (error) {
    console.error('Error adding recheck request:', error);
    return null;
  }
  
  return data;
};

export const updateRecheckRequestStatus = async (id: string, status: 'approved' | 'rejected'): Promise<boolean> => {
  const { error } = await supabase
    .from('recheck_requests')
    .update({ status })
    .eq('id', id);
  
  if (error) {
    console.error('Error updating recheck request:', error);
    return false;
  }
  
  return true;
};

// CSV utilities
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

export const parseCSV = (csvContent: string): Omit<Student, 'id' | 'created_at' | 'updated_at'>[] => {
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