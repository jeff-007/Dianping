import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { merchantRegisterSchema, MerchantRegisterInput } from '../../lib/validations';
import { AlertCircle, Loader2, Upload, CheckCircle } from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

export default function MerchantRegister() {
  const navigate = useNavigate();
  const loginState = useAuthStore((state) => state.login);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [licenseVerified, setLicenseVerified] = useState(false);
  const [idCardVerified, setIdCardVerified] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<MerchantRegisterInput>({
    resolver: zodResolver(merchantRegisterSchema),
  });

  const mockOCR = async (field: 'licenseUrl' | 'idCardUrl') => {
      return new Promise<void>((resolve) => {
          setTimeout(() => {
              if (field === 'licenseUrl') setLicenseVerified(true);
              if (field === 'idCardUrl') setIdCardVerified(true);
              setValue(field, 'https://via.placeholder.com/300x200?text=Verified+Document');
              resolve();
          }, 1500);
      });
  };

  const onSubmit = async (data: MerchantRegisterInput) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Register User (if not logged in) or just create merchant directly?
      // The previous logic was "Sign up new user as merchant".
      // We'll keep it: Register new user -> Create Merchant Profile
      // Actually, my backend `createMerchant` requires auth token.
      // So the flow should be: Register User -> Login (get token) -> Create Merchant.
      // OR: Single endpoint /api/auth/register-merchant that does both.
      // Current backend `createMerchant` is for authenticated users.
      // So we need to Register & Login first.
      
      // Step 1: Register User
      const authRes = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: 'merchant'
      });
      
      const { token, ...user } = authRes.data;
      loginState(token, user); // Save token to store/localstorage

      // Step 2: Create Merchant Profile
      // We need to attach the token to this request. `api` interceptor handles it if loginState worked.
      // But loginState is sync, so it should be fine.
      await api.post('/merchants', {
        name: data.shopName,
        address: data.shopAddress,
        phone: data.phone,
        // category: ... we need category ID. For now hardcode or optional
        // The form doesn't have category selector yet. I'll omit or pick first.
        latitude: 31.2304, // Mock
        longitude: 121.4737, // Mock
        price_range: 2,
        license_image: data.licenseUrl,
        identity_card_image: data.idCardUrl
      });

      navigate('/auth/login', { state: { message: 'Merchant application submitted! Please login.' } });
      // Or redirect to dashboard directly since we are logged in?
      // navigate('/merchant/dashboard');

    } catch (err: any) {
      console.error('Merchant Registration error:', err);
      setError(err.response?.data?.message || 'Failed to register merchant');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Join as a Merchant
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Grow your business with Dianping
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Info */}
              <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Account Info</h3>
                   <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        {...register('name')}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                        type="tel"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        {...register('phone')}
                    />
                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Email (Optional)</label>
                    <input
                        type="email"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        {...register('email')}
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        {...register('password')}
                    />
                    {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <input
                        type="password"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        {...register('confirmPassword')}
                    />
                    {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
                    </div>
              </div>

              {/* Shop Info */}
              <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Shop Details</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Shop Name</label>
                    <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        {...register('shopName')}
                    />
                    {errors.shopName && <p className="mt-1 text-xs text-red-500">{errors.shopName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Shop Address</label>
                    <textarea
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        {...register('shopAddress')}
                    />
                    {errors.shopAddress && <p className="mt-1 text-xs text-red-500">{errors.shopAddress.message}</p>}
                  </div>

                  {/* Mock OCR Uploads */}
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Business License</label>
                      <div className="mt-1 flex items-center space-x-4">
                          <button
                            type="button"
                            onClick={() => mockOCR('licenseUrl')}
                            className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${licenseVerified ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                          >
                              {licenseVerified ? <CheckCircle className="w-4 h-4 mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                              {licenseVerified ? 'Verified' : 'Upload & Scan'}
                          </button>
                          <input type="hidden" {...register('licenseUrl')} />
                      </div>
                      {errors.licenseUrl && <p className="mt-1 text-xs text-red-500">{errors.licenseUrl.message}</p>}
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-gray-700">ID Card (Legal Rep)</label>
                      <div className="mt-1 flex items-center space-x-4">
                          <button
                            type="button"
                            onClick={() => mockOCR('idCardUrl')}
                            className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${idCardVerified ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                          >
                              {idCardVerified ? <CheckCircle className="w-4 h-4 mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                              {idCardVerified ? 'Verified' : 'Upload & Scan'}
                          </button>
                          <input type="hidden" {...register('idCardUrl')} />
                      </div>
                      {errors.idCardUrl && <p className="mt-1 text-xs text-red-500">{errors.idCardUrl.message}</p>}
                  </div>
              </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
