import React, { useState } from 'react';
import { ArrowLeft, Send, FileText, User, Phone, Mail, BookOpen } from 'lucide-react';
import type { Student } from '../lib/supabase';
import { addRecheckRequest } from '../utils/database';

interface RecheckFormProps {
  student: Student;
  onBack: () => void;
}

const RecheckForm: React.FC<RecheckFormProps> = ({ student, onBack }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    addRecheckRequest({
      studentName: student.name,
      phone: student.phone,
      email: student.email,
      rollNumber: student.roll_number,
      reason: reason.trim()
    });

    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Submitted Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your recheck request has been submitted and is now under review. You will be contacted via email or phone once the review is complete.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                <strong>What happens next?</strong>
              </p>
              <ul className="text-sm text-green-700 mt-2 space-y-1 text-left">
                <li>• Your request will be reviewed by the academic team</li>
                <li>• You'll receive an update within 3-5 working days</li>
                <li>• If approved, your result will be rechecked and updated</li>
              </ul>
            </div>
            <button
              onClick={onBack}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Results
          </button>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 rounded-full mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Recheck</h1>
          <p className="text-gray-600">Submit your recheck request with detailed reason</p>
        </div>

        {/* Student Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-semibold text-gray-900">{student.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Roll Number</p>
                <p className="font-semibold text-gray-900">{student.roll_number}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-semibold text-gray-900">{student.phone}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-semibold text-gray-900">{student.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recheck Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="reason" className="block text-sm font-semibold text-gray-700 mb-3">
                Reason for Recheck Request *
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all duration-200"
                placeholder="Please provide a detailed reason for your recheck request. Include specific subjects or areas where you believe there might be an error in evaluation..."
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Minimum 50 characters required. Be specific about your concerns.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Important Notes:</strong>
              </p>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li>• Recheck requests are processed within 3-5 working days</li>
                <li>• You will be notified via email and phone about the status</li>
                <li>• Provide clear and specific reasons for better processing</li>
                <li>• False or frivolous requests may result in penalties</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading || reason.trim().length < 50}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              {loading ? 'Submitting Request...' : 'Submit Recheck Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecheckForm;