import React, { useState } from 'react';
import { Search, User, Phone, BookOpen, GraduationCap, Award, Mail, Hash, Calendar, FileText } from 'lucide-react';
import { findStudentByPhone } from '../utils/storage';
import { Student } from '../types';
import RecheckForm from './RecheckForm';

const StudentResultForm: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [student, setStudent] = useState<Student | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRecheckForm, setShowRecheckForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const foundStudent = findStudentByPhone(phone.trim());
    setStudent(foundStudent);
    setSearched(true);
    setLoading(false);
  };

  const handleReset = () => {
    setPhone('');
    setStudent(null);
    setSearched(false);
    setShowRecheckForm(false);
  };

  if (showRecheckForm && student) {
    return <RecheckForm student={student} onBack={() => setShowRecheckForm(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Result Portal</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Check your academic results by entering your registered phone number below
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-3">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg transition-all duration-200"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                {loading ? 'Searching...' : 'Check Result'}
              </button>
              
              {searched && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  Search Again
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Results */}
        {searched && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {student ? (
              <div className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Result Found!</h2>
                    <p className="text-gray-600">Here are the student details</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <User className="w-6 h-6 text-gray-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Name</p>
                      <p className="text-lg font-bold text-gray-900">{student.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <BookOpen className="w-6 h-6 text-gray-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Roll Number</p>
                      <p className="text-lg font-bold text-gray-900">{student.roll_number}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <Hash className="w-6 h-6 text-gray-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Section</p>
                      <p className="text-lg font-bold text-gray-900">{student.section}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <Phone className="w-6 h-6 text-gray-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Phone</p>
                      <p className="text-lg font-bold text-gray-900">{student.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <Mail className="w-6 h-6 text-gray-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Email</p>
                      <p className="text-lg font-bold text-gray-900">{student.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <FileText className="w-6 h-6 text-gray-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Enrollment Number</p>
                      <p className="text-lg font-bold text-gray-900">{student.enrollment_number}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <Award className="w-6 h-6 text-gray-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Marks</p>
                      <p className="text-lg font-bold text-gray-900">{student.marks}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <Calendar className="w-6 h-6 text-gray-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Result</p>
                      <p className="text-lg font-bold text-gray-900">{student.result}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <GraduationCap className="w-6 h-6 text-gray-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Percentage</p>
                      <p className="text-lg font-bold text-gray-900">{student.percentage}%</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Award className="w-8 h-8" />
                    <span className="text-sm font-semibold uppercase tracking-wide">Final Result</span>
                  </div>
                  <p className="text-4xl font-bold">{student.result}</p>
                  <p className="text-blue-100 mt-1">Percentage: {student.percentage}%</p>
                </div>

                {/* Recheck Button */}
                <div className="text-center">
                  <button
                    onClick={() => setShowRecheckForm(true)}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mx-auto"
                  >
                    <FileText className="w-5 h-5" />
                    Request Recheck
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    If you have any doubts about your result, click above to submit a recheck request
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">No Record Found</h2>
                <p className="text-gray-600 mb-6">
                  We couldn't find any student record with the phone number <strong>{phone}</strong>
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                  <p className="text-sm text-yellow-800">
                    <strong>Please ensure:</strong>
                  </p>
                  <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                    <li>• You entered the correct phone number</li>
                    <li>• Your phone number is registered in our system</li>
                    <li>• Contact the administration if the issue persists</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contact Information */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Contact Information</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
              <Mail className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Email</p>
                <a href="mailto:raunakkumarjob@gmail.com" className="text-lg font-bold text-blue-600 hover:text-blue-800">
                  raunakkumarjob@gmail.com
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
              <User className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">LinkedIn Profile</p>
                <a 
                  href="https://www.linkedin.com/in/raunak-kumar-766328248/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-lg font-bold text-blue-600 hover:text-blue-800"
                >
                  View Profile
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentResultForm;