import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Settings, LogOut, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';

type MerchantDashboardData = {
  _id?: string;
  id?: string;
  name: string;
  audit_status?: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
};

export default function MerchantDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [merchant, setMerchant] = useState<MerchantDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const checkMerchantStatus = useCallback(async () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    try {
      const { data } = await api.get(`/merchants?owner=${user._id}`);
      if (Array.isArray(data) && data.length > 0) {
        setMerchant(data[0] as MerchantDashboardData);
      } else {
        setMerchant(null);
      }
    } catch (err) {
      console.error('Error fetching merchant:', err);
      setMerchant(null);
    } finally {
      setLoading(false);
    }
  }, [navigate, user]);

  useEffect(() => {
    checkMerchantStatus();
  }, [checkMerchantStatus]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return <div className="p-8">Loading...</div>;

  if (!merchant) return <div className="p-8">Merchant profile not found. Please register as a merchant first.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Store className="h-8 w-8 text-orange-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Merchant Center</span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-sm text-gray-500">
                {merchant.name}
              </span>
              <button onClick={handleLogout} className="text-gray-500 hover:text-gray-700">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Status Banner */}
        <div className="mb-6">
           {merchant.audit_status === 'pending' && (
               <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                   <div className="flex">
                       <Clock className="h-5 w-5 text-yellow-400" />
                       <div className="ml-3">
                           <p className="text-sm text-yellow-700">
                               Your account is pending approval. You have limited access until verified.
                           </p>
                       </div>
                   </div>
               </div>
           )}
           {merchant.audit_status === 'rejected' && (
               <div className="bg-red-50 border-l-4 border-red-400 p-4">
                   <div className="flex">
                       <XCircle className="h-5 w-5 text-red-400" />
                       <div className="ml-3">
                           <p className="text-sm text-red-700">
                               Your application was rejected. Reason: {merchant.rejection_reason || 'Document verification failed.'}
                           </p>
                       </div>
                   </div>
               </div>
           )}
           {merchant.audit_status === 'approved' && (
               <div className="bg-green-50 border-l-4 border-green-400 p-4">
                   <div className="flex">
                       <CheckCircle className="h-5 w-5 text-green-400" />
                       <div className="ml-3">
                           <p className="text-sm text-green-700">
                               Your account is active and verified.
                           </p>
                       </div>
                   </div>
               </div>
           )}
        </div>

        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
             {/* Dashboard Cards */}
             <div className="bg-white overflow-hidden shadow rounded-lg">
                 <div className="p-5">
                     <div className="flex items-center">
                         <div className="flex-shrink-0 bg-orange-100 rounded-md p-3">
                             <Settings className="h-6 w-6 text-orange-600" />
                         </div>
                         <div className="ml-5 w-0 flex-1">
                             <dl>
                                 <dt className="text-sm font-medium text-gray-500 truncate">Shop Settings</dt>
                                 <dd className="flex items-baseline">
                                     <div className="text-lg font-semibold text-gray-900">Manage Info</div>
                                 </dd>
                             </dl>
                         </div>
                     </div>
                 </div>
                 <div className="bg-gray-50 px-5 py-3">
                     <div className="text-sm">
                         <a href="#" className="font-medium text-orange-600 hover:text-orange-900">View details</a>
                     </div>
                 </div>
             </div>
             
             {/* More cards... */}
          </div>
        </div>
      </main>
    </div>
  );
}
