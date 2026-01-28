export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          <div className="w-32 h-6 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Author Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="w-32 h-6 bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="w-48 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="w-24 h-10 bg-gray-200 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Post Content Skeleton */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
          <div className="w-3/4 h-8 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="space-y-3">
            <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-2/3 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="mt-6 w-full h-64 bg-gray-200 rounded-xl animate-pulse" />
        </div>

        {/* Engagement Bar Skeleton */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-24 h-10 bg-gray-200 rounded-xl animate-pulse" />
            <div className="w-24 h-10 bg-gray-200 rounded-xl animate-pulse" />
            <div className="w-24 h-10 bg-gray-200 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Comments Skeleton */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="w-32 h-6 bg-gray-200 rounded mb-4 animate-pulse" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
              <div className="flex-1">
                <div className="w-24 h-4 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="w-full h-4 bg-gray-200 rounded mb-1 animate-pulse" />
                <div className="w-2/3 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
