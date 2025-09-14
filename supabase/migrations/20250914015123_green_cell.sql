/*
  # Create students and admin tables

  1. New Tables
    - `students`
      - `id` (uuid, primary key)
      - `name` (text)
      - `roll_number` (text)
      - `section` (text)
      - `phone` (text, unique)
      - `email` (text)
      - `enrollment_number` (text)
      - `marks` (integer)
      - `result` (text)
      - `percentage` (decimal)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `admin_users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `otp` (text)
      - `otp_expiry` (timestamp)
      - `created_at` (timestamp)
    - `recheck_requests`
      - `id` (uuid, primary key)
      - `student_name` (text)
      - `phone` (text)
      - `email` (text)
      - `roll_number` (text)
      - `reason` (text)
      - `status` (text)
      - `submitted_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  roll_number text NOT NULL,
  section text NOT NULL,
  phone text UNIQUE NOT NULL,
  email text NOT NULL,
  enrollment_number text NOT NULL,
  marks integer NOT NULL DEFAULT 0,
  result text NOT NULL,
  percentage decimal(5,2) NOT NULL DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  otp text,
  otp_expiry timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create recheck_requests table
CREATE TABLE IF NOT EXISTS recheck_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  roll_number text NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  submitted_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE recheck_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for students table (public read access for student portal)
CREATE POLICY "Students can be read by anyone"
  ON students
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Students can be managed by authenticated users"
  ON students
  FOR ALL
  TO authenticated
  USING (true);

-- Create policies for admin_users table
CREATE POLICY "Admin users can be managed by authenticated users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (true);

-- Create policies for recheck_requests table
CREATE POLICY "Recheck requests can be read by anyone"
  ON recheck_requests
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Recheck requests can be created by anyone"
  ON recheck_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Recheck requests can be updated by authenticated users"
  ON recheck_requests
  FOR UPDATE
  TO authenticated
  USING (true);

-- Insert default admin user
INSERT INTO admin_users (email) 
VALUES ('raunakkumarjob@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for students table
CREATE TRIGGER update_students_updated_at 
    BEFORE UPDATE ON students 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();