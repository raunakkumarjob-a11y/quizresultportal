export interface Student {
  id: number;
  name: string;
  roll_number: string;
  section: string;
  phone: string;
  email: string;
  enrollment_number: string;
  marks: number;
  result: string;
  percentage: number;
}

export interface Admin {
  email: string;
  password: string;
  otp?: string;
  otpExpiry?: number;
}

export interface RecheckRequest {
  id: number;
  studentName: string;
  phone: string;
  email: string;
  rollNumber: string;
  reason: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}