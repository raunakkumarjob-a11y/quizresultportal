/*
  # Insert Admin User

  1. New Data
    - Insert admin user with email `raunakkumarjob@gmail.com`
  
  2. Security
    - Admin user will be able to login with OTP authentication
*/

INSERT INTO admin_users (email) 
VALUES ('raunakkumarjob@gmail.com')
ON CONFLICT (email) DO NOTHING;