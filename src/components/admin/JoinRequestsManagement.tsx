import React, { useState } from 'react';
import { 
  UserPlus, 
  Check, 
  X, 
  Clock, 
  Search, 
  Filter,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  Eye,
  MoreHorizontal
} from 'lucide-react';

interface JoinRequest {
  id: number;
  name: string;
  email: string;
  phone: string;
  ministry: string;
  message: string;
  experience: string;
  availability: string;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewDate?: string;
  reviewNotes?: string;
}

const JoinRequestsManagement: React.FC = () => {
  const [requests, setRequests] = useState<JoinRequest[]>([
    {
      id: 1,
      name: 'Alice Thompson',
      email: 'alice.thompson@email.com',
      phone: '(555) 123-4567',
      ministry: 'Worship Team',
      message: 'I have been playing piano for 15 years and would love to serve in worship ministry.',
      experience: 'Piano - 15 years, Vocals - 8 years',
      availability: 'Sundays, Wednesday evenings',
      submittedDate: '2024-01-18',
      status: 'pending'
    },
    {
      id: 2,
      name: 'Robert Martinez',
      email: 'robert.martinez@email.com',
      phone: '(555) 234-5678',
      ministry: 'Children\'s Ministry',
      message: 'I love working with kids and have experience in Sunday school teaching.',
      experience: 'Sunday school teacher - 3 years',
      availability: 'Sundays, occasional weekdays',
      submittedDate: '2024-01-17',
      status: 'pending'
    },
    {
      id: 3,
      name: 'Jennifer Lee',
      email: 'jennifer.lee@email.com',
      phone: '(555) 345-6789',
      ministry: 'Outreach Team',
      message: 'I feel called to serve the community and help those in need.',
      experience: 'Volunteer at local shelter - 2 years',
      availability: 'Weekends, flexible weekdays',
      submittedDate: '2024-01-16',
      status: 'approved',
      reviewedBy: 'Pastor John Smith',
      reviewDate: '2024-01-19',
      reviewNotes: 'Great heart for service, approved for outreach team.'
    },
    {
      id: 4,
      name: 'Mark Johnson',
      email: 'mark.johnson@email.com',
      phone: '(555) 456-7890',
      ministry: 'Prayer Warriors',
      message: 'I have a strong prayer life and want to intercede for our community.',
      experience: 'Prayer ministry - 5 years',
      availability: 'Friday evenings, early mornings',
      submittedDate: '2024-01-15',
      status: 'pending'
    },
    {
      id: 5,
      name: 'Lisa Brown',
      email: 'lisa.brown@email.com',
      phone: '(555) 567-8901',
      ministry: 'Worship Team',
      message: 'I play guitar and sing, looking to serve in worship ministry.',
      experience: 'Guitar - 10 years, Worship leading - 2 years',
      availability: 'Sundays only',
      submittedDate: '2024-01-14',
      status: 'rejected',
      reviewedBy: 'Sarah Johnson',
      reviewDate: '2024-01-18',
      reviewNotes: 'Currently at capacity for guitar players. Suggested to reapply in 6 months.'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMinistry, setFilterMinistry] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const ministries = ['All', 'Worship Team', 'Children\'s Ministry', 'Outreach Team', 'Prayer Warriors', 'Youth Ministry'];
  const statuses = ['All', 'pending', 'approved', 'rejected'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMinistryColor = (ministry: string) => {
    switch (ministry) {
      case 'Worship Team': return 'bg-purple-100 text-purple-800';
      case 'Children\'s Ministry': return 'bg-blue-100 text-blue-800';
      case 'Outreach Team': return 'bg-green-100 text-green-800';
      case 'Prayer Warriors': return 'bg-pink-100 text-pink-800';
      case 'Youth Ministry': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMinistry = filterMinistry === 'All' || request.ministry === filterMinistry;
    const matchesStatus = filterStatus === 'All' || request.status === filterStatus;
    return matchesSearch && matchesMinistry && matchesStatus;
  });

  const handleApprove = (id: number, notes: string) => {
    setRequests(requests.map(request => 
      request.id === id 
        ? { 
            ...request, 
            status: 'approved',
            reviewedBy: 'Admin User',
            reviewDate: new Date().toISOString().split('T')[0],
            reviewNotes: notes
          }
        : request
    ));
  };

  const handleReject = (id: number, notes: string) => {
    setRequests(requests.map(request => 
      request.id === id 
        ? { 
            ...request, 
            status: 'rejected',
            reviewedBy: 'Admin User',
            reviewDate: new Date().toISOString().split('T')[0],
            reviewNotes: notes
          }
        : request
    ));
  };

  const ReviewModal = ({ request, onApprove, onReject, onClose }: {
    request: JoinRequest;
    onApprove: (notes: string) => void;
    onReject: (notes: string) => void;
    onClose: () => void;
  }) => {
    const [notes, setNotes] = useState('');
    const [action, setAction] = useState<'approve' | 'reject' | null>(null);

    const handleSubmit = () => {
      if (action === 'approve') {
        onApprove(notes);
      } else if (action === 'reject') {
        onReject(notes);
      }
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Review Join Request</h3>
          
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Applicant Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Name</p>
                  <p className="text-gray-800">{request.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Ministry</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMinistryColor(request.ministry)}`}>
                    {request.ministry}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-gray-800">{request.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Phone</p>
                  <p className="text-gray-800">{request.phone}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Application Details</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Message</p>
                  <p className="text-gray-800">{request.message}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Experience</p>
                  <p className="text-gray-800">{request.experience}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Availability</p>
                  <p className="text-gray-800">{request.availability}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Review Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add your review notes here..."
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setAction('approve');
                  handleSubmit();
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center"
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </button>
              <button
                onClick={() => {
                  setAction('reject');
                  handleSubmit();
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center"
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </button>
              <button
                onClick={onClose}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RequestDetailModal = ({ request, onClose }: {
    request: JoinRequest;
    onClose: () => void;
  }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Request Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Name</p>
                <p className="text-gray-800 font-medium">{request.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Ministry</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMinistryColor(request.ministry)}`}>
                  {request.ministry}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Submitted</p>
                <p className="text-gray-800">{request.submittedDate}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Contact Information</p>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{request.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{request.phone}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Message</p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-800">{request.message}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Experience</p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-800">{request.experience}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Availability</p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-800">{request.availability}</p>
              </div>
            </div>

            {request.reviewNotes && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Review Notes</p>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-gray-800">{request.reviewNotes}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Reviewed by {request.reviewedBy} on {request.reviewDate}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Join Requests Management</h2>
        <p className="text-gray-600">Review and manage ministry join requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-yellow-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-900">
                {requests.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Approved</p>
              <p className="text-3xl font-bold text-green-900">
                {requests.filter(r => r.status === 'approved').length}
              </p>
            </div>
            <Check className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Rejected</p>
              <p className="text-3xl font-bold text-red-900">
                {requests.filter(r => r.status === 'rejected').length}
              </p>
            </div>
            <X className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total</p>
              <p className="text-3xl font-bold text-blue-900">{requests.length}</p>
            </div>
            <UserPlus className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={filterMinistry}
              onChange={(e) => setFilterMinistry(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {ministries.map(ministry => (
                <option key={ministry} value={ministry}>{ministry}</option>
              ))}
            </select>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'All' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div key={request.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-800">{request.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMinistryColor(request.ministry)}`}>
                    {request.ministry}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700 mb-3">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-blue-500" />
                    {request.email}
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-blue-500" />
                    {request.phone}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    {request.submittedDate}
                  </div>
                </div>
                
                <p className="text-gray-600 mb-2">{request.message}</p>
                <p className="text-sm text-gray-500">Experience: {request.experience}</p>
              </div>

              <div className="flex items-center space-x-2">
                {request.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowReviewModal(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm"
                    >
                      Review
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedRequest(request)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>

            {request.reviewNotes && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-gray-700">{request.reviewNotes}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Reviewed by {request.reviewedBy} on {request.reviewDate}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modals */}
      {showReviewModal && selectedRequest && (
        <ReviewModal
          request={selectedRequest}
          onApprove={(notes) => handleApprove(selectedRequest.id, notes)}
          onReject={(notes) => handleReject(selectedRequest.id, notes)}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedRequest(null);
          }}
        />
      )}

      {selectedRequest && !showReviewModal && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
};

export default JoinRequestsManagement;