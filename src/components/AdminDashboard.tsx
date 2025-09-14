import React, { useState, useEffect } from 'react';
import { 
  Users, Download, Upload, Plus, Edit, Trash2, 
  LogOut, Search, FileSpreadsheet, AlertCircle,
  CheckCircle, X, Save, FileText, Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getStudents, deleteStudent, 
  generateCSV, parseCSV, updateStudent,
  getRecheckRequests, updateRecheckRequestStatus, replaceAllStudents
} from '../utils/database';
import type { Student, RecheckRequest } from '../lib/supabase';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [recheckRequests, setRecheckRequests] = useState<RecheckRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'students' | 'recheck'>('students');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const studentsData = await getStudents();
    const recheckData = await getRecheckRequests();
    setStudents(studentsData);
    setRecheckRequests(recheckData);
  };

  const showMessage = (type: 'success' | 'error' | 'warning', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phone.includes(searchTerm) ||
    student.roll_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.enrollment_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRequests = recheckRequests.filter(request =>
    request.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.phone.includes(searchTerm) ||
    request.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadCSV = () => {
    const csv = generateCSV(students);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showMessage('success', 'CSV file downloaded successfully!');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      const newStudents = parseCSV(text);
      
      // Replace all existing data with new data
      await replaceAllStudents(newStudents);
      
      await loadData();
      setShowUploadModal(false);
      showMessage('success', `Upload complete! Replaced all data with ${newStudents.length} new records.`);
    } catch (error) {
      showMessage('error', 'Error processing CSV file. Please check the format.');
    }
    setLoading(false);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent({ ...student });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editingStudent) return;

    const saveEdit = async () => {
      const updated = await updateStudent(editingStudent.id, {
        name: editingStudent.name,
        roll_number: editingStudent.roll_number,
        section: editingStudent.section,
        phone: editingStudent.phone,
        email: editingStudent.email,
        enrollment_number: editingStudent.enrollment_number,
        marks: editingStudent.marks,
        result: editingStudent.result,
        percentage: editingStudent.percentage
      });

      if (updated) {
        await loadData();
        setShowEditModal(false);
        setEditingStudent(null);
        showMessage('success', 'Student record updated successfully!');
      } else {
        showMessage('error', 'Failed to update student record.');
      }
    };

    saveEdit();
  };

  const handleDeleteStudent = async (student: Student) => {
    if (window.confirm(`Are you sure you want to delete ${student.name}'s record?`)) {
      const deleted = await deleteStudent(student.id);
      if (deleted) {
        await loadData();
        showMessage('success', `${student.name}'s record has been deleted.`);
      } else {
        showMessage('error', 'Failed to delete student record.');
      }
    }
  };

  const handleRecheckAction = async (requestId: string, action: 'approved' | 'rejected') => {
    const updated = await updateRecheckRequestStatus(requestId, action);
    if (updated) {
      await loadData();
      showMessage('success', `Recheck request ${action} successfully!`);
    } else {
      showMessage('error', `Failed to ${action} recheck request.`);
    }
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
            message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
            'bg-yellow-50 border border-yellow-200 text-yellow-800'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
             message.type === 'error' ? <X className="w-5 h-5" /> :
             <AlertCircle className="w-5 h-5" />}
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('students')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'students'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Students ({students.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('recheck')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'recheck'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Recheck Requests ({recheckRequests.filter(r => r.status === 'pending').length})
                </div>
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'students' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Percentage</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {students.length ? Math.round(students.reduce((sum, s) => sum + s.percentage, 0) / students.length) : 0}%
                    </p>
                  </div>
                  <FileSpreadsheet className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pass Count</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {students.filter(s => s.result.toLowerCase().includes('pass')).length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    <Upload className="w-4 h-4" />
                    Upload CSV
                  </button>
                  
                  <button
                    onClick={handleDownloadCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Download className="w-4 h-4" />
                    Download CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.roll_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.section}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.enrollment_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.marks}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            student.result.toLowerCase().includes('pass') ? 'bg-green-100 text-green-800' :
                            student.result.toLowerCase().includes('fail') ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {student.result}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.percentage}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditStudent(student)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredStudents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No students found matching your search.' : 'No students in the database. Upload a CSV file to get started.'}
              </div>
            )}
          </>
        )}

        {activeTab === 'recheck' && (
          <>
            {/* Search for recheck requests */}
            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search recheck requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Recheck Requests */}
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{request.studentName}</h3>
                      <p className="text-sm text-gray-600">Roll: {request.rollNumber} | Phone: {request.phone}</p>
                      <p className="text-sm text-gray-600">Email: {request.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {new Date(request.submittedAt).toLocaleDateString()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Reason for Recheck:</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{request.reason}</p>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleRecheckAction(request.id, 'approved')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleRecheckAction(request.id, 'rejected')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredRequests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No recheck requests found matching your search.' : 'No recheck requests submitted yet.'}
              </div>
            )}
          </>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload CSV File</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                Upload a CSV file with columns: Name, Roll Number, Section, Phone, Email, Enrollment Number, Marks, Result, Percentage
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This will replace all existing student data with the new CSV data.
                </p>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                disabled={loading}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Student</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                <input
                  type="text"
                  value={editingStudent.roll_number}
                  onChange={(e) => setEditingStudent({ ...editingStudent, roll_number: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <input
                  type="text"
                  value={editingStudent.section}
                  onChange={(e) => setEditingStudent({ ...editingStudent, section: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={editingStudent.phone}
                  onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingStudent.email}
                  onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Number</label>
                <input
                  type="text"
                  value={editingStudent.enrollment_number}
                  onChange={(e) => setEditingStudent({ ...editingStudent, enrollment_number: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
                <input
                  type="number"
                  value={editingStudent.marks}
                  onChange={(e) => setEditingStudent({ ...editingStudent, marks: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Result</label>
                <input
                  type="text"
                  value={editingStudent.result}
                  onChange={(e) => setEditingStudent({ ...editingStudent, result: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Percentage (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingStudent.percentage}
                  onChange={(e) => setEditingStudent({ ...editingStudent, percentage: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingStudent(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
