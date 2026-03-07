import { useParams } from 'react-router-dom';

export default function Placeholder({ title }: { title: string }) {
  const params = useParams();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <div className="bg-orange-100 text-orange-600 rounded-full p-6 mb-6">
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-500 max-w-md">
        This feature is currently under development. 
        {Object.keys(params).length > 0 && (
          <span className="block mt-2 font-mono text-xs bg-gray-100 p-2 rounded">
            Params: {JSON.stringify(params)}
          </span>
        )}
      </p>
    </div>
  );
}
