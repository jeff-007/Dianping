import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api'; // Use new API client
import { Category, Merchant } from '../types';
import { Star, MapPin, Utensils, ShoppingBag, Gamepad2, Wrench, Bed, Coffee } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  'utensils': Utensils,
  'restaurant': Utensils,
  'shopping': ShoppingBag,
  'entertainment': Gamepad2,
  'gamepad-2': Gamepad2,
  'service': Wrench,
  'wrench': Wrench,
  'hotel': Bed,
  'bed': Bed,
  'scissors': Coffee 
};

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, merchRes] = await Promise.all([
          api.get('/categories'),
          api.get('/merchants?limit=8') // Assuming backend supports limit or returns all
        ]);
        
        setCategories(Array.isArray(catRes.data) ? catRes.data : []);
        setMerchants(Array.isArray(merchRes.data) ? merchRes.data : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setCategories([]);
        setMerchants([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero / Categories Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((category) => {
            const Icon = iconMap[category.icon] || Utensils;
            const categoryId = category.id || category._id; // Handle both id and _id
            if (!categoryId) return null;
            return (
              <Link
                key={categoryId}
                to={`/search?category=${categoryId}`} // Note: MongoDB uses _id, but we can map it or use id if backend transforms it
                className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 group"
              >
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-3 group-hover:bg-orange-100 transition-colors">
                  <Icon className="w-6 h-6 text-orange-500" />
                </div>
                <span className="font-medium text-gray-700 group-hover:text-orange-600 transition-colors">{category.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Merchants */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Popular Near You</h2>
          <Link to="/search" className="text-orange-500 hover:text-orange-600 font-medium text-sm">View all</Link>
        </div>
        
        {merchants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {merchants.map((merchant) => (
              <Link key={merchant.id || merchant._id} to={`/merchant/${merchant.id || merchant._id}`} className="group block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 h-48 relative overflow-hidden">
                  {merchant.images && merchant.images.length > 0 ? (
                    <img 
                      src={merchant.images[0]} 
                      alt={merchant.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <Utensils className="w-12 h-12 opacity-20" />
                    </div>
                  )}
                  {merchant.verified && (
                    <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Verified
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900 truncate pr-2">{merchant.name}</h3>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <div className="flex items-center text-orange-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="ml-1 text-sm font-bold text-gray-700">{merchant.avg_rating ? merchant.avg_rating.toFixed(1) : 'New'}</span>
                    </div>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="text-sm text-gray-600">
                      {Array(merchant.price_range || 1).fill('¥').join('')}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                    <span className="truncate">{merchant.address}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="inline-block px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md">
                      {/* Note: category might be populated object now */}
                      {merchant.category?.name ?? 'Local'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">No merchants found. Be the first to join!</p>
            <Link to="/merchant/join" className="mt-4 inline-block text-orange-500 font-medium hover:underline">
              Register as a Merchant
            </Link>
          </div>
        )}
      </section>

      {/* Promotional Banner */}
      <section className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Discover the Best Local Experiences</h2>
          <p className="text-orange-100 mb-8 text-lg">Join millions of people who use Dianping to find and book the best restaurants, spas, and local services.</p>
          <div className="flex gap-4">
            <Link to="/auth/register" className="bg-white text-orange-600 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition shadow-lg">
              Get Started
            </Link>
            <Link to="/about" className="px-6 py-3 rounded-full font-bold border-2 border-white/30 hover:bg-white/10 transition">
              Learn More
            </Link>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 bg-white/5 skew-x-12 transform translate-x-20"></div>
      </section>
    </div>
  );
}
